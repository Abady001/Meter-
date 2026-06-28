import subprocess, json

url = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'

# Verify enum values exist in the actual database
checks = [
    ("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname='meter_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname='sim_system')) ORDER BY enumlabel", 'meter_type'),
    ("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname='utility_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname='sim_system')) ORDER BY enumlabel", 'utility_type'),
    ("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname='reading_source' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname='sim_system')) ORDER BY enumlabel", 'reading_source'),
]

for sql, name in checks:
    result = subprocess.run(['npx.cmd', 'prisma', 'db', 'execute', '--stdin', f'--url={url}'], cwd='D:/meter/meter/backend', input=sql, capture_output=True, text=True, timeout=15000)
    out = result.stdout.strip()
    err = result.stderr.strip()
    if err and 'already exists' not in err.lower():
        print(f'{name}: ERROR - {err[:100]}')
    else:
        print(f'{name}: {out[:200] if out else "OK (no output)"}')
