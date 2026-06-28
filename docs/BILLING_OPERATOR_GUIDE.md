# BILLING OPERATOR GUIDE

## Daily Operations

### 1. Enter Readings
1. Go to **Meters** → select a meter
2. Click **Enter Reading**
3. Input current reading value
4. Verify previous reading is auto-populated
5. Submit → reading status = `valid` or `pending_review`

### 2. Review Suspicious Readings
1. Go to **Readings** → **Review Queue**
2. Review flagged readings (zero consumption, spikes)
3. Click **Approve** or **Reject**
4. Approved readings become available for billing

### 3. Generate Invoices
1. Go to **Billing** → **Generate Invoices**
2. Select project and billing period
3. Click **Generate**
4. Verify invoice numbers are sequential (ELE-2026-XXXXXXXX)

### 4. Issue Invoices
1. Go to **Invoices** → select draft invoices
2. Click **Issue**
3. Status changes: `draft` → `issued`
4. Ledger entry created automatically

### 5. Process Payments
1. Go to **Payments** → **New Payment**
2. Select customer and invoice
3. Enter amount and payment method (cash/bank transfer/card)
4. Submit → oldest-due-first allocation

### 6. Run Reports
1. Go to **Reports** → select report type
2. Set filters (date range, project)
3. Click **Preview** or **Export CSV**

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Invoice not generating | Check readings are `approved` for the period |
| Payment not allocating | Verify invoice status is `issued` |
| Report returns no data | Check date range and project filter |
