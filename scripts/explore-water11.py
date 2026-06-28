import pandas as pd, os, glob

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
cons_col = "Consumption\nKWH/M3"

all_water = []
for f in sorted(glob.glob(os.path.join(base, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "WATER"].copy()
    if len(water):
        month = os.path.basename(f).split(" ")[-1].replace(".xlsx","")
        water["month"] = month
        all_water.append(water)

water = pd.concat(all_water, ignore_index=True)

# Check specific units
special_units = ["Retail-505", "Retail-602", "restaurant Building 1 EDNC", "Offices-7-3-6"]
for unit in special_units:
    udf = water[water["Unit umber"] == unit].copy()
    if len(udf) > 0:
        print(f"\n=== {unit} ({len(udf)} rows) ===")
        for _, row in udf.sort_values(["month", cons_col]).iterrows():
            c = row[cons_col]
            t = row["Total Amount"]
            eff = t / c if c > 0 else 0
            print(f"  m={row['month']} cons={c:6.1f} total={t:8.2f} eff_rate={eff:.4f}")

# Check what rate would fit Retail-505
print("\n\n=== Rate analysis for special units ===")
for unit in special_units:
    udf = water[water["Unit umber"] == unit].sort_values(cons_col)
    if len(udf) >= 2:
        min_charge_candidates = [37.01, 62.0]
        for mc in min_charge_candidates:
            rates = []
            for _, row in udf.iterrows():
                c = row[cons_col]
                t = row["Total Amount"]
                r = (t - mc) / c if c > 0 else 0
                rates.append(r)
            rates = [r for r in rates if r > 0]
            if rates:
                print(f"  {unit} (min={mc}): avg_rate={sum(rates)/len(rates):.4f}, rates={rates}")

# Also check the groups by band implied rate
print("\n\n=== Implied rates for all units with cons > 5 ===")
big = water[water[cons_col] >= 5].copy()
for unit, grp in big.groupby("Unit umber"):
    rates = []
    for _, row in grp.iterrows():
        c = row[cons_col]
        t = row["Total Amount"]
        r = (t - 62) / c
        rates.append(r)
    avg_r = sum(rates) / len(rates)
    min_r = min(rates)
    max_r = max(rates)
    if avg_r > 12.0 or min_r > 11.5:
        print(f"  HIGH: {unit}: avg_rate={avg_r:.4f}, range={min_r:.4f}-{max_r:.4f} (n={len(rates)})")
