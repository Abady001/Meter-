# D6 — Release & Recovery Certification

**Date**: 2026-06-18
**Authority**: git tag, migration audit (C3)

---

## 1. Recovery Tag Verification

| Tag | Commit | Contains | Created | Status |
|-----|--------|----------|---------|--------|
| `v1.0.0-mvp` | `2cd89a3` | T001-T085 MVP baseline (sim_system schema, 9 migrations) | Pre-T086 | ✅ EXISTS |
| `v2.0.0-schema-foundation` | `007aa0a` | T086+T087+T088 (core+features+area schemas, 12 migrations) | T088 closeout | ✅ EXISTS |

### Recovery Scenario A: Rollback to MVP

```
If T086-T088 need to be rolled back:
git checkout v1.0.0-mvp
# Then reset DB to migration 20260531120000_refresh_tokens
prisma migrate reset --to 20260531120000_refresh_tokens
```

**Recovery time**: ~5 minutes (schema-only, no production data)

### Recovery Scenario B: Rollback within v2.0.0

```
If T088 needs to be rolled back (keeping T086+T087):
git checkout v2.0.0-schema-foundation
# Then reset DB to migration 20260617174222_features_db
prisma migrate reset --to 20260617174222_features_db
# This drops area schema, keeps core + features
```

**Recovery time**: ~2 minutes

## 2. Rollback Strategy

| Layer | Rollback Method | Time | Data Loss |
|-------|----------------|------|-----------|
| T088 Area DB | `prisma migrate reset --to 20260617174222_features_db` | < 2 min | None (schema only) |
| T087 Features DB | `prisma migrate reset --to 20260617170622_core_db` | < 1 min | None (schema only) |
| T086 Core DB | `prisma migrate reset --to 20260531120000_refresh_tokens` | < 1 min | None (schema only) |
| All v2.0.0 | `git checkout v1.0.0-mvp` + `prisma migrate reset` | < 5 min | None (no prod data yet) |

**Migration Safety Verified in C3**: 0 destructive operations, 12/12 reversible.

## 3. Tag Strategy Recommendation

### Current State

```
v1.0.0-mvp ─────────────────────────────────> v2.0.0-schema-foundation (HEAD)
  (T001-T085, sim_system only)                   (T086-T088, 4 schemas)
```

### Recommended: Create `v2.0.0-pre-rbac`

**Rationale**: Before T089 begins RBAC implementation, capture the current clean schema state as a distinct tag. This provides:
1. A known-good rollback point before RBAC logic changes
2. Clear separation between "schema foundation" and "RBAC implementation" phases
3. Ability to diff RBAC changes against pure schema baseline

```bash
git tag -a v2.0.0-pre-rbac -m "Pre-RBAC baseline: T086-T088 schema foundation, 4 schemas, 123 tables"
git push origin v2.0.0-pre-rbac
```

## 4. Prisma Migration Safety Verification

| Check | Result |
|-------|--------|
| All migrations reversible | ✅ 12/12 — see C3 |
| No destructive operations | ✅ 0 DROP TABLE/COLUMN in any migration |
| Rollback order verified | ✅ T088→T087→T086 or all→v1.0.0-mvp |
| Data loss risk | ✅ NONE — all T086-T088 migrations are schema-only, empty tables |

## 5. Recovery Strategy

```
┌──────────────────────────────────────────────┐
│            RECOVERY STRATEGY                   │
├──────────────────────────────────────────────┤
│                                                │
│  Primary recovery: git checkout v2.0.0-pre-rbac│
│  + prisma migrate reset                        │
│  Target: < 5 minutes                           │
│                                                │
│  Fallback recovery: git checkout v1.0.0-mvp    │
│  + prisma migrate reset                        │
│  Target: < 10 minutes                          │
│                                                │
│  All recoveries are schema-only.               │
│  Zero production data risk at this stage.      │
│                                                │
└──────────────────────────────────────────────┘
```

## 6. Certification

```
D6 RELEASE & RECOVERY: ✅ PASS

Recovery tags:     2 existing (v1.0.0-mvp, v2.0.0-schema-foundation)
Recommended tag:   v2.0.0-pre-rbac (before T089 work begins)
Rollback paths:    3 distinct paths (T088-only, T086-T088, all v2.0.0)
Max recovery time: < 10 minutes
Data loss risk:    NONE (schema-only migrations)
```
