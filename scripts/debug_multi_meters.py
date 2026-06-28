"""
Debug Retail-505: check meter serials and rates per meter
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

# Show all rows for Retail-505 with all fields
print("=== Retail-505 all rows ===")
for _, row in data[data["Unit umber"] == "Retail-505"].sort_values(["month", cons_col]).iterrows():
    print(f"  {row['month']} | Meter: {str(row['Meter Serial']):15s} | Cons: {row[cons_col]:7.2f} | Total: {row[total_col]:8.2f}")

# Also check all units that have multiple rows per month
print("\n=== Units with multiple rows in any month ===")
for unit, grp in data.groupby("Unit umber"):
    multi = False
    for m in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == m]
        if len(mdf) > 1:
            multi = True
            break
    if multi:
        print(f"\n{unit}:")
        for m in sorted(grp["month"].unique()):
            mdf = grp[grp["month"] == m]
            if len(mdf) > 1:
                print(f"  {m} ({len(mdf)} rows):")
                for _, row in mdf.iterrows():
                    c = float(row[cons_col])
                    t = float(row[total_col])
                    rate = (t - 62) / c if c > 0 else float('inf')
                    print(f"    Meter={str(row['Meter Serial']):15s} Cons={c:7.2f} Total={t:8.2f} Rate={rate:.6f}")
