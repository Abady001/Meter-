# P3-N1 — Notification System Discovery

**Date**: 2026-06-18
**Method**: Independent code audit — no prior reports trusted

## Existing Infrastructure
| Component | Status | File/Line |
|-----------|--------|-----------|
| `CoreNotificationQueue` model | ✅ EXISTS | `schema.prisma:888-905` (core schema) |
| `NotificationType` enum | ✅ EXISTS | `schema.prisma:697-704` (email/sms/push/in_app) |
| Notification service | ❌ NOT IMPLEMENTED | No backend module |
| Notification controller | ❌ NOT IMPLEMENTED | No routes |
| WebSocket/events | ❌ NOT IMPLEMENTED | Zero dependencies |

## Frontend
| Component | Status | File |
|-----------|--------|------|
| Bell icon in TopNav | ❌ STATIC (no click handler) | `TopNav.tsx:126-146` |
| Notification dropdown | ❌ DOES NOT EXIST | — |
| `useNotifications` hook | ❌ DOES NOT EXIST | — |
| AlertsPage | ❌ MOCK_ONLY | `AlertsPage.tsx` |

## Key Gap
The `CoreNotificationQueue` model exists but requires a `CoreUser` FK relation. Since the auth system uses JWT with arbitrary userId strings, a **new notification model** in `sim_system` schema is needed.

## Conclusion
Full notification system must be built from scratch. No real-time infrastructure exists.
