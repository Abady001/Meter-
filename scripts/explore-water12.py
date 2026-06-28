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

# Get unique unit rate patterns - compute implied single rate for each unit
print("=== Unit rate by month ===")
unit_rates = []
for unit, grp in water.groupby("Unit umber"):
    for m in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == m]
        for _, row in mdf.iterrows():
            c = row[cons_col]
            t = row["Total Amount"]
            if c > 0:
                eff = t / c
                unit_rates.append({"unit": unit, "month": m, "cons": c, "rate": eff})

rate_df = pd.DataFrame(unit_rates)

# Show unique units and their average rate per month
print("\n=== Units sorted by avg rate ===")
rate_pivot = rate_df.groupby("unit").agg({"rate": ["mean", "min", "max", "count"]})

# Classify into Standard and Premium
rate_pivot.columns = ['avg_rate', 'min_rate', 'max_rate', 'count']
rate_pivot['classification'] = rate_pivot['avg_rate'].apply(
    lambda r: 'STANDARD' if r < 12.0 else 'PREMIUM')
print(rate_pivot.sort_values('avg_rate'))

print("\n\n=== Premium units (avg rate >= 12.0) ===")
premium = rate_pivot[rate_pivot['classification'] == 'PREMIUM']
for unit in premium.index:
    print(f"\n{unit}:")
    udf = water[water["Unit umber"] == unit].sort_values(["month", cons_col])
    for _, row in udf.iterrows():
        c = row[cons_col]
        t = row["Total Amount"]
        # Try formula: total = cons * rate
        # For premium, first try: 62 + first_unit + (cons-1)*rate
        for rate_try in [12.31, 12.41, 12.48, 12.50, 12.65, 12.75]:
            est = 62.0 + 1.31 + max(0, c-1) * rate_try if c > 0 else 62.0
            if c == 1:
                est = 62.0 + 0.81
            diff = t - round(est, 2)
            if abs(diff) < 0.5:
                print(f"  m={row['month']} cons={c:6.1f} total={t:8.2f} MATCH rate={rate_try}")
                break
        else:
            # Try without minimum charge
            for rate_try in [12.31, 12.41, 12.48, 12.50, 12.65, 12.75]:
                est = c * rate_try
                diff = t - round(est, 2)
                if abs(diff) < 0.5:
                    print(f"  m={row['month']} cons={c:6.1f} total={t:8.2f} MATCH single_rate={rate_try}")
                    break
            else:
                # Check if 62 + cons*rate works
                for rate_try in [12.31, 12.41, 12.48, 12.50, 12.65, 12.75]:
                    est = 62 + c * rate_try
                    diff = t - round(est, 2)
                    if abs(diff) < 0.5:
                        print(f"  m={row['month']} cons={c:6.1f} total={t:8.2f} MATCH 62+cons*{rate_try}")
                        break
                else:
                    # Show raw data
                    first_unit = (t - 62 - (c-1)*12.31) if c > 0 else 0
                    print(f"  m={row['month']} cons={c:6.1f} total={t:8.2f} eff_rate={t/c if c>0 else 0:.4f} NO_MATCH")
