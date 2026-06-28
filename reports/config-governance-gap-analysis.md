# METER VERSE — Configuration & Governance Gap Analysis

**Date:** 2026-06-19
**Type:** Comprehensive investigation + simulation + recommendations

---

## PART 1: CURRENT STATUS vs DESIRED STATE

### 1.1 User Management (Settings Page)

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| View users | ✅ Read-only table in Settings > Roles tab | ✅ Keep + add edit controls | 🟡 Need inline actions |
| Add user | ❌ No endpoint | POST /users with username/password/role/area | 🔴 MISSING |
| Edit user | ❌ No endpoint | PATCH /users/:id | 🔴 MISSING |
| Delete user | ❌ No endpoint | DELETE /users/:id with confirmation | 🔴 MISSING |
| Password mgmt | ❌ No feature | Set/reset password, hashed with bcrypt | 🔴 MISSING |
| Area assignment | ❌ No UI | Multi-select areas per user | 🔴 MISSING |
| Users controller | 🟡 GET /users only | Full CRUD + role/area assignment | 🔴 MISSING |

**Recommendation:** Build `UsersController` with full CRUD (POST, GET/:id, PATCH, DELETE) + role assignment endpoint. Add user management tab to Settings page with form dialog.

### 1.2 Area Management

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| Areas table | ✅ CoreArea model in DB | ✅ Keep | 🟢 READY |
| Add area | ❌ No endpoint | POST /areas | 🔴 MISSING |
| Edit area | ❌ No endpoint | PATCH /areas/:id | 🔴 MISSING |
| Delete area | ❌ No endpoint | DELETE /areas/:id with guard | 🔴 MISSING |
| Area CRUD page | ❌ No page | Settings > Areas tab | 🔴 MISSING |

**Recommendation:** Build AreasController with CRUD. Add Areas tab to Settings page with table + create/edit dialog.

### 1.3 Project Management (within Areas)

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| Projects CRUD | ✅ projects.controller exists | ✅ Same | 🟢 OK |
| Project→Area relation | ✅ CoreProject has areaId | ✅ Already exists | 🟢 OK |
| Filter by area | ❌ No filter | GET /projects?areaId=X | 🟡 Need to add query param |
| Area scope in UI | ❌ Not implemented | Projects page filters by user's areas | 🟡 Need area context |

**Recommendation:** Add area-based filtering to projects endpoint. Add area context from JWT in frontend.

### 1.4 Permission Profiles

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| Pre-defined profiles | ✅ 16 roles in enum + ROLE_PERMISSIONS mapping | ✅ Super Admin, Admin, Financial, Operations, Collection, System Admin, Billing Admin | 🟢 MOSTLY OK (need to verify profile names match) |
| Custom profiles | ❌ Not implemented | Create/edit/delete custom role with custom permissions | 🔴 MISSING |
| 4-checkbox perms | ❌ Not implemented | Every function/resource has View/Add/Edit/Delete checkboxes | 🔴 MISSING |
| Permission UI | ❌ Not implemented | Dedicated permission management page with grid | 🔴 MISSING |
| Multi-select | ❌ Not implemented | Bulk assign permissions to roles | 🔴 MISSING |

**Profile Name Mapping:**

| Current Role (backend) | Desired Profile Name | Match? |
|------------------------|---------------------|--------|
| SUPER_ADMIN | Super Admin | ✅ |
| SYSTEM_ADMIN | System Admin | ✅ |
| ADMIN | Admin | ✅ |
| FINANCE | Financial Profile | 🟡 Close |
| OPERATOR | Operations Profile | 🟡 Close |
| COLLECTOR | Collection Team | 🟡 Close |
| BILLING_ADMIN | Billing Admin | ❌ MISSING (no billing_admin role) |

**Missing Profile:** `BILLING_ADMIN` needs to be added to Role enum.

### 1.5 Unit Types

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| Unit type model | ✅ CoreUnitType in Prisma | ✅ | 🟢 OK |
| Pre-defined types | ❌ Not seeded | villa, block, town_house, twin_house, family_house, apartment, chalet, commercial, other | 🔴 MISSING (not seeded in DB) |
| Unit type CRUD | ❌ No endpoint | POST/GET/PATCH/DELETE /unit-types | 🔴 MISSING |
| Unit type UI | ❌ No page | Settings > Unit Types tab | 🔴 MISSING |

**Recommendation:** Seed the 9 unit types into CoreUnitType table. Build CRUD endpoints + Settings UI.

### 1.6 Unit Zones

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| Zone model | ✅ CoreLocationZone in Prisma | ✅ | 🟢 OK |
| Zone CRUD | ❌ Not in settings | CRUD for per-project zones | 🔴 MISSING |
| Zone UI | ❌ Not in settings | Settings > Zones tab | 🔴 MISSING |

### 1.7 Report Templates (from SBill)

| Feature | Current Status | Desired | Gap |
|---------|---------------|---------|-----|
| 44 JRXML templates | ✅ Exist in reference/ | Need to port to Meter Verse | 🔴 HUGE GAP |
| Report categories | ❌ Not categorized | Operational, Financial, Collections, Utility, Regulatory | 🔴 MISSING |
| Report page | 🟡 Basic reports CRUD | Full report catalog with categories, parameters, filters | 🔴 MISSING |
| Kashier report | ❌ Not implemented | Excel template-based report | 🔴 MISSING |

---

## PART 2: MISSING CONFIGURATION LOGIC — BRAINSTORMING

### 2.1 User Management Logic Flow

```
Super Admin
  └── Settings > Users tab
       ├── User List (table: username, email, role, areas, status)
       ├── Add User (dialog: username, password, email, role, areas [multi-select])
       ├── Edit User (dialog: same fields, pre-filled)
       ├── Delete User (confirmation dialog)
       └── User Detail (click row: full profile, role assignment, area assignment)
```

**SBill Logic to Replicate:**
- Username must be unique across system
- Password hashed with bcrypt (not SHA-256)
- User can belong to multiple areas (multi-select)
- User's projects filtered by their areas
- Audit log of all user changes

### 2.2 Permission Profile Logic Flow

```
Super Admin
  └── Settings > Permissions tab
       ├── Profile List (table: profile name, type [system/custom], user count)
       ├── Pre-defined Profiles (read-only, cannot edit)
       │    ├── Super Admin ─── All permissions
       │    ├── System Admin ── All except user:manage
       │    ├── Admin ───────── Area/project/customer/meter ops
       │    ├── Financial ───── Invoice/payment/billing/report
       │    ├── Operations ──── Meter/reading/ticket ops
       │    ├── Collection ──── Payment/collection/invoice
       │    ├── Billing Admin ─ Invoice/tariff/billing ops
       │    └── Viewer ──────── Read-only
       ├── Custom Profiles (create/edit/delete)
       │    ├── Create Profile (name, description)
       │    └── Permission Grid (resources × view/add/edit/delete)
       └── User Assignment
            └── Select user → Select profile → Select areas
```

**Permission Grid Design (for custom profiles):**

```
                    View  Add  Edit  Delete
Users               ☐    ☐    ☐     ☐
Areas               ☐    ☐    ☐     ☐
Projects            ☐    ☐    ☐     ☐
Customers           ☐    ☐    ☐     ☐
Meters              ☐    ☐    ☐     ☐
Readings            ☐    ☐    ☐     ☐
Invoices            ☐    ☐    ☐     ☐
Payments            ☐    ☐    ☐     ☐
Collections         ☐    ☐    ☐     ☐
Reports             ☐    ☐    ☐     ☐
Templates           ☐    ☐    ☐     ☐
Settings            ☐    ☐    ☐     ☐
```

### 2.3 Area → Project → Unit Hierarchy

```
Area (مدينة / منطقة)
├── Area Name (e.g., October, New Cairo)
├── Area Code (e.g., OCT, NCR)
├── Status (active/inactive)
│
├── Project (مشروع)
│   ├── Project Name
│   ├── Project Code
│   ├── Logo
│   ├── License
│   ├── Signature
│   ├── Bank Details
│   ├── Tax Config
│   ├── Water Difference Mode
│   │
│   ├── Unit Type (Villa, Block, Town House, etc.)
│   │   └── Icon/Logo per Type
│   │
│   └── Unit Zone (Zone A, Zone B, etc.)
│       └── Units within zone
│
└── Users assigned to this area
```

### 2.4 Report Template Integration Logic

```
Reports Page
├── Category Filter
│    ├── Operational (meters, readings, consumption)
│    ├── Financial (invoices, payments, aging)
│    ├── Collections (collection, recovery, debtors)
│    ├── Utility (electricity, water, solar, etc.)
│    └── Regulatory (government, compliance)
│
├── Report Card (for each of 44 templates)
│    ├── Report Name (Arabic + English)
│    ├── Category
│    ├── Description
│    ├── Parameters (date range, project, customer, etc.)
│    ├── Formats (PDF, Excel, CSV)
│    └── Actions (Preview, Download, Schedule)
│
└── Report Generation
     ├── Select Parameters
     ├── Preview
     ├── Download (PDF/Excel/CSV)
     └── Schedule (daily/weekly/monthly)
```

### 2.5 Kashier Report Integration

The Kashier report (Excel template) should be:
1. Uploaded via Upload Center
2. Parsed and stored in database
3. Displayed in Reports page under "Financial" category
4. Exportable as PDF/Excel/CSV

---

## PART 3: HUMAN ERROR PREVENTION

### 3.1 Confirmation Dialogs Needed

| Action | Dialog Type | Current |
|--------|------------|---------|
| Delete user | "Are you sure? This cannot be undone." | ❌ No dialog |
| Delete area | "All projects in this area will be affected." | ❌ No dialog |
| Delete project | "Meters and readings in this project will be orphaned." | ❌ No dialog |
| Change user role | "User permissions will change immediately." | ❌ No dialog |
| Assign area to user | "User will gain access to all projects in this area." | ❌ No dialog |
| Update permissions | "Changes take effect immediately on next login." | ❌ No dialog |
| Delete meter | "All readings and invoices for this meter will remain." | ❌ No dialog |
| Reverse payment | "This action is audited and cannot be undone." | ❌ No dialog |
| Cancel invoice | "Invoice will be marked as cancelled." | ❌ No dialog |
| Import data | "Review preview before confirming." | ❌ No dialog |
| Bulk operations | "N records will be affected." | ❌ No dialog |

### 3.2 Validation Checks Needed

| Field | Validation |
|-------|-----------|
| Username | Unique, min 3 chars, alphanumeric |
| Password | Min 8 chars, mixed case + numbers |
| Email | Valid email format, unique |
| Area code | Unique, uppercase, max 10 chars |
| Project code | Unique per area |
| Unit type code | Unique system-wide |
| Meter serial | Unique system-wide |
| Invoice number | Auto-generated, unique |

### 3.3 Audit Trail Requirements

| Action | Audit Fields |
|--------|-------------|
| User created | who, when, what role, what areas |
| User deleted | who, when, which user |
| Role changed | who, when, from, to |
| Area assigned | who, when, which area, which user |
| Permission changed | who, when, what changed |
| Password reset | who, when, which user |

---

## PART 4: UI/UX RECOMMENDATIONS

### 4.1 Settings Page Restructure

```
Settings Page (Super Admin only)
├── General (company info, branding)
├── Users ← NEW (user CRUD + role assignment)
│   ├── User list table
│   ├── Add user dialog
│   ├── Edit user dialog
│   └── Delete confirmation
├── Permissions ← NEW (profile management)
│   ├── Pre-defined profiles (read-only)
│   ├── Custom profiles (CRUD)
│   └── Permission grid (4-checkbox per resource)
├── Areas ← NEW (area CRUD)
│   ├── Area list
│   ├── Add area dialog
│   └── Edit area dialog
├── Unit Types ← NEW (unit type management)
│   ├── Pre-defined types (villa, block, etc.)
│   └── Custom types
├── Reading Thresholds (existing)
├── Notifications (existing)
└── Theme (existing)
```

### 4.2 Icon Guidelines for Settings

| Section | Icon | Action |
|---------|------|--------|
| Users | 👤 | Person-standing |
| Permissions | 🔑 | Key/shield |
| Areas | 🏙️ | City/buildings |
| Unit Types | 🏠 | House/building |
| Reading | 📊 | Chart |
| Notifications | 🔔 | Bell |
| Theme | 🌓 | Moon/sun |

### 4.3 Button Placement Standards

- Primary actions: Top-right of page/section
- Save/Create: Bottom-right of dialog
- Cancel: Bottom-left of dialog
- Delete: Red button, separated from others
- Edit: Pencil icon in table row
- Delete: Trash icon in table row
- Export: Download icon in table header

---

## PART 5: COMPLETE MISSING ENDPOINTS INVENTORY

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /users | POST | Create user with username, password, email, role, areas | P0 |
| /users/:id | GET | Get user details | P0 |
| /users/:id | PATCH | Update user (role, areas, email, status) | P0 |
| /users/:id | DELETE | Delete user (soft or hard) | P0 |
| /users/:id/password | PATCH | Change/reset password | P0 |
| /areas | POST | Create area | P0 |
| /areas | GET | List areas | P0 |
| /areas/:id | GET | Get area details | P0 |
| /areas/:id | PATCH | Update area | P0 |
| /areas/:id | DELETE | Delete area | P0 |
| /projects | GET | Add ?areaId filter | P1 |
| /unit-types | POST | Create unit type | P1 |
| /unit-types | GET | List unit types | P1 |
| /unit-types/:id | PATCH | Update unit type | P1 |
| /unit-types/:id | DELETE | Delete unit type | P1 |
| /roles | GET | List roles | P1 |
| /roles | POST | Create custom role | P1 |
| /roles/:id | PATCH | Update role permissions | P1 |
| /roles/:id | DELETE | Delete custom role | P1 |
| /roles/:id/permissions | PATCH | Update role permissions grid | P1 |
| /zones | CRUD | Location zones per project | P2 |

---

## PART 6: MASTER BACKLOG SUMMARY

| Priority | Count | Total Effort | Key Items |
|----------|-------|-------------|-----------|
| P0 | 12 | ~48h | User CRUD, Area CRUD, Permissions UI, Password mgmt |
| P1 | 8 | ~32h | Unit Types CRUD, Project area filter, Role CRUD, Permission grid API |
| P2 | 10 | ~80h | Zone CRUD, 44 Reports port, Kashier report, Report categories |
| P3 | 5 | ~24h | UI polish, confirmation dialogs, audit trail enhancements |
| **Total** | **35** | **~184h** | |

---

## PART 7: RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1: Core Configuration (48h)
1. UsersController CRUD (POST, GET/:id, PATCH, DELETE)
2. AreasController CRUD (POST, GET, GET/:id, PATCH, DELETE)
3. User management UI in Settings (list + CRUD dialogs + area multi-select)
4. Area management UI in Settings

### Sprint 2: Permissions (32h)
5. Custom role CRUD (POST, GET, PATCH, DELETE /roles)
6. Permission grid API (PATCH /roles/:id/permissions)
7. Permission management UI with 4-checkbox grid
8. Pre-defined profiles (seed 16 roles with permissions)

### Sprint 3: Unit Types + Zones (24h)
9. Unit Types CRUD + seed 9 types
10. Unit Types UI in Settings
11. Zone CRUD + UI

### Sprint 4: Reports (80h)
12. Report categories
13. Port 44 JRXML templates
14. Kashier report integration
15. Report UI with filters + download options
