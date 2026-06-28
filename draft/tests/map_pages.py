import os, re

# Collect all controller files to extract route paths and DB tables
backend = 'D:/meter/meter/backend/src'
results = []

for root, dirs, files in os.walk(backend):
    for f in files:
        if f.endswith('.controller.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            # Extract controller prefix
            m = re.search(r'@Controller\([\'\"]([^\'\"]*)[\'\"]\)', content)
            prefix = m.group(1) if m else ''
            # Extract endpoints
            routes = []
            for method in ['Get', 'Post', 'Patch', 'Put', 'Delete']:
                for match in re.finditer(rf'@({method})\([\'\"]([^\'\"]*)[\'\"]\)', content):
                    routes.append(f'{match.group(1).upper()} /{prefix}/{match.group(2)}'.replace('//', '/'))
            # Extract Prisma models accessed
            prisma_models = set(re.findall(r'this\.prisma\.(\w+)', content))
            db_tables = set(re.findall(r'prisma\.(\w+)', content))
            results.append({
                'file': f,
                'prefix': prefix,
                'routes': routes,
                'prisma_models': prisma_models | db_tables,
            })

# Print summary
for r in sorted(results, key=lambda x: x['prefix']):
    print(f"\n{'='*60}")
    print(f"Controller: {r['file']}  (@Controller('{r['prefix']}'))")
    print(f"{'='*60}")
    for route in r['routes']:
        print(f"  {route}")
    if r['prisma_models']:
        print(f"  DB Tables: {', '.join(sorted(r['prisma_models']))}")
