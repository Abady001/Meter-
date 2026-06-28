# P3-N3 — API Endpoints

**Date**: 2026-06-18
**Status**: COMPLETE

## Endpoint Inventory
| Method | Route | Auth | Description | Status |
|--------|-------|------|-------------|--------|
| GET | /notifications | JWT + Roles | List notifications (paginated) | ✅ WORKING |
| GET | /notifications/unread-count | JWT + Roles | Get unread count | ✅ WORKING |
| PATCH | /notifications/:id/read | JWT + Roles | Mark single as read | ✅ WORKING |
| PATCH | /notifications/read-all | JWT + Roles | Mark all as read | ✅ WORKING |
| DELETE | /notifications/:id | JWT + Roles | Delete notification | ✅ WORKING |

## Features
- Pagination (page + limit query params)
- Unread-only filter
- User-scoped (userId from JWT)
- Roles enforced (OPERATOR+ for read, ADMIN+ for delete)
