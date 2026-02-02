import json, sys, pathlib, collections
run_dir = pathlib.Path('jsons/organized/20260202144049_resplit_20260202154124')
if not run_dir.exists():
    print('Run dir not found:', run_dir)
    sys.exit(1)
summary = {}
for src_dir in sorted(run_dir.iterdir()):
    if src_dir.is_dir():
        total = 0
        ids = []
        for f in src_dir.rglob('*.json'):
            if f.name.startswith('manifest_'): continue
            if f.name == 'run_index.json': continue
            # likely chunk files
            try:
                text = f.read_text(encoding='utf-8')
            except Exception:
                try:
                    text = f.read_text(encoding='cp1252')
                except Exception:
                    text = f.read_text(encoding='latin-1')
            text = text.strip()
            if not text:
                continue
            try:
                obj = json.loads(text)
                if isinstance(obj, list):
                    for it in obj:
                        _id = it.get('_id') or it.get('id')
                        ids.append(_id)
                        total += 1
                elif isinstance(obj, dict):
                    _id = obj.get('_id') or obj.get('id')
                    ids.append(_id)
                    total += 1
            except Exception:
                # try NDJSON
                for line in text.splitlines():
                    line=line.strip()
                    if not line: continue
                    try:
                        it = json.loads(line)
                        _id = it.get('_id') or it.get('id')
                        ids.append(_id)
                        total += 1
                    except Exception:
                        pass
        counter = collections.Counter(ids)
        dups = {k:v for k,v in counter.items() if v>1}
        summary[src_dir.name] = {'total': total, 'unique': len(counter), 'dup_count': sum(v-1 for v in counter.values() if v>1), 'top_dups': sorted(dups.items(), key=lambda x:-x[1])[:10]}

print(json.dumps(summary, indent=2))
