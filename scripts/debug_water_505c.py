"""
EDNC Water Replay v6c — debug Retail-505 inside replay loop
"""
import pandas as pd, os, glob

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
MIN_CHARGE = 62.0
ALT_MIN_UNITS = {"Offices-7-0-4", "Offices-6-3-3"}
ALT_MIN = 37.01

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

print(f"Total WATER rows: {sum(len(w) for w in all_data)}")

data = pd.concat(all_data, ignore_index=True)

# Show Retail-505 after concat
r505 = data[data["Unit umber"] == "Retail-505"]
print(f"\nRetail-505 rows in concatenated data: {len(r505)}")
for _, row in r505.iterrows():
    print(f"  {row['month']}: cons={row[cons_col]}, total={row[total_col]}")

# Build unit-month rate lookup
unit_rates = {}
for unit, grp in data.groupby("Unit umber"):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    r = {}
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        big = mdf[mdf[cons_col] >= 5]
        if len(big) > 0:
            row = big.iloc[0]
            c = row[cons_col]
            t = row[total_col]
            r[month] = (t - mc) / c
        else:
            r[month] = None
    unit_rates[unit] = r

# Debug rate lookup for Retail-505
print(f"\nRate lookup for Retail-505:")
for m in sorted(r505["month"].unique()):
    rate = unit_rates.get("Retail-505", {}).get(m)
    print(f"  {m}: rate={rate}")

# Now replay for Retail-505
print(f"\nReplay for Retail-505:")
for _, row in data[data["Unit umber"] == "Retail-505"].iterrows():
    c = row[cons_col]
    month = row["month"]
    mc = 62.0
    rate = unit_rates.get("Retail-505", {}).get(month)
    if rate is None:
        for m, v in unit_rates.get("Retail-505", {}).items():
            if v is not None:
                rate = v
                break
    if rate is None:
        rate = 11.31 if not month.startswith("01") else 10.81
    expected = round(mc + c * rate, 2)
    actual = row[total_col]
    diff = actual - expected
    print(f"  {month}: cons={c}, actual={actual}, rate={rate:.6f}, expected={expected}, diff={diff:.2f}")
