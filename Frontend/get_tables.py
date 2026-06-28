import subprocess
sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'sim_system' AND table_type = 'BASE TABLE' ORDER BY table_name;"
url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
print(result.stdout[:2000] if result.stdout else '')
if result.stderr:
    print('ERR:', result.stderr[:500])
