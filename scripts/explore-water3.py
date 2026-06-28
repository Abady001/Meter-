import pandas as pd, os, glob

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
water_files = sorted(glob.glob(os.path.join(base, "EDNC W Review*.xlsx")))

all_water = []
for fp in water_files:
    df = pd.read_excel(fp)
    fname = os.path.basename(fp)
    month = fname.split(" ")[-1].replace(".xlsx", "")
    cons_col = "Consumption\nKWH/M3"
    print(f"=== {fname} ({len(df)} rows) ===")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Cons: {df[cons_col].min():.1f} - {df[cons_col].max():.1f}, mean={df[cons_col].mean():.1f}")
    total_col = df.columns[df.columns.str.contains('Total|Amount|New', case=False)][0]
    print(f"  Total column: {total_col}")
    print(f"  Total: {df[total_col].min():.2f} - {df[total_col].max():.2f}")

    # Sample 5 rows
    print(f"  Samples:")
    for _, row in df.head(5).iterrows():
        c = row[cons_col]
        t = row[total_col]
        eff_rate = t / c if c > 0 else 0
        print(f"    cons={c:8.1f}, total={t:8.2f}, rate={eff_rate:.4f}, tax={row['Taxs']:6.2f}, csrv={row['Customer Service']:6.2f}")
    print()

    # Store for aggregate analysis
    w = df.copy()
    w["month"] = month
    w["total_col_name"] = total_col
    all_water.append(w)

# Combined analysis
combined = pd.concat(all_water, ignore_index=True)
cons_col = "Consumption\nKWH/M3"
print(f"\n=== Combined ({len(combined)} rows) ===")
print(f"  Cons range: {combined[cons_col].min():.1f} - {combined[cons_col].max():.1f}")

# Marginal rate analysis
print("\n=== Marginal Rate Analysis ===")
# Sort by consumption and calculate marginal rate between adjacent rows
sorted_df = combined.sort_values(cons_col).reset_index(drop=True)
sorted_df["next_cons"] = sorted_df[cons_col].shift(-1)
sorted_df["next_total"] = sorted_df["New Amount"].shift(-1)
sorted_df["delta_cons"] = sorted_df["next_cons"] - sorted_df[cons_col]
sorted_df["delta_total"] = sorted_df["next_total"] - sorted_df["New Amount"]
sorted_df["marginal_rate"] = sorted_df["delta_total"] / sorted_df["delta_cons"]
sorted_df["marginal_rate"] = sorted_df["marginal_rate"].round(4)

# Show unique marginal rates (excluding very small deltas)
significant = sorted_df[(sorted_df["delta_cons"] > 0.5) & (sorted_df["delta_cons"] < 10)]
rates = sorted(significant["marginal_rate"].dropna().unique())
print(f"  Unique marginal rates found (small deltas): {rates}")

# Also check larger delta ranges
significant2 = sorted_df[(sorted_df["delta_cons"] >= 10)]
rates2 = sorted(significant2["marginal_rate"].dropna().unique())
print(f"  Unique marginal rates found (large deltas): {rates2}")

# Check band boundaries
print("\n=== Rate by consumption band ===")
for band_start in [0, 10, 20, 30, 40, 50]:
    band = combined[(combined[cons_col] > band_start) & (combined[cons_col] <= band_start + 10)]
    if len(band):
        rates_in_band = set()
        for _, row in band.iterrows():
            c = row[cons_col]
            t = row["New Amount"]
            eff = round(t / c, 4) if c > 0 else 0
            rates_in_band.add(eff)
        print(f"  {band_start}-{band_start+10}: {len(band)} rows, rates={sorted(rates_in_band)[:10]}")
