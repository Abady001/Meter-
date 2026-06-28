# P3-N6 — Playwright Certification

**Date**: 2026-06-18
**Status**: ENVIRONMENT-LIMITED

## Verification
| Check | Result |
|-------|--------|
| Login page loads | ✅ 0 console errors |
| Notification API (via curl) | ✅ All 5 endpoints working |
| Event generation (via curl) | ✅ Customer creation auto-creates notification |
| Bell dropdown (UI) | ⚠️ Cannot test — Docker networking blocks login |
| Mark read (UI) | ⚠️ Cannot test — Docker networking blocks login |

## API-Level Verification
| Endpoint | Status | Evidence |
|----------|--------|----------|
| GET /notifications | ✅ 200 | Returns items array |
| GET /notifications/unread-count | ✅ 200 | Returns count |
| PATCH /notifications/:id/read | ✅ 200 | Returns ok |
| PATCH /notifications/read-all | ✅ 200 | Returns ok |
| DELETE /notifications/:id | ✅ 200 | Returns ok |

## Conclusion
Notification system is verified at the API level. Full Playwright user journey is blocked by Docker networking (environment limitation, not code issue).
