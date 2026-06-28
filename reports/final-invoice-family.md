# Final Invoice Family

**Date**: 2026-06-18

## Common Invoice Template (All Utilities)

### Layout Sections (top→bottom)
1. **Header**: Logo + Company Name + License
2. **Invoice Title**: Utility-specific Arabic name
3. **Customer Info**: Name (Arabic), Tenant, Unit No, Address, City
4. **Meter Info**: Serial, Type, Issue Date, Billing Month
5. **Readings**: Previous, Current, Consumption, Unit
6. **Charge Breakdown**: By charge group with subtotals
7. **Tax Section**: VAT or equivalent
8. **Balance Section**: Previous Balance, Current Charges, Total Due
9. **Footer**: Signature, Bank Details, Stamp

### Utility-Specific Variations
| Utility | Invoice Name | Unit | Charge Groups |
|---------|-------------|------|---------------|
| **Electricity** | فاتورة كهرباء | kWh | Cons(0), Admin(4), CS(2,3), Other(1) |
| **Water** | فاتورة مياه | m³ | Cons(0), Service(1), CS(2,3), Sustain(4), Pct(5), VAT(6), Other(7) |
| **Chilled Water** | فاتورة مياه مثلجة | RT/TR | Cons(0), CoolingLoad(10), FixedChiller(11) |
| **Outdoor Cooling Unit** | فاتورة وحدة التكييف الخارجية | Configurable | Cons(0), CoolingLoad(10), FixedChiller(11) |
| **Solar** | فاتورة شمسية | kWh | Cons(0), SolarCredit(8), SolarCarry(9) |
| **Settlement** | فاتورة تسوية | — | Settlement(12), Adjustment(13) |

### Download Formats
| Format | Status |
|--------|--------|
| **PDF** (Puppeteer HTML→PDF) | ✅ Working (electricity only) |
| **CSV** (invoice lines) | ✅ Working |
| **Excel** | ❌ Not implemented |
| **Batch ZIP** | ✅ Working (JSON) |
