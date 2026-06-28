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
total_col = "Total Amount"
min_charge = 62.00

# Analyze by month separately
print("=== MARGINAL RATE ANALYSIS BY MONTH (cons >= 5) ===")
for m in sorted(water["month"].unique()):
    mdf = water[water["month"] == m].sort_values(cons_col).reset_index(drop=True)
    mdf = mdf[mdf[cons_col] >= 5]  # Only cons >= 5 for cleaner analysis
    
    rates = []
    for i in range(1, len(mdf)):
        prev = mdf.iloc[i-1]
        curr = mdf.iloc[i]
        dc = curr[cons_col] - prev[cons_col]
        dt = curr[total_col] - prev[total_col]
        if 0.5 < dc < 10 and abs(dt) > 0:
            rates.append(round(dt/dc, 2))
    
    unique_rates = sorted(set(rates))
    print(f"\nMonth {m} ({len(mdf)} rows): marginal rates = {unique_rates}")
    
    # Try to identify band boundaries
    print(f"  Cons range: {mdf[cons_col].min():.1f} - {mdf[cons_col].max():.1f}")
    
    # Group by consumption ranges
    for band_start in range(0, 200, 20):
        band = mdf[(mdf[cons_col] >= band_start) & (mdf[cons_col] < band_start + 20)]
        if len(band) > 0:
            # Calculate avg total and avg cons to get implied rate
            avg_cons = band[cons_col].mean()
            avg_total = band[total_col].mean()
            implied_rate = (avg_total - min_charge) / avg_cons if avg_cons > 0 else 0
            print(f"    Band {band_start}-{band_start+20}: n={len(band)}, avg_cons={avg_cons:.1f}, implied_rate={implied_rate:.4f}")

    # Also check 0-5 band
    small = mdf[mdf[cons_col] < 5]
    if len(small) > 0:
        # Check if these have a different min charge
        for _, row in small.iterrows():
            c = row[cons_col]
            t = row[total_col]
            eff = (t - min_charge) / c if c > 0 else 0
            print(f"    small: cons={c:.1f}, total={t:.2f}, rate_above_min={eff:.4f}")

print("\n\n=== CHECK: Is total = min_charge + round(cons * rate, 2)? ===")
# Test hypothesis: for each month, there's a single rate
for m in sorted(water["month"].unique()):
    mdf = water[water["month"] == m].copy()
    mdf["est_total"] = round(min_charge + mdf[cons_col] * 10.81, 2)
    mdf["diff"] = mdf[total_col] - mdf["est_total"]
    mdf["abs_diff"] = mdf["diff"].abs()
    match_rate = (mdf["abs_diff"] < 1.0).mean()
    print(f"Month {m}: flat_rate=10.81 => match_rate (<1 diff) = {match_rate:.1%}, avg_diff={mdf['diff'].mean():.2f}")

# Try different rates
for rate_try in [10.81, 11.31, 11.81, 12.31, 12.81]:
    match_rates = []
    for m in sorted(water["month"].unique()):
        mdf = water[water["month"] == m].copy()
        mdf["est_total"] = round(min_charge + mdf[cons_col] * rate_try, 2)
        mdf["diff"] = mdf[total_col] - mdf["est_total"]
        mdf["abs_diff"] = mdf["diff"].abs()
        match = (mdf["abs_diff"] < 0.5).mean()
        match_rates.append(match)
    avg_match = sum(match_rates) / len(match_rates)
    print(f"Flat rate {rate_try}: avg match = {avg_match:.1%}")
