import subprocess
sql = 'SELECT id FROM "sim_system"."Project" LIMIT 5;'
url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
print(result.stdout[:2000] if result.stdout else '')
if result.stderr:
    print('ERR:', result.stderr[:500])
