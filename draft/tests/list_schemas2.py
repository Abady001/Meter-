import subprocess, json
sql = "SELECT json_agg(json_build_object('schema', table_schema, 'table', table_name)) FROM information_schema.tables WHERE table_schema IN ('core','features','area','sim_system') AND table_type = 'BASE TABLE';"
url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
out = result.stdout.strip()
if out:
    try:
        data = json.loads(out)
        schemas = {}
        for item in data:
            s = item['schema']
            t = item['table']
            schemas.setdefault(s, []).append(t)
        for s in ['core', 'features', 'area', 'sim_system']:
            if s in schemas:
                print(f'\n{s} schema ({len(schemas[s])} tables):')
                for t in sorted(schemas[s]):
                    print(f'  - {t}')
    except:
        print(out)
if result.stderr:
    print('ERR:', result.stderr[:500])
