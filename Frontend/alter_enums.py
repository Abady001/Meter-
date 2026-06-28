import subprocess
sqls = [
    "ALTER TYPE sim_system.meter_type ADD VALUE 'solar';",
    "ALTER TYPE sim_system.meter_type ADD VALUE 'gas';",
    "ALTER TYPE sim_system.meter_type ADD VALUE 'chilled_water';",
    "ALTER TYPE sim_system.meter_type ADD VALUE 'outdoor_unit';",
    "ALTER TYPE sim_system.utility_type ADD VALUE 'solar';",
    "ALTER TYPE sim_system.utility_type ADD VALUE 'gas';",
    "ALTER TYPE sim_system.utility_type ADD VALUE 'chilled_water';",
    "ALTER TYPE sim_system.utility_type ADD VALUE 'outdoor_unit';",
    "ALTER TYPE sim_system.utility_type ADD VALUE 'settlement';",
    "ALTER TYPE sim_system.reading_source ADD VALUE 'production';",
]
url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
for sql in sqls:
    result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
    out = result.stdout.strip()
    err = result.stderr.strip()
    if err and 'already exists' not in err.lower():
        print(f'ERR: {sql[:50]}... -> {err[:100]}')
    else:
        print(f'OK: {sql[:50]}...')
