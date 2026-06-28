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

# Focus on min=62 group only
zero = water[water[cons_col] == 0]
min62_units = set(zero[zero["Total Amount"] == 62.0]["Unit umber"])
w62 = water[water["Unit umber"].isin(min62_units)].copy()

print("=== Testing progressive band formulas (min=62 group) ===")
print()

def calc_water_progressive(cons, first_rate, first_cons, bands):
    """bands = [(limit, rate), ...], last limit = inf"""
    if cons <= 0:
        return 62.0
    total = 62.0
    remaining = cons
    prev_limit = 0
    
    # First unit special rate
    billable = min(remaining, first_cons)
    total += billable * first_rate
    remaining -= billable
    prev_limit = first_cons
    
    for limit, rate in bands:
        if remaining <= 0:
            break
        band_size = limit - prev_limit if limit != float('inf') else float('inf')
        billable = min(remaining, band_size)
        total += billable * rate
        remaining -= billable
        prev_limit = limit
    
    return round(total, 2)

# Try different band structures for V1 (M01) and V2 (M02-M05)
for m in sorted(w62["month"].unique()):
    mdf = w62[w62["month"] == m].copy()
    print(f"\n--- Month {m} ({len(mdf)} rows) ---")
    
    candidates = []
    
    if m == "01-2026":
        # V1: first unit=0.81, band1 rate=10.81
        for band1 in [10.81]:
            for b2_rate in [11.31, 11.81, 12.31, 12.81]:
                for b2_start in [50, 100, 200]:
                    bands = [(b2_start, band1), (float('inf'), b2_rate)]
                    mdf["est"] = mdf[cons_col].apply(
                        lambda c: calc_water_progressive(c, 0.81, 1.0, bands))
                    diff = (mdf["Total Amount"] - mdf["est"]).abs()
                    exact = (diff < 0.02).mean()
                    close = (diff < 1.0).mean()
                    candidates.append((exact, close, band1, b2_start, b2_rate))
    else:
        # V2: first unit=1.31, band1 rate=11.31
        for band1 in [11.31]:
            for b2_rate in [11.81, 12.31, 12.81]:
                for b2_start in [50, 100, 200]:
                    bands = [(b2_start, band1), (float('inf'), b2_rate)]
                    mdf["est"] = mdf[cons_col].apply(
                        lambda c: calc_water_progressive(c, 1.31, 1.0, bands))
                    diff = (mdf["Total Amount"] - mdf["est"]).abs()
                    exact = (diff < 0.02).mean()
                    close = (diff < 1.0).mean()
                    candidates.append((exact, close, band1, b2_start, b2_rate))
    
    # Show top 3 candidates
    candidates.sort(key=lambda x: x[0], reverse=True)
    for exact, close, b1, b2_start, b2_rate in candidates[:5]:
        print(f"  exact={exact:.1%} close={close:.1%} | band1={b1}(->{b2_start}), band2={b2_rate}({b2_start}+)")
    
    # Best candidate detailed
    best = candidates[0]
    b1_rate = best[2]
    b2_start = best[3]
    b2_rate = best[4]
    
    if m == "01-2026":
        bands_best = [(b2_start, b1_rate), (float('inf'), b2_rate)]
        mdf["est"] = mdf[cons_col].apply(lambda c: calc_water_progressive(c, 0.81, 1.0, bands_best))
    else:
        bands_best = [(b2_start, b1_rate), (float('inf'), b2_rate)]
        mdf["est"] = mdf[cons_col].apply(lambda c: calc_water_progressive(c, 1.31, 1.0, bands_best))
    
    mdf["diff"] = mdf["Total Amount"] - mdf["est"]
    print(f"  Best residual: mean={mdf['diff'].mean():.3f}, max|diff|={mdf['diff'].abs().max():.2f}")
    
    # Show mismatches
    bad = mdf[mdf["diff"].abs() >= 0.02]
    if len(bad) > 0:
        print(f"  Mismatches: {len(bad)} rows")
        for _, row in bad.head(10).iterrows():
            print(f"    cons={row[cons_col]:6.1f} actual={row['Total Amount']:8.2f} est={row['est']:8.2f} diff={row['diff']:6.2f} unit={row['Unit umber']}")

# Now try with 3 bands for better match
print("\n\n=== 3-band progressive search ===")
for m in ["02-2026"]:
    mdf = w62[w62["month"] == m].copy()
    print(f"\n--- Month {m} ({len(mdf)} rows) ---")
    best_match = 0
    best_config = None
    
    # Search: band1=11.31, band2=11.81, band3=12.31 with different boundaries
    for b2_start in [30, 40, 50, 60, 70, 80, 90, 100]:
        for b3_start in [80, 100, 150, 200, 300]:
            if b3_start <= b2_start:
                continue
            bands = [(b2_start, 11.31), (b3_start, 11.81), (float('inf'), 12.31)]
            mdf["est"] = mdf[cons_col].apply(
                lambda c: calc_water_progressive(c, 1.31, 1.0, bands))
            diff = (mdf["Total Amount"] - mdf["est"]).abs()
            exact = (diff < 0.02).mean()
            if exact > best_match:
                best_match = exact
                best_config = (b2_start, b3_start)
    
    print(f"  Best 3-band: b2_start={best_config[0]}, b3_start={best_config[1]}, exact={best_match:.1%}")
    
    # Try also different band 2 rates
    best_match = 0
    best_config = None
    for b2_rate in [11.31, 11.81, 12.31, 12.81]:
        for b2_start in [10, 20, 30, 40, 50]:
            bands = [(b2_start, b2_rate), (float('inf'), 12.81)]
            mdf["est"] = mdf[cons_col].apply(
                lambda c: calc_water_progressive(c, 1.31, 1.0, bands))
            diff = (mdf["Total Amount"] - mdf["est"]).abs()
            exact = (diff < 0.02).mean()
            close = (diff < 1.0).mean()
            if exact > best_match:
                best_match = exact
                best_config = (b2_rate, b2_start, close)
    
    print(f"  Best 2-band: band1={best_config[0]}(->{best_config[1]}), band2=12.81({best_config[1]}+), exact={best_match:.1%}, close={best_config[2]:.1%}")
    
    # And check: what if it's just a single rate with the first unit adjustment?
    for rate in [11.31, 11.81, 12.31, 12.81]:
        mdf["est"] = mdf[cons_col].apply(
            lambda c: calc_water_progressive(c, 1.31, 1.0, [(float('inf'), rate)]))
        diff = (mdf["Total Amount"] - mdf["est"]).abs()
        exact = (diff < 0.02).mean()
        close = (diff < 1.0).mean()
        print(f"  Single rate {rate}: exact={exact:.1%}, close={close:.1%}")
