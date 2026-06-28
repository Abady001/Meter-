import subprocess
url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
sql = """SELECT json_agg(json_build_object('schema', nspname, 'enum', t.typname, 'values', (SELECT json_agg(e.enumlabel ORDER BY e.enumlabel) FROM pg_enum e WHERE e.enumtypid = t.oid))) FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typtype = 'e' AND nspname = 'sim_system' AND t.typname IN ('meter_type', 'utility_type', 'reading_source');"""
result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
print(result.stdout[:2000] if result.stdout else '')
if result.stderr:
    print('ERR:', result.stderr[:500])
