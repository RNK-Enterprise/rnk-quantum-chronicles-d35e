import sqlite3, json
from pathlib import Path

OUT_ROOT = Path('jsons') / 'foundry_compendiums'
RUN_DIR = Path('jsons/organized/20260202144049_resplit_20260202154124')
REPORT_DIR = Path('jsons') / 'reports'
REPORT_DIR.mkdir(parents=True, exist_ok=True)

report = {}
for pack_dir in OUT_ROOT.iterdir():
    if not pack_dir.is_dir():
        continue
    dbpath = pack_dir / f'{pack_dir.name}.db'
    if not dbpath.exists():
        continue
    conn = sqlite3.connect(str(dbpath))
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM data')
    (count,) = cur.fetchone()
    # sample id properties
    cur.execute('SELECT id FROM data LIMIT 100')
    rows = [r[0] for r in cur.fetchall()]
    id_lengths = [len(r) for r in rows]
    all_hex = all(r.isalnum() and r.lower()==r and all(c in '0123456789abcdef' for c in r[:min(16,len(r))]) for r in rows)
    report[pack_dir.name] = {'db_path': str(dbpath), 'count': count, 'sample_count': len(rows), 'sample_id_lengths': sorted(set(id_lengths)), 'sample_ids_hex16': all_hex}
    conn.close()

# cross-check with manifests
for manifest in RUN_DIR.rglob('manifest_*.json'):
    src = manifest.parent.name
    m = json.loads(manifest.read_text(encoding='utf-8'))
    total_seen = sum(int(fe.get('items') or 0) for fe in m.get('files', []))
    if src not in report:
        report[src] = {}
    report[src]['manifest_total_seen'] = total_seen

out = REPORT_DIR / 'compendium_validation_resplit.json'
out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
print('Validation report written to', out)
