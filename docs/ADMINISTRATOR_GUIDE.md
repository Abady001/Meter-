# ADMINISTRATOR GUIDE

## System Management

### User Management
1. Go to **Settings** → **Users**
2. **Add User**: username, email, password, role
3. **Edit User**: update info, reset password
4. **Deactivate**: suspend user account
5. **Roles**: assign one of 16 roles (super_admin to viewer)

### Area Management
1. Go to **Settings** → **Areas**
2. Add/edit/delete operational areas
3. Each area has associated projects

### Project Management
1. Go to **Projects**
2. Create new project with name, code, area
3. Configure project settings and tariff plan

### Settings Available

| Tab | Purpose |
|-----|---------|
| General | System-wide configuration keys |
| Users | User accounts and role assignments |
| Areas | Operational area definitions |
| Unit Types | Building unit type catalog |
| Permissions | Role-based access control matrix |
| User Groups | Group-based user management |
| Customer Groups | Customer categorization |
| Payment Centers | Collection point configuration |
| Bank Accounts | Company bank accounts |
| POS | Point-of-sale terminal management |
| Holidays | Holiday calendar for billing |
| Unit Zones | Zoning for location hierarchy |
| Settlement Types | Settlement period configuration |
| Reading | Reading threshold configuration |
| Notifications | Alert and notification settings |
| Theme | Dark/light mode, branding |

## Database Administration

Access via http://localhost:4001 (login: admin / iskra_admin_2026)

**Capabilities:**
- Browse all tables across sim_system, core, features
- Add/edit/delete records with transactional batch apply
- Dependency checking before deletes
- Custom SQL queries (SELECT only for non-super_admins)

## Upload Center

1. Go to **Upload Center**
2. Select import type: Customers, Meters, Readings, Invoices, Payments
3. Download template (Excel)
4. Fill data and upload
5. System validates and imports with error reporting

## Monitoring

Check these daily:
- Backend health: http://localhost:3001/api/v1/health
- Open bills in current bill cycle
- Failed uploads in Upload Center
- Unresolved tickets in Support
