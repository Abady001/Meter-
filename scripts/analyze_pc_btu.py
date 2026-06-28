"""
Analyze PC BTU invoices 12-2025 and other data
"""
import pandas as pd, os, sys
sys.stdout.reconfigure(encoding='utf-8')
CC = "Consumption\nKWH/M3"

# PC BTU Invoices 12-2025
f = r'D:\Operation\Months\12-2025\Done\PC\Palm Central BTU Invoices 12-2025.xlsx'
df = pd.read_excel(f)
print(f"=== PC BTU Invoices 12-2025 ===")
print(f"Columns: {list(df.columns)}")
print(f"Shape: {df.shape}")
for _, row in df.iterrows():
    c = row[CC]
    t = row['Total Amount']
    name = str(row.get('Customer Name', '?'))[:30]
    meter = str(row.get('Meter Serial', '?'))
    print(f"  {name:30s} | M={meter:12s} | c={c:6.0f} | t={t:8.2f} | tax={row['Taxs']:6.2f} | fee={row['Fees']:6.2f}")

# Check for settlement relationship
print("\n\n=== Sample settlement PDF text extraction ===")
import subprocess
settle_dir = r'D:\Operation\Months\12-2025\Done\GC\Golf Central Mall BTU Settlements 12-2025'
if os.path.exists(settle_dir):
    for fname in sorted(os.listdir(settle_dir))[:2]:
        path = os.path.join(settle_dir, fname)
        print(f"\n  File: {fname} ({os.path.getsize(path)} bytes)")

# Check GC correction invoices
print("\n\n=== GC BTU Correction Invoices 12-2025 ===")
f2 = r'D:\Operation\Months\12-2025\Done\GC\Golf Central Mall BTU Correction Invoices 12-2025.xlsx'
if os.path.exists(f2):
    df2 = pd.read_excel(f2)
    print(f"Shape: {df2.shape}")
    print(f"Columns: {list(df2.columns)}")
    for _, row in df2.iterrows():
        print(f"  {str(row.get('Customer Name','?'))[:30]:30s} | c={row.get(CC,0)} | t={row.get('Total Amount',0)}")

# Compare GC BTU Invoices with GC BTU Settlements - same customers?
print("\n\n=== GC Invoices vs Settlements customer list ===")
inv_dir = r'D:\Operation\Months\12-2025\Done\GC'
inv_file = os.path.join(inv_dir, 'Golf Central Mall BTU Invoices 12-2025.xlsx')
df_inv = pd.read_excel(inv_file)
inv_names = set()
for _, row in df_inv.iterrows():
    name = str(row.get('Customer Name', ''))
    if name and name != 'nan' and name not in ('', 'nan'):
        inv_names.add(name)

settle_files = os.listdir(settle_dir) if os.path.exists(settle_dir) else []
settle_names = set()
for fname in settle_files:
    name = fname.rsplit('_', 1)[0] if '_' in fname else fname.replace('.pdf', '')
    settle_names.add(name)

print(f"Invoice customers: {len(inv_names)}")
for n in sorted(inv_names):
    print(f"  {n}")
print(f"\nSettlement file names ({len(settle_names)}):")
for n in sorted(settle_names):
    print(f"  {n}")
