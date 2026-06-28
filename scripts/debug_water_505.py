"""
Debug Retail-505 water tariff details across all months
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

# Debug Retail-505
unit = "Retail-505"
print(f"--- {unit} ---")
for m in sorted(data[data["Unit umber"] == unit]["month"].unique()):
    grp = data[(data["Unit umber"] == unit) & (data["month"] == m)]
    c = float(grp[cons_col].iloc[0])
    t = float(grp[total_col].iloc[0])
    if c > 0:
        rate = (t - 62) / c
        expected = round(62 + c * rate, 2)
        diff = round(t - expected, 2)
    else:
        rate = float('inf')
        expected = 62
        diff = round(t - 62, 2)
    print(f"  {m}: cons={c}, total={t}, rate={rate:.6f}, cons>=5={c>=5}")
    print(f"    expected={expected:.2f}, diff={diff:.2f}")

# Find rate lookup issue
print(f"\n--- Rate lookup for {unit} ---")
for m in sorted(data[data["Unit umber"] == unit]["month"].unique()):
    grp = data[(data["Unit umber"] == unit) & (data["month"] == m)]
    c = float(grp[cons_col].iloc[0])
    if c >= 5:
        t = float(grp[total_col].iloc[0])
        rate = (t - 62) / c
        print(f"  {m}: LOOKED UP rate={rate:.6f}")
    else:
        print(f"  {m}: NO RATE (cons={c} < 5)")

# Full unit list
print("\n--- All units with rate info ---")
for unit in sorted(data["Unit umber"].unique()):
    grp = data[data["Unit umber"] == unit]
    mc = 37.01 if unit in {"Offices-7-0-4", "Offices-6-3-3"} else 62.0
    rates = []
    for m in sorted(grp["month"].unique()):
        sdf = grp[grp["month"] == m]
        c = float(sdf[cons_col].iloc[0])
        if c >= 5:
            t = float(sdf[total_col].iloc[0])
            rates.append((t - mc) / c)
    if rates:
        avg = sum(rates) / len(rates)
        print(f"  {unit:30s} n_months_with_data={len(rates):2d} avg_rate={avg:.4f}")
    else:
        print(f"  {unit:30s} NO high-cons data")
