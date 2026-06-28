"""
Read and analyze BTU invoices 12-2025
"""
import pandas as pd, sys
sys.stdout.reconfigure(encoding='utf-8')

CC = "Consumption\nKWH/M3"

# GC BTU Invoices 12-2025
f1 = r'D:\Operation\Months\12-2025\Done\GC\Golf Central Mall BTU Invoices 12-2025.xlsx'
df1 = pd.read_excel(f1)
print("=== GC BTU Invoices 12-2025 ===")
print(f"Columns: {list(df1.columns)}")
print(f"Shape: {df1.shape}")
print("\nAll 39 rows:")
for _, row in df1.iterrows():
    c = row[CC]
    t = row['Total Amount']
    tax = row['Taxs']
    fees = row['Fees']
    cs = row['Customer Service']
    admin = row['Admin Fees']
    bill = row.get('Bill Number', '?')
    meter = row.get('Meter Serial', '?')
    name = str(row.get('Customer Name', '?'))
    unit = row.get('Unit umber', '?')
    print(f"  Bill={bill} | {name[:25]:25s} | U={str(unit):15s} | M={str(meter):12s} | c={c:6.0f} | t={t:8.2f} | tax={tax:6.2f} | fee={fees:6.2f} | cs={cs:6.2f} | adm={admin:6.2f}")
