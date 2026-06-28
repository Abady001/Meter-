import pandas as pd, os

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"

# Check Meter Type column in E&W files
for fname in ["E & W EDNC 01-2026.xlsx", "EDNC E Review 01-2026.xlsx", "EDNC W Review 01-2026.xlsx"]:
    fp = os.path.join(base, fname)
    df = pd.read_excel(fp)
    if "Meter Type" in df.columns:
        vals = df["Meter Type"].dropna().unique()
        print(f"{fname}: Meter Type values = {vals}")
    else:
        print(f"{fname}: NO 'Meter Type' column")
        print(f"  Columns: {list(df.columns)}")

# Check W Review files for water data details
print("\n=== EDNC W Review 01-2026 ===")
df = pd.read_excel(os.path.join(base, "EDNC W Review 01-2026.xlsx"))
print(f"  Rows: {len(df)}")
print(f"  Columns: {list(df.columns)}")
cons_col = "Consumption\nKWH/M3"
print(f"  Cons range: {df[cons_col].min():.1f} - {df[cons_col].max():.1f}")
print(f"  Total range: {df['Total Amount'].min():.2f} - {df['Total Amount'].max():.2f}")
print(f"  First 5 rows:")
for _, row in df.head(5).iterrows():
    print(f"    meter={row['Meter Serial']}, unit={row['Unit umber']}, cons={row[cons_col]:8.1f}, total={row['Total Amount']:8.2f}, tax={row['Taxs']:6.2f}, csrv={row['Customer Service']:6.2f}")

# Count water rows per file
print("\n=== All water files ===")
import glob
for f in sorted(glob.glob(os.path.join(base, "EDNC W Review*.xlsx"))):
    d = pd.read_excel(f)
    month = os.path.basename(f).split(" ")[-1].replace(".xlsx","")
    print(f"  {os.path.basename(f)}: {len(d)} rows, month={month}")
