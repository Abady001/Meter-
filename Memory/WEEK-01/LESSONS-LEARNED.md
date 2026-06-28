# Week 01 — Lessons Learned

## P0-001: TOU Pricing
- **Problem:** TOU was implemented as a stub — only checked current hour
- **Root cause:** Incomplete switch case implementation
- **Fix:** Full proportional distribution across all TOU periods in a 24h cycle
- **Regression test:** N/A (no existing test)
- **Architecture changed:** No
- **Technical debt added:** None

## P0-002: Demand Charges
- **Problem:** No demand charge capability in tariff engine
- **Root cause:** Missing feature
- **Fix:** Convention-based detection via DEMAND_ charge code prefix
- **Regression test:** N/A
- **Architecture changed:** No
- **Technical debt added:** None

## P0-003: Penalty Engine
- **Problem:** No automated penalty calculation
- **Root cause:** Missing feature
- **Fix:** New PenaltyService with configurable rules
- **Regression test:** N/A
- **Architecture changed:** No
- **Technical debt added:** None

## P0-004: Credit/Debit Notes
- **Problem:** Thought it was missing
- **Root cause:** Actually already implemented — verified by reading source
- **Fix:** None needed — marked as complete
- **Lesson:** Always verify by reading source before building
