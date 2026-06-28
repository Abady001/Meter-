"""
Debug all cons=1 rows
"""
import pandas as pd, os, glob

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
cons_col = "Consumption\nKWH/M3"
total_col = "Total Amount"

all_data = []
for f in sorted(glob.glob(os.path.join(BASE_DIR, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "WATER"].copy()
    if len(water):
        fname = os.path.basename(f)
        month = fname.split(" ")[-1].replace(".xlsx", "")
        water["month"] = month
        all_data.append(water)

data = pd.concat(all_data, ignore_index=True)
c1 = data[data[cons_col] == 1]
print(f"Total cons=1 rows: {len(c1)}")
for _, row in c1.sort_values(["month", "Unit umber"]).iterrows():
    print(f"  {row['month']} {row['Unit umber']:30s} mtr={str(row['Meter Serial']):12s} total={row[total_col]:8.2f}")

# Also check cons=0 rows
c0 = data[data[cons_col] == 0]
print(f"\nTotal cons=0 rows: {len(c0)}")
for _, row in c0.sort_values(["month", "Unit umber"]).iterrows():
    print(f"  {row['month']} {row['Unit umber']:30s} mtr={str(row['Meter Serial']):12s} total={row[total_col]:8.2f}")
