import sqlite3
import json
import hashlib
import collections
from pathlib import Path
from datetime import datetime

RUN_DIR = Path('jsons/organized/20260202144049_resplit_20260202154124')
OUT_ROOT = Path('jsons') / 'foundry_compendiums'
REPORT_DIR = Path('jsons') / 'reports'
OUT_ROOT.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# map source names to pack types
TYPE_MAP = {
    'foundry_journals.json': 'JournalEntry',
    'monsters.json': 'Actor',
    'spells.json': 'Item',
}

# utility: deterministic 16-char lowercase hex id from provenance
def make_det_id(orig_id, src, fpath, idx, used_ids):
    base = f"{orig_id or ''}|{src}|{fpath}|{idx}"
    h = hashlib.sha256(base.encode('utf-8')).hexdigest()
    # try progressively longer prefixes if collision
    for length in (16, 20, 24, 32):
        cand = h[:length]
        if cand not in used_ids:
            return cand
    # fallback: append counter until unique
    i = 0
    while True:
        cand = (h + str(i))[:32]
        if cand not in used_ids:
            return cand
        i += 1

created = []
duplicates_map = collections.defaultdict(list)  # orig_id -> list of new ids
for manifest in RUN_DIR.rglob('manifest_*.json'):
    try:
        src = manifest.parent.name if manifest.parent.is_dir() else manifest.stem
        print('Creating compendium for source:', src)
        m = json.loads(manifest.read_text(encoding='utf-8'))
        items = []
        # collect items with provenance
        for fe in m.get('files', []):
            fpath = Path(fe.get('file'))
            if not fpath.exists():
                print('  Missing file, skipping', fpath)
                continue
            try:
                text = fpath.read_text(encoding='utf-8')
            except Exception:
                try:
                    text = fpath.read_text(encoding='cp1252')
                except Exception:
                    text = fpath.read_text(encoding='latin-1')
            text = text.strip()
            if not text:
                continue
            try:
                data = json.loads(text)
                if isinstance(data, dict):
                    data = [data]
                for i, it in enumerate(data):
                    items.append({'item': it, 'file': str(fpath), 'index': i})
            except Exception:
                # try ndjson
                for i, line in enumerate(text.splitlines()):
                    line=line.strip()
                    if not line: continue
                    try:
                        it = json.loads(line)
                        items.append({'item': it, 'file': str(fpath), 'index': i})
                    except Exception:
                        print('  Skipping unparsable line in', fpath)
        if not items:
            print('  No items imported for', src)
            continue
        outdir = OUT_ROOT / src
        outdir.mkdir(parents=True, exist_ok=True)
        dbpath = outdir / f'{src}.db'
        if dbpath.exists():
            dbpath.unlink()
        conn = sqlite3.connect(str(dbpath))
        cur = conn.cursor()
        cur.execute('CREATE TABLE data (id TEXT PRIMARY KEY, type TEXT, name TEXT, data TEXT)')
        pack_type = TYPE_MAP.get(src, 'Item')
        inserted = 0
        used_ids = set()
        for rec in items:
            it = rec['item']
            fpath = rec['file']
            idx = rec['index']
            orig_id = it.get('_id') or it.get('id') or ''
            # create deterministic unique id for every occurrence
            new_id = make_det_id(orig_id, src, fpath, idx, used_ids)
            used_ids.add(new_id)
            # preserve original id in flags
            flags = it.get('flags') or {}
            flags['orig_id'] = orig_id
            it['flags'] = flags
            it['_id'] = new_id
            name = it.get('name') or it.get('title') or ''
            doc = json.dumps(it, ensure_ascii=False)
            try:
                cur.execute('INSERT INTO data (id, type, name, data) VALUES (?, ?, ?, ?)', (new_id, pack_type, name, doc))
                inserted += 1
            except Exception as e:
                print('  Insert error for', new_id, '->', e)
            # record mapping
            duplicates_map[orig_id].append({'new_id': new_id, 'file': fpath, 'index': idx})
        conn.commit()
        conn.close()
        created.append({'source': src, 'db': str(dbpath), 'count': inserted, 'total_seen': len(items)})
        print(f'  Wrote {inserted} items -> {dbpath}')
    except Exception as e:
        print('Error processing manifest', manifest, '->', e)

# write duplicates/preservation map
map_path = REPORT_DIR / 'duplicates_preserved_map_resplit.json'
map_path.write_text(json.dumps(duplicates_map, indent=2, ensure_ascii=False), encoding='utf-8')

index = {'created_on': datetime.utcnow().isoformat(), 'packs': created, 'duplicates_map': str(map_path)}
idxpath = OUT_ROOT / 'index_resplit.json'
idxpath.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding='utf-8')
print('\nDone. Created packs:', len(created))
for c in created:
    print(' -', c['source'], c['count'], 'items ->', c['db'])
print('Index at', idxpath)
print('Duplicates map at', map_path)
