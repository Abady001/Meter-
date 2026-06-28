# Report 2: Settings Restructure Board

**Date:** 2026-06-25
**File:** `Frontend/src/components/reports/SettingsPage.tsx`

---

## All 16 Tabs

| # | Tab ID | Tab Label | Functionality | Status |
|---|--------|-----------|---------------|--------|
| 1 | `general` | General | "General system settings coming soon." | **Placeholder** — empty card |
| 2 | `users` | Users | Full CRUD: SmartTable listing users, Add User dialog (username/email/password), deactivate button | **Built** — createUser + deleteUser mutations wired |
| 3 | `areas` | Areas | Full CRUD: SmartTable listing areas (code, name, status), Add Area dialog, deactivate button | **Built** — createArea + deleteArea mutations wired |
| 4 | `projects` | Projects | Full CRUD: SmartTable listing projects (code, name, area, status), Add Project dialog with Area dropdown, deactivate | **Built** — createProject + deleteProject mutations wired |
| 5 | `unit-types` | Unit Types | Full CRUD: SmartTable listing types (code, name, default meter type), Add dialog with meter type select | **Built** — createType + deleteType mutations wired |
| 6 | `permissions` | Permissions | Role switcher (RoleSwitcher component) + Permission matrix table (V/A/E/D toggles for 5 roles across 9 modules) | **Built** — client-side toggle only, no API persistence |
| 7 | `user-groups` | User Groups | "User groups allow assigning permission profiles to departments." | **Placeholder** — description text only |
| 8 | `customer-groups` | Customer Groups | "Manage customer grouping for tariff assignment and reporting." | **Placeholder** — description text only |
| 9 | `payment-centers` | Payment Centers | "Configure payment collection centers and locations." | **Placeholder** — description text only |
| 10 | `bank-accounts` | Bank Accounts | "Manage company bank accounts for payment reconciliation." | **Placeholder** — description text only |
| 11 | `pos-terminals` | POS | "Register and manage POS terminal devices." | **Placeholder** — description text only |
| 12 | `holidays` | Holidays | "Configure holidays for billing cycle scheduling." | **Placeholder** — description text only |
| 13 | `unit-zones` | Unit Zones | "Manage unit zone classifications." | **Placeholder** — description text only |
| 14 | `settlement-types` | Settlement Types | "Configure settlement types (Tariff Difference, Consumption Settlement)." | **Placeholder** — description text only |
| 15 | `reading` | Reading | "Reading thresholds coming soon." | **Placeholder** — empty card |
| 16 | `notifications` | Notifications | "Notification settings coming soon." | **Placeholder** — empty card |
| — | `theme` | Theme | Light / Dark / System theme toggle via `next-themes` | **Built** — 3-button selector |

## Summary

- **Built (functional CRUD/UI):** 6 tabs — Users, Areas, Projects, Unit Types, Permissions (client-side only), Theme
- **Placeholder (description/empty card only):** 10 tabs — General, User Groups, Customer Groups, Payment Centers, Bank Accounts, POS, Holidays, Unit Zones, Settlement Types, Reading, Notifications
- **No API persistence** for permission matrix — state is kept in `permState` React state only, not saved to backend
- **API endpoints used:** `/users`, `/areas`, `/unit-types`, `/projects` — all fall back to `[]` on error (`.catch(() => [])`)
