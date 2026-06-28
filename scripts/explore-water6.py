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

# Sort by consumption
water_sorted = water.sort_values(cons_col).reset_index(drop=True)
total_col = "Total Amount"

# Find the marginal rate between each consecutive consumption value
print("=== Marginal rate transitions (sorted by cons) ===")
prev_c = None
prev_t = None
for idx, row in water_sorted.iterrows():
    c = row[cons_col]
    t = row[total_col]
    if prev_c is not None and c > prev_c and (c - prev_c) < 5:
        dc = c - prev_c
        dt = t - prev_t
        rate = dt / dc if dc > 0 else 0
        if rate > 0:
            print(f"  cons={c:6.1f}, total={t:8.2f}, marginal_rate={rate:.4f} (dc={dc:.1f}, dt={dt:.2f})")
    prev_c = c
    prev_t = t

# Also look at the summary by sorted unique cons values
print("\n\n=== Consumption charge incremental analysis ===")
min_charge = water[water[cons_col] == 0]["Total Amount"].iloc[0] if len(water[water[cons_col] == 0]) > 0 else 62.00
print(f"Minimum charge (cons=0): {min_charge}")

# For the first 20 unique consumption values, show the incremental charge
uniq_cons = sorted(water[cons_col].unique())
print(f"\nFirst 30 unique consumption values (showing charge build-up):")
prev_c = None
prev_cc = None
for c in uniq_cons[:40]:
    subset = water[water[cons_col] == c]
    if len(subset) > 0:
        t = subset[total_col].iloc[0]
        cc = t - min_charge  # consumption charge above minimum
        per_unit = cc / c if c > 0 else 0
        # Marginal difference from previous
        if prev_c is not None and prev_cc is not None and c > prev_c:
            dc = c - prev_c
            dt = cc - prev_cc
            marginal = dt / dc if dc > 0 else 0
            print(f"  cons={c:5.1f}, total={t:8.2f}, cc={cc:8.2f}, per_unit={per_unit:.4f}, marginal={marginal:.4f} (dc={dc:.1f})")
        else:
            print(f"  cons={c:5.1f}, total={t:8.2f}, cc={cc:8.2f}, per_unit={per_unit:.4f}")
        prev_c = c
        prev_cc = cc

# Check for different months - is the rate constant?
print("\n\n=== Rate by month ===")
for m in sorted(water["month"].unique()):
    mdf = water[water["month"] == m]
    mdf["effective_rate"] = (mdf[total_col] - min_charge) / mdf[cons_col]
    mdf["effective_rate"] = mdf["effective_rate"].where(mdf[cons_col] > 0, 0)
    print(f"  Month {m}: avg_eff_rate={mdf['effective_rate'].mean():.4f}, mid_cons_rate={mdf[mdf[cons_col].between(30, 100)]['effective_rate'].mean():.4f}")
