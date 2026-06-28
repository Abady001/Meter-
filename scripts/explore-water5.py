import pandas as pd, os, glob

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
cons_col = "Consumption\nKWH/M3"

# Load all E&W water data
all_water = []
for f in sorted(glob.glob(os.path.join(base, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "WATER"].copy()
    if len(water):
        month = os.path.basename(f).split(" ")[-1].replace(".xlsx","")
        water["month"] = month
        all_water.append(water)

water = pd.concat(all_water, ignore_index=True)

# Compute implied consumption charge (total - min_charge)
# For cons=0: total=62.00, so min_charge = 62.00
min_charge = 62.00

water["implied_cc"] = water["Total Amount"] - min_charge
water["implied_rate"] = water["implied_cc"] / water[cons_col]
water["implied_rate"] = water["implied_rate"].where(water[cons_col] > 0, 0)

print("=== Rate analysis by band ===")
for lo, hi in [(0, 1), (1, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, 100), (100, 200), (200, 9999)]:
    subset = water[(water[cons_col] > lo) & (water[cons_col] <= hi)]
    if len(subset):
        # Calculate actual marginal rate from differences
        sorted_subset = subset.sort_values(cons_col)
        rates = []
        for i in range(1, len(sorted_subset)):
            prev = sorted_subset.iloc[i-1]
            curr = sorted_subset.iloc[i]
            dc = curr[cons_col] - prev[cons_col]
            dt = curr["Total Amount"] - prev["Total Amount"]
            if 0.5 < dc < 5 and abs(dt) > 0:
                rates.append(round(dt/dc, 2))
        
        avg_implied = subset["implied_rate"].mean()
        print(f"\nBand {lo}-{hi}: {len(subset)} rows")
        print(f"  Implied avg rate (total-62)/cons: {avg_implied:.4f}")
        print(f"  Implied rate range: {subset['implied_rate'].min():.4f} - {subset['implied_rate'].max():.4f}")
        if rates:
            unique_rates = sorted(set(rates))
            print(f"  Marginal rates (diff method): {unique_rates[:15]}")

print("\n\n=== Water formula reconstruction ===")
# Try formula: Total = 62 + sum of band charges
# First, deduce band rates from regression
for _, row in water[water[cons_col] > 0].head(20).iterrows():
    c = row[cons_col]
    total = row["Total Amount"]
    cc = total - min_charge
    implied_per_unit = cc / c
    print(f"  cons={c:6.1f}, total={total:8.2f}, cc={cc:8.2f}, rate/M3={implied_per_unit:.4f}")

print("\n\n=== Try: Total = 62 + cons * rate_per_band ===")
# Try different band structures
def calc_water(cons, rates, bands):
    """Calculate water charge given cons and progressive rates"""
    total = min_charge
    remaining = cons
    prev = 0
    for i, (lo, hi, rate) in enumerate(rates):
        band_size = hi - lo
        if remaining > 0:
            billable = min(remaining, band_size)
            total += billable * rate
            remaining -= billable
    return round(total, 2)

# Test hypothesis: what rates work?
for _, row in water[water[cons_col] > 0].head(10).iterrows():
    c = row[cons_col]
    actual = row["Total Amount"]
    # Try: flat rate of 10.81
    est1 = round(min_charge + c * 10.81, 2)
    diff1 = actual - est1
    
    # Try: flat rate of 12.31
    est2 = round(min_charge + c * 12.31, 2)
    diff2 = actual - est2
    
    print(f"  cons={c:6.1f}, actual={actual:8.2f}, flat10.81={est1:8.2f}(diff={diff1:6.2f}), flat12.31={est2:8.2f}(diff={diff2:6.2f})")
