"""
Analyze BTU settlement PDFs and working files
"""
import pandas as pd, os, sys
sys.stdout.reconfigure(encoding='utf-8')

# Read New Settlements to understand structure
base = r'D:\Operation\Months\06-2025\Done\GC\Reading'
f = os.path.join(base, 'New Settlements-6.xlsx')
df = pd.read_excel(f, header=None)
print("=== New Settlements-6.xlsx (header=None) ===")
print(f"Shape: {df.shape}")
for i in range(min(40, len(df))):
    row = df.iloc[i]
    vals = [str(v)[:25] for v in row if str(v) != 'nan']
    if vals:
        print(f"  Row {i}: {' | '.join(vals)}")

print("\n\n=== Settlement PDFs in 12-2025 GC directory ===")
settle_dir = r'D:\Operation\Months\12-2025\Done\GC\Golf Central Mall BTU Settlements 12-2025'
if os.path.exists(settle_dir):
    files = os.listdir(settle_dir)
    for f in sorted(files):
        print(f"  {f}")

# Also look at the working settlement XLSX files
print("\n\n=== 09-2025 Settlement XLSM (sample) ===")
xlsm_dir = r'D:\Operation\Months\09-2025\DONE\GC\New folder (3)\DONE\EXCEL'
if os.path.exists(xlsm_dir):
    files = [f for f in os.listdir(xlsm_dir) if f.endswith('.xlsm')]
    for f in sorted(files)[:3]:
        print(f"\n  --- {f} ---")
        try:
            # Read all sheets
            xls = pd.ExcelFile(os.path.join(xlsm_dir, f))
            print(f"  Sheets: {xls.sheet_names}")
            for sheet in xls.sheet_names:
                sdf = pd.read_excel(xls, sheet_name=sheet, header=None)
                print(f"  Sheet '{sheet}' shape={sdf.shape}:")
                for i in range(min(len(sdf), 25)):
                    row = sdf.iloc[i]
                    vals = [str(v)[:30] for v in row if str(v) != 'nan']
                    if vals:
                        print(f"    Row {i}: {' | '.join(vals)}")
        except Exception as e:
            print(f"  Error: {e}")
