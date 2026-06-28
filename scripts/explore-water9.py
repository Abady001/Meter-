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

# Check min charges by unit
print("=== Unique min charges (cons=0) ===")
zero = water[water[cons_col] == 0]
for mc in sorted(zero["Total Amount"].unique()):
    units = zero[zero["Total Amount"] == mc]["Unit umber"].unique()
    print(f"  Min={mc}: {len(units)} units, e.g. {units[:5]}")

# For each distinct min_charge group, analyze separately
for min_charge in sorted(water[water[cons_col] == 0]["Total Amount"].unique()):
    min_units = set(zero[zero["Total Amount"] == min_charge]["Unit umber"])
    subset = water[water["Unit umber"].isin(min_units)].copy()
    
    print(f"\n\n{'='*60}")
    print(f"MIN CHARGE = {min_charge} ({len(subset)} rows, {len(min_units)} units)")
    print('='*60)
    
    # Show first few rows with cons > 0
    pos = subset[subset[cons_col] > 0].sort_values(cons_col).head(10)
    for _, row in pos.iterrows():
        c = row[cons_col]
        t = row["Total Amount"]
        cc = t - min_charge
        eff = cc / c if c > 0 else 0
        print(f"  m={row['month']} unit={row['Unit umber']:30s} cons={c:6.1f} total={t:8.2f} cc={cc:8.2f} eff_rate={eff:.4f}")

    # Split by month and analyze marginal rates
    for m in sorted(subset["month"].unique()):
        mdf = subset[subset["month"] == m].sort_values(cons_col).reset_index(drop=True)
        
        # Look at marginal rates for adjacent consumption values
        print(f"\n  --- Month {m} ---")
        
        # Show the small consumption pattern (first 10 rows with cons)
        small = mdf[mdf[cons_col] > 0].head(10)
        prev_c = None
        prev_t = None
        for _, row in small.iterrows():
            c = row[cons_col]
            t = row["Total Amount"]
            if prev_c is not None and c > prev_c:
                dc = c - prev_c
                dt = t - prev_t
                mr = dt / dc if dc > 0 else 0
                print(f"    cons={c:6.1f} total={t:8.2f} marginal_rate={mr:.4f}")
            else:
                print(f"    cons={c:6.1f} total={t:8.2f} (first)")
            prev_c = c
            prev_t = t
        
        # Build formula: total = min + first_unit_fee + sum(band charges)
        # First, determine the rate after first unit
        cons_vals = mdf[mdf[cons_col] > 0][cons_col].unique()
        if len(cons_vals) >= 2:
            c1 = min(cons_vals)
            r1 = mdf[mdf[cons_col] == c1].iloc[0]
            t1 = r1["Total Amount"]
            first_unit_rate = (t1 - min_charge) / c1 if c1 > 0 else 0
            print(f"    First unit rate (at cons={c1}): {first_unit_rate:.4f}")
        
        # Try formula: total = min + first_fee + (cons - first_cons) * rate
        if len(cons_vals) >= 2:
            c1_val = min(cons_vals)
            r1 = mdf[mdf[cons_col] == c1_val].iloc[0]
            t1 = r1["Total Amount"]
            
            # For each subsequent cons, calc implied rate from first
            print(f"    Implied marginal rates from first point (cons={c1_val}, total={t1}):")
            for _, row in mdf[mdf[cons_col] > c1_val].head(5).iterrows():
                c = row[cons_col]
                t = row["Total Amount"]
                dc = c - c1_val
                dt = t - t1
                mr = dt / dc if dc > 0 else 0
                print(f"      cons={c:6.1f} marginal={mr:.4f}")
            
            # Try: total = min + 0.81 + (cons-1)*X for M01
            if m == "01-2026":
                for rate_try in [10.81, 11.31, 11.81]:
                    mdf["est"] = min_charge + 0.81 + (mdf[cons_col] - c1_val) * rate_try
                    mdf["est"] = mdf["est"].where(mdf[cons_col] > 0, min_charge)
                    diff = (mdf["Total Amount"] - mdf["est"]).abs()
                    match = (diff / mdf["Total Amount"].replace(0, 1) < 0.01).mean()
                    print(f"      formula: min+0.81+(cons-{c1_val})*{rate_try}: match={match:.1%}")
            
            if m in ["02-2026", "03-2026", "04-2026", "05-2026"]:
                for rate_try in [11.31, 11.81, 12.31, 12.81]:
                    mdf["est"] = min_charge + 1.31 + (mdf[cons_col] - c1_val) * rate_try
                    mdf["est"] = mdf["est"].where(mdf[cons_col] > 0, min_charge)
                    diff = (mdf["Total Amount"] - mdf["est"]).abs()
                    match = (diff / mdf["Total Amount"].replace(0, 1) < 0.01).mean()
                    print(f"      formula: min+1.31+(cons-{c1_val})*{rate_try}: match={match:.1%}")
