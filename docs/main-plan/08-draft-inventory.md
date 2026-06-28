# 08 — Draft Inventory

Files identified as unused, duplicate, or replaced. These are moved to `draft/` — the system will still work without them.

## Move to Draft

### Old Planning Documents (replaced by main-plan/)
```
docs/planning/                          → draft/docs/planning/
specs/001-metering-billing-platform/    → draft/specs/001/
specs/002-meter-verse-core/             → draft/specs/002/
specs/003-symbiot-integration/          → draft/specs/003/
specs/004-migration-plans/              → draft/specs/004/
```

### Test Files (not part of production app)
```
Frontend/pw-*.cjs                    → draft/tests/pw/
Frontend/gen_*.py                    → draft/tests/gen/
Frontend/gentest.py                  → draft/tests/
Frontend/list_schemas*.py            → draft/tests/
Frontend/map_pages.py                → draft/tests/
Frontend/test*.cjs                   → draft/tests/
```

### Old Reports (superseded by main-plan evaluation)
```
reports/u1-*.md through u11-*.md     → draft/reports/consolidation/
reports/w11-*.md                     → draft/reports/consolidation/
```

### Spec Files from Speckit (content in main-plan)
```
specs/001/tasks.md                   → draft/specs/ (task list superseded)
specs/001/spec.md                    → draft/specs/
specs/001/plan.md                    → draft/specs/
```

## Keep in Place (still needed)

### Active Backend
```
backend/src/                         ← ALL files (production code)
backend/prisma/                      ← ALL files (schema + migrations)
```

### Active Frontend
```
Frontend/src/                        ← ALL files (production code)
Frontend/public/                     ← ALL files
Frontend/package.json, next.config.*, tailwind.config.*, tsconfig.*
```

### Active Docs
```
docs/main-plan/                      ← NEW — single source of truth
AGENTS.md                            ← Active agent instructions
SYSTEM_DNA.md                        ← Active system DNA
FULL_PROMPT_XFER.md                  ← Active context transfer
MASTER-DEPLOYMENT-GUIDE.md           ← Deployment guide
```

### Reference Systems (keep for migration reference)
```
reference/collection-system/         ← Solar wallet, collection tracker reference
reference/sbill/                     ← Sync arch, billing rules reference
reference/symbiot/                   ← Symbiot bridge reference
reference/energy-360/                ← Customer portal reference
reference/ims/                       ← IMS reference
reference/meter-department/          ← Meter data reference
reference/all-last-update/           ← Speckit output reference
```
