# Graph Memory — T022

## Knowledge Graph State
- **198 code files** parsed via structural AST extraction
- **1039 nodes**, **2770 edges**, **64 communities** (frontend graph)
- **God nodes**: `cn()` (276), `SmartTable()` (49), `Button()` (48), `StatusBadge()` (45), `PageHeader()` (35)

## Community Breakdown (Key)
| Community | Content |
|---|---|
| Community 6 | QueryProvider, makeQueryClient, getQueryClient |
| Community 3 | useProjectsList, mockProjects, ProjectsPage |
| Community 29 | api/ auth functions |

## New T022 Nodes Added
- `feature-flags.ts` → `getModuleSource()`, `getFeatureFlags()`, `MODULE_FLAGS`
- `features.ts` → API endpoint `/api/features`
- feature flags system connects to: projects module, customers module, readings module, etc.

## Graphify Commands
```bash
# Query the graph
cd Frontend && graphify query "<objective>"

# Update after code changes
cd Frontend && graphify update .
```

## Note
Semantic extraction was skipped (DeepSeek API needs credits). Structural extraction is complete.
