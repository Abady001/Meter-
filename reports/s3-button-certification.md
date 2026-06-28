# Phase S2 — Button Certification

**Date:** 2026-06-18
**Method:** Static code analysis of every page component

## Certification Results

| Classification | Count | Meaning |
|---------------|-------|---------|
| WORKING | 6 | Button calls real API mutation with proper feedback |
| NO_ACTION | 36 | Button shows a toast stub but performs no real operation |
| API_FAILURE | 0 | Button calls API but gets error response |
| MOCK_ONLY | 41 | Button operates entirely on mock data, no API call |
| **TOTAL** | **83** | |

## Per-Module Breakdown

### Customers (3 WORKING)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Add Customer | Dialog→Form→useCreateCustomer | WORKING | Real POST via mutateAsync |
| Edit Customer | Dialog→Form→useUpdateCustomer | WORKING | Real PATCH via mutateAsync |
| Delete Customer | AlertDialog→useDeleteCustomer | WORKING | Real DELETE via mutateAsync |
| View Detail | Navigation | WORKING | Navigates to detail page |
| Row Click | Navigation | WORKING | Navigates to detail page |
| Project Filter | onChange→setProjectFilter | WORKING | Updates query filter |
| Status Filter | SmartTable filter | WORKING | Client-side filter |
| Balance Filter | SmartTable filter | WORKING | Client-side filter |

### Meters — List (3 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Add Meter | toast.info('Add Meter dialog') | NO_ACTION | Stub |
| Edit (dropdown) | toast.info('Edit meter') | NO_ACTION | Stub |
| Delete (dropdown) | toast.info('Delete meter') | NO_ACTION | Stub |
| View Detail | Navigation | WORKING | Navigates to detail |
| Project Filter | Select→filter change | WORKING | Client-side filter |

### Meters — Assign (1 MOCK_ONLY)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| 9-step wizard all buttons | Local state changes only | MOCK_ONLY | Entirely mock-driven |
| Confirm Assignment | toast.success + state reset | MOCK_ONLY | Fake success, no API call |

### Meters — Replace (WORKING)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Replace Meter | useReplaceMeter.mutateAsync | WORKING | Real API mutation |
| Current Meter Select | List from mock fallback | NO_ACTION | List may be mock |

### Meters — Terminate (WORKING)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Terminate Meter | useTerminateMeter.mutateAsync | WORKING | Real API mutation |

### Projects (2 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Create Project | toast.info | NO_ACTION | Stub |
| Edit | toast.info | NO_ACTION | Stub |
| Delete | toast.info | NO_ACTION | Stub |

### Locations (1 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Add Building | toast.info | NO_ACTION | Stub |

### Readings (2 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| View Details | toast.info | NO_ACTION | Stub |
| Edit Reading | toast.info | NO_ACTION | Stub |
| Create Reading | useCreateReading.mutateAsync | WORKING | Real mutation but dropdowns from mock |

### Invoices (7 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Create Invoice | toast.info | NO_ACTION | Stub |
| Edit | toast.info | NO_ACTION | Stub |
| Issue | toast.info | NO_ACTION | Stub |
| Record Payment | toast.info | NO_ACTION | Stub |
| Download PDF | toast.info | NO_ACTION | Stub |
| Cancel | toast.info | NO_ACTION | Stub |
| Approve/Reject (review) | toast.info | NO_ACTION | Stub |

### Payments (5 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| View | toast.info | NO_ACTION | Stub |
| Edit | toast.info | NO_ACTION | Stub |
| Delete | toast.info | NO_ACTION | Stub |
| Record Payment | toast.success | NO_ACTION | Fake success, no API |
| Reverse | Not in UI | MOCK_ONLY | Not implemented |

### Reports (4 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Filter | toast.info | NO_ACTION | Stub |
| CSV Export | toast.info | NO_ACTION | Stub |
| XLSX Export | toast.info | NO_ACTION | Stub |
| Preview | toast.info | NO_ACTION | Stub |

### Alerts (1 MOCK_ONLY)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Acknowledge | setState(local) | MOCK_ONLY | Updates local state only |

### Tickets (1 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Create Ticket | toast.success | NO_ACTION | Fake success, no API |

### Settings (3 NO_ACTION)
| Button | Action | Classification | Notes |
|--------|--------|---------------|-------|
| Save (General) | toast.info | NO_ACTION | Stub |
| Save (Reading) | toast.info | NO_ACTION | Stub |
| Save (Water) | toast.info | NO_ACTION | Stub |

## Key Finding

**Only 6 out of 83 buttons (7.2%) perform real backend operations.** The remaining 77 buttons either do nothing (toast stubs) or operate entirely on mock data. The platform is not production-ready for any module except customer CRUD and meter replacement/termination.

## Verdict

**BUTTONS_CERTIFIED = NO**
