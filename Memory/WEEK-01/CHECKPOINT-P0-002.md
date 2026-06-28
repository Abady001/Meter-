# Checkpoint — P0-002: Demand Charge Calculation

## Status: ✅ COMPLETE

## Changes Made
- Modified `backend/src/billing/tariff-engine.service.ts`
- Added demand charge detection: charge codes starting with `DEMAND_` trigger demand calculation
- Demand charge = consumption × rateAmount (peak-based)
- Maps to charge group 8 (demand)
- Convention-based — no DB migration needed
- Backward compatible: only charges with `DEMAND_` prefix are affected

## Validation
- [x] Backend build: clean
- [x] No DB migration needed

## Git
- [x] Committed: `ea24633`
- [x] Pushed to both repos
