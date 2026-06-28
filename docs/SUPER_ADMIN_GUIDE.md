# SUPER ADMIN GUIDE

## Full System Access

As super_admin (username: kirllos), you have unrestricted access to all areas, projects, and data.

## Key Responsibilities

### 1. System Configuration
- JWT_SECRET rotation (backend .env)
- Database backup verification
- Monitor system health and performance

### 2. User Administration
- Create/delete admin-level users
- Assign role permissions
- Approve registration requests (Settings → Registration)

### 3. Database Administration
- Full access to DB Admin (port 4001)
- Direct SQL queries for data fixes
- Table browsing and record management
- Dependency-checked deletes

### 4. Security Monitoring
- Review audit logs regularly
- Monitor failed login attempts
- Check for unauthorized access attempts

### 5. Bill Cycle Management
- Override/cancel bill cycles
- Force-post invoices if needed
- Reverse incorrect payments

## Audit Trail

Every action by every user is logged in the audit log:
- Who did what
- When
- What changed (before/after snapshots)
- Hash-chained for tamper detection

To verify integrity:
```sql
-- Run in DB Admin → query tab
-- Check that hash chain is intact (no tampering)
```

## Emergency Procedures

| Situation | Action |
|-----------|--------|
| Database corruption | Restore from latest backup (see disaster recovery) |
| Failed bill cycle | Cancel cycle, investigate, restart |
| Security breach | Revoke all tokens, force password reset, audit logs |
| Data loss | Restore from backup, identify affected records |
