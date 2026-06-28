# PHASE D — READING ENGINE VALIDATION PROOF

**Date:** 2026-06-25

## Current Implementation

| Rule | Status | Location |
|------|--------|----------|
| Duplicate reading → REJECT | ✅ | `readings.service.ts` — P2002 catch → 422 |
| Negative consumption → SUSPICIOUS | ✅ | Threshold profiles detect negative |
| Threshold anomalies → REVIEW | ✅ | ThresholdsModule detects spike/zero |
| Installation date check | ❌ Not implemented | Needs reading validation pipeline |
| Missing previous month → REJECT | ❌ Not implemented | Needs month continuity check |
| Cross-project/cross-area → REJECT | ❌ Not implemented | Needs area guard in readings |
| Future reading → REJECT | ❌ Not implemented | Needs date validation |

## Reading Lifecycle
```
VALID → PENDING_REVIEW → APPROVED 
                         → REJECTED → CORRECTED
                         → SUSPICIOUS → REVIEWED
```

## Files
- `backend/src/readings/readings.service.ts` — 7 endpoints: create, list, get, review-queue, approve, reject, water-balance
- `backend/src/projects/thresholds/` — Threshold profiles for anomaly detection
