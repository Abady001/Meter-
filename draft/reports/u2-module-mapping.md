# U2 — MODULE MAPPING MATRIX

**Date**: 2026-06-18

## Capability Ownership Matrix

| Capability | Collections (Current) | SBill (Reference) | Collection System (Reference) | Final Owner |
|-----------|----------------------|-------------------|------------------------------|-------------|
| **Customer Management** | ✅ Full CRUD | ✅ Full | ✅ Full | **Collections** |
| **Meter Management** | ✅ Full lifecycle | ✅ Full | ✅ Full | **Collections** |
| **Reading Management** | ✅ Partial (no mobile) | ✅ SEP2 polling | ✅ Manual | **Collections** |
| **Tariff Management** | ⚠️ Simple flat rate | ✅ Tiered slabs | ✅ Multi-charge | **Collections** (needs upgrade) |
| **Invoice Generation** | ⚠️ Broken (500 error) | ✅ Full | ✅ Full | **Collections** (fix needed) |
| **Payment Processing** | ⚠️ No gateway | ✅ Fawry integration | ✅ Cash/POS | **Collections** |
| **Collections Tracking** | ⚠️ Stub only | ❌ Not present | ✅ Full | **Collections** |
| **Report Generation** | ❌ Not implemented | ✅ JasperReports | ✅ Python reports | **Collections** (new) |
| **Solar Billing** | ❌ Not implemented | ❌ Not present | ✅ Wallet + kWh | **Collections** (new) |
| **Chilled Water Billing** | ❌ Not implemented | ❌ Not present | ✅ Full cycle | **Collections** (new) |
| **Gas Billing** | ❌ Not implemented | ❌ Not present | ❌ Not present | **Collections** (new) |
| **Claims/Disputes** | ❌ Not implemented | ✅ Claims tables | ❌ Not present | **Collections** (new) |
| **Notification System** | ❌ Not implemented | ✅ SMS/Email | ✅ Notifications | **Collections** (new) |
| **Customer Portal** | ❌ Not implemented | ✅ Energy360 | ❌ Not present | **Collections** (new) |
| **Payment Gateway** | ❌ Not implemented | ✅ Fawry | ✅ Fawry | **Collections** (new) |
| **Symbiot Integration** | ❌ Not implemented | ❌ SEP adapter | ❌ Not present | **Collections** (future) |
| **SIM Card Management** | ✅ Full lifecycle | ❌ Not present | ❌ Not present | **Collections** |
| **Water Balance** | ✅ Variance calc | ❌ Not present | ✅ Main/sub | **Collections** |
| **Audit Logging** | ✅ Global interceptor | ✅ JHipster audit | ✅ Flask audit | **Collections** |

## Module Duplication Risk

| Domain | Overlapping Systems | Risk |
|--------|-------------------|------|
| Customers | 3 (Collections + SBill + Collection System) | HIGH — merge needed |
| Meters | 3 | HIGH — merge needed |
| Readings | 3 | HIGH — merge needed |
| Invoices | 3 | HIGH — merge needed |
| Payments | 3 | HIGH — merge needed |
| Tariffs | 3 | HIGH — merge needed |

## Conclusion
The current system has the **right architectural foundation** but is missing ~40% of the required business capabilities. The SBill and Collection System references contain the business logic for the missing features.
