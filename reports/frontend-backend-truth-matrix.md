# METER VERSE — FRONTEND-BACKEND TRUTH MATRIX

**Date:** 2026-06-25
**Source:** Direct code cross-reference

---

## LEGEND

| Status | Meaning |
|--------|---------|
| ✅ CONNECTED | FE calls BE endpoint, endpoint exists, data flows |
| ⚠️ PARTIAL | FE calls BE but data may be mocked or endpoint is stub |
| ❌ BROKEN | FE calls BE but endpoint 404s |
| 🚫 MISSING | FE has UI but no BE endpoint, or BE has endpoint but no FE |
| 🔧 FAKE | FE button/action only shows toast, no real API call |

---

## PAGE-TO-ENDPOINT MATRIX

### Auth
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Login | `app/login/page.tsx` | `POST /auth/dev-login` | AuthController | devLogin | ✅ CONNECTED |
| Auth check | `mock-auth.ts` | `GET /auth/me` | AuthController | getProfile | ✅ CONNECTED |
| Logout | `mock-auth.ts` | `POST /auth/logout` | AuthController | logout | ✅ CONNECTED |

### Customers
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `CustomersPage.tsx` | `GET /customers` | CustomersController | findAll | ✅ CONNECTED |
| Detail | `CustomerDetailPage.tsx` | `GET /customers/:id` | CustomersController | findOne | ✅ CONNECTED |
| Create | `CustomerDetailPage.tsx` | `POST /customers` | CustomersController | create | ✅ CONNECTED |
| Update | (not in UI) | `PUT /customers/:id` | CustomersController | update | 🚫 MISSING FE |
| Delete | (no delete UI) | `DELETE /customers/:id` | CustomersController | remove | 🚫 MISSING FE |
| Search | `CustomersPage.tsx` | `GET /customers/search` | SearchController | search | ✅ CONNECTED |
| Ledger | `CustomerDetailPage.tsx` | `GET /customers/:id/ledger` | CustomersController | getLedger | ✅ CONNECTED |

### Meters
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `MetersPage.tsx` | `GET /meters` | MetersController | findAll | ✅ CONNECTED |
| Detail | `MeterDetailPage.tsx` | `GET /meters/:id` | MetersController | findOne | ✅ CONNECTED |
| Create | `MetersPage.tsx` | `POST /meters` | MetersController | create | ✅ CONNECTED |
| Update | (not in UI) | `PUT /meters/:id` | MetersController | update | 🚫 MISSING FE |
| Delete | `MetersPage.tsx` | `DELETE /meters/:id` | MetersController | remove | ✅ CONNECTED |

### Readings
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `ReadingsPage.tsx` | `GET /readings` | ReadingsController | findAll | ✅ CONNECTED |
| New | `NewReadingPage.tsx` | `POST /readings` | ReadingsController | create | ✅ CONNECTED |
| Review | (no page) | `GET /readings/review-queue` | ReadingsController | getReviewQueue | 🚫 MISSING FE |
| Detail (View) | `ReadingsPage.tsx` | `toast('View')` | — | — | 🔧 FAKE |
| Edit | `ReadingsPage.tsx` | `toast('Edit')` | — | — | 🔧 FAKE |
| Delete | `ReadingsPage.tsx` | `DELETE /readings/:id` | — | — | 🚫 MISSING BE/FE |

### Invoices
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `InvoicesPage.tsx` | `GET /invoices` | InvoicesController | findAll | ✅ CONNECTED |
| Detail | `InvoiceDetailPage.tsx` | `GET /invoices/:id` | InvoicesController | findOne | ✅ CONNECTED |
| Generate | `InvoicesPage.tsx` | `toast('Generate')` | — | — | 🔧 FAKE |
| Edit | `InvoicesPage.tsx` | `toast('Edit')` | — | — | 🔧 FAKE |
| Cancel | `InvoicesPage.tsx` | `toast('Cancel')` | — | — | 🔧 FAKE |
| Record Payment | `InvoicesPage.tsx` | `toast('Record')` | — | — | 🔧 FAKE |

### Payments
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `PaymentsPage.tsx` | `GET /payments` | PaymentsController | findAll | ✅ CONNECTED |
| View | `PaymentsPage.tsx` | `toast('View')` | — | — | 🔧 FAKE |
| Edit | `PaymentsPage.tsx` | `toast('Edit')` | — | — | 🔧 FAKE |
| Delete | `PaymentsPage.tsx` | `toast('Delete')` | — | — | 🔧 FAKE |
| Create | (no page) | `POST /payments` | PaymentsController | create | 🚫 MISSING FE |

### Projects
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `ProjectsPage.tsx` | `GET /projects` | ProjectsController | findAll | ✅ CONNECTED |
| Detail | `ProjectDetailPage.tsx` | `GET /projects/:id` | ProjectsController | findOne | ✅ CONNECTED |
| Create | (Settings) | `POST /projects` | ProjectsController | create | ✅ CONNECTED |
| Update | (Settings) | `PUT /projects/:id` | ProjectsController | update | ✅ CONNECTED |
| Delete | (Settings) | `DELETE /projects/:id` | ProjectsController | remove | ✅ CONNECTED |

### KPI Dashboards
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Executive | `ExecutiveDashboard.tsx` | `GET /kpi/executive` | KpiController | getExecutive | ✅ CONNECTED |
| Collections | `CollectionsKpi.tsx` | `GET /kpi/collections` | KpiController | getCollections | ✅ CONNECTED |
| Utilities | `UtilitiesKpi.tsx` | `GET /kpi/utilities` | KpiController | getUtilities | ✅ CONNECTED |

### Wallet
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Balance | `WalletTab.tsx` | `GET /wallet/:customerId` | WalletController | getWallet | ✅ CONNECTED |
| Credit | `WalletTab.tsx` | `POST /wallet/:customerId/credit` | WalletController | addCredit | ✅ CONNECTED |
| Debit | `WalletTab.tsx` | `POST /wallet/:customerId/debit` | WalletController | applyDebit | ✅ CONNECTED |
| Transfer | `WalletTab.tsx` | `POST /wallet/:customerId/transfer` | WalletController | transfer | ✅ CONNECTED |
| History | `WalletTab.tsx` | `GET /wallet/:customerId` | WalletController | getWallet | ✅ CONNECTED |

### Ownership Transfer
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Wizard | `OwnershipTab.tsx` | `POST /:pid/customers/:id/transfer-ownership` | CustomersController | transferOwnership | ✅ CONNECTED |

### Reports
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| List | `ReportsPage.tsx` | `GET /reports` | ReportsController | list | ✅ CONNECTED |
| Generate | `ReportsPage.tsx` | `GET /reports/:type/generate` | ReportsController | generate | ✅ CONNECTED |
| Export CSV | `ReportsPage.tsx` | `GET /reports/:type/export/csv` | ReportsController | exportCsv | ✅ CONNECTED |

### Sync Gateway
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Status | `SyncGatewayPage.tsx` | `GET /sync/gateways/status` | — | — | ✅ CONNECTED |

### Tariff
| Page | Component | API | Controller | Method | Status |
|------|-----------|-----|-----------|--------|--------|
| Studio | `TariffStudioPage.tsx` | `GET /tariffs` | — | — | ✅ CONNECTED |
| Save Tiers | `TariffStudioPage.tsx` | `toast('Saved')` | — | — | 🔧 FAKE |
| Delete | `TariffStudioPage.tsx` | `DELETE /tariffs/:id` | — | — | ❌ BROKEN 404 |

---

## SUMMARY

| Status | Count | Action Required |
|--------|-------|----------------|
| ✅ CONNECTED | ~30 | None |
| ⚠️ PARTIAL | ~5 | Integration hardening |
| ❌ BROKEN | 1 | `DELETE /tariffs/:id` — create endpoint |
| 🚫 MISSING FE | ~8 | Build UI for existing BE endpoints |
| 🚫 MISSING BE | ~2 | Customer DELETE, Reading DELETE endpoints |
| 🔧 FAKE | 8 | Replace toasts with real API calls |
