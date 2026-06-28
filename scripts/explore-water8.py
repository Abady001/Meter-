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

# Check unit type distribution
print("=== Unit type distribution ===")
print(water["Unit umber"].value_counts().head(30))
print(f"\nTotal unique units: {water['Unit umber'].nunique()}")

# Check if different units have different minimum charges
print("\n=== Minimum charge by unit (cons=0) ===")
zero_cons = water[water[cons_col] == 0]
print(f"Rows with cons=0: {len(zero_cons)}")
for _, row in zero_cons.iterrows():
    print(f"  unit={row['Unit umber']}, total={row[total_col]}, month={row['month']}")

# Check if the cons=1.0 with total=62.81 is from a specific unit
print("\n=== cons=1.0 rows ===")
c1 = water[water[cons_col] == 1.0]
for _, row in c1.iterrows():
    print(f"  unit={row['Unit umber']}, total={row[total_col]}, month={row['month']}")

# Let's try to solve: total = min_charge + cons * rate  
# where min_charge might differ by unit or month
# First, check if total/cons is constant for each unit
print("\n=== Rate consistency by unit (min 3 readings) ===")
for unit, grp in water.groupby("Unit umber"):
    if len(grp) >= 3 and grp[cons_col].sum() > 0:
        rates = []
        for _, row in grp.iterrows():
            c = row[cons_col]
            if c > 0:
                rate = (row[total_col] - 62) / c
                rates.append(rate)
        if len(rates) >= 2:
            min_r = min(rates)
            max_r = max(rates)
            if max_r - min_r > 0.5:
                print(f"  {unit}: rates vary {min_r:.4f}-{max_r:.4f} (DIFF={max_r-min_r:.4f})")

# Check: what if total = 62 + sum of progressive band charges?
# Try: Band 0-10: 11.31, Band 10-20: 11.31, Band 20-50: 11.81, Band 50+: 12.81
def calc_progressive(cons, bands):
    """bands is list of (upper_bound, rate). Last upper_bound=inf"""
    total = 62.0
    remaining = cons
    prev_limit = 0
    for limit, rate in bands:
        if remaining <= 0:
            break
        billable = min(remaining, limit - prev_limit) if limit != float('inf') else remaining
        total += billable * rate
        remaining -= billable
        prev_limit = limit
    return round(total, 2)

# Test various band structures
print("\n=== Testing progressive band formulas ===")
candidates = [
    # (name, [(limit, rate), ...])
    ("2-band 50", [(50, 11.31), (float('inf'), 12.81)]),
    ("2-band 100", [(100, 11.81), (float('inf'), 12.81)]),
    ("3-band 10/50", [(10, 11.31), (50, 11.81), (float('inf'), 12.81)]),
    ("3-band 20/100", [(20, 11.31), (100, 11.81), (float('inf'), 12.81)]),
    ("3-band 10/100", [(10, 11.31), (100, 11.81), (float('inf'), 12.81)]),
    ("4-band 10/20/50", [(10, 11.31), (20, 11.31), (50, 11.81), (float('inf'), 12.81)]),
    ("5-band 10/20/30/50", [(10, 11.31), (20, 11.31), (30, 11.31), (50, 11.81), (float('inf'), 12.81)]),
]

for name, bands in candidates:
    water[name] = water.apply(lambda r: calc_progressive(r[cons_col], bands) if r[cons_col] > 0 else 62.0, axis=1)
    water["diff"] = water[total_col] - water[name]
    water["abs_diff"] = water["diff"].abs()
    exact = (water["abs_diff"] < 0.01).mean()
    close1 = (water["abs_diff"] < 1.0).mean()
    print(f"{name}: exact={exact:.1%}, close1={close1:.1%}, avg_diff={water['diff'].mean():.2f}, max|diff|={water['abs_diff'].max():.2f}")

# Check the best candidate's residuals by month
best_name = candidates[0][0]
print(f"\n=== Residuals by month (best: {best_name}) ===")
for m in sorted(water["month"].unique()):
    mdf = water[water["month"] == m]
    diff = mdf[total_col] - mdf[best_name]
    mae = diff.abs().mean()
    print(f"  {m}: MAE={mae:.3f}, max|diff|={diff.abs().max():.2f}")

# Let me try searching for exact rates
print("\n=== Brute-force search for band rates ===")
# For month 01, use cons>=10 data points to find rates
m1 = water[water["month"] == "01-2026"].copy()
m1_big = m1[m1[cons_col] >= 10]

# For each row, we know total and cons. 
# If formula is: total = 62 + sum(band_charges), with bands 0-10, 10-20, 20-50, 50+
# Then we can solve for the rates

# Let's compute what the effective band rates would be
for _, row in m1_big.head(10).iterrows():
    c = row[cons_col]
    t = row[total_col]
    cc = t - 62
    eff = cc / c
    print(f"  cons={c:6.1f}, total={t:8.2f}, cc={cc:8.2f}, eff_rate={eff:.4f}")
