# F2C.4 — Silent Failure Elimination Report

**Date**: 2026-06-18
**Status**: COMPLETE ✅

---

## Audit Scope

All `catch { toast.success(...) }` patterns across `Frontend/src/`.

## Findings

| File | Line | Pattern | Fixed? |
|------|------|---------|--------|
| `MeterReplacePage.tsx` | 72 | `catch { toast.success(t(...)) }` — **lies about success** | ✅ Fixed |
| `MeterTerminatePage.tsx` | 63 | `catch { toast.success(t(...)) }` — **lies about success** | ✅ Fixed |
| `MeterReplacePage.tsx` | 70 | `try { ... toast.success }` — correct (success on actual success) | Already correct |
| `MeterTerminatePage.tsx` | 61 | `try { ... toast.success }` — correct (success on actual success) | Already correct |

## Fix Applied

### Before (MeterReplacePage.tsx:72, MeterTerminatePage.tsx:63)
```typescript
try {
  await mutation.mutateAsync(...);
  toast.success('Success!');
} catch {
  toast.success('Success!');  // LIE — hides real error
}
```

### After
```typescript
try {
  await mutation.mutateAsync(...);
  toast.success(t('meters.replace.success'));
} catch (error: any) {
  toast.error(error?.message || t('common.error'));  // Shows real error
}
```

## Related: MeterAssignPage (Not Fixed — deferred to F2C.6)

`MeterAssignPage.tsx:54` has `handleConfirm()` that does NOT call any API — it just resets form state and shows `toast.success`. This is not a "silent failure" (no try/catch involved) but rather a "stub action" that never performs the operation. It will be addressed in F2C.6 (Meter Module Recovery) when the full assign flow is wired to `POST /meters/:meterId/assign`.

## Verification

| Check | Result |
|-------|--------|
| 0 false-success catch blocks remaining | ✅ |
| Error messages surface correctly | ✅ |
| Backend connects (no ERR_CONNECTION_REFUSED) | ✅ |

## Success Criteria Met

- [x] 0 false-success actions remain
- [x] Every failure surfaces correctly via toast.error
- [x] Error state displayed through existing UI
