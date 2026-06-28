"""
EDNC Water Replay Script
Replays 1,000 water invoices through the Meter Verse billing engine formula
and compares against historical data.
"""
import pandas as pd
import os
import glob
from datetime import datetime

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
OUTPUT_DIR = r"D:\meter\Meter\reports"
MIN_CHARGE = 62.0

# Water tariff definition based on reverse engineering
# V1 (V1): 62 + 0.81(first_M3) + 10.81(rest)
# V2 (M02-M05): 62 + 1.31(first_M3) + 11.31(rest)
# Premium units: beltone, rowad, restaurant, some retail — use separate rates

PREMIUM_UNITS = [
    "Beltone-Building", "Rowad-building", "restaurant Building 1 EDNC",
    "Retail-302", "Retail-307", "Retail-308", "Retail-406", "Retail-407",
    "Retail-504", "Retail-505", "Retail-511", "Retail-514", "Retail-601",
    "Retail-602", "Retail-604", "Retail-702", "Retail-703",
    "Elrowwad Construction",
]

def calc_water_total(cons, month, unit):
    """Calculate expected water total using reverse-engineered formula."""
    if cons <= 0:
        return MIN_CHARGE

    month_num = int(month[:2])

    is_v1 = month_num == 1
    is_v2 = month_num >= 2

    if unit in PREMIUM_UNITS:
        if is_v1:
            # V1 premium: 62 + 0.81 + (cons-1) * 12.31
            first_rate = 0.81
            main_rate = 12.31
        else:
            # V2 premium: 62 + 0.0 + cons * 12.75
            first_rate = 0.0
            main_rate = 12.75
    else:
        if is_v1:
            first_rate = 0.81
            main_rate = 10.81
        else:
            first_rate = 1.31
            main_rate = 11.31

    if first_rate > 0:
        total = MIN_CHARGE + min(cons, 1.0) * first_rate + max(0, cons - 1.0) * main_rate
    else:
        total = MIN_CHARGE + cons * main_rate

    return round(total, 2)

# Load all water data from E&W files
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
print(f"Total water invoices: {len(data)}")

cons_col = "Consumption\nKWH/M3"
total_col = "Total Amount"

# Compute expected values
results = []
for _, row in data.iterrows():
    c = row[cons_col]
    actual_total = row[total_col]
    month = row["month"]
    unit = row["Unit umber"]
    expected = calc_water_total(c, month, unit)
    diff = actual_total - expected
    pct = abs(diff / actual_total * 100) if actual_total > 0 else 0

    if abs(diff) < 0.02:
        status = "MATCH"
    elif abs(diff) < 2.0:
        status = "CLOSE"
    elif abs(diff) < 5.0:
        status = "OK_MIN"
    elif abs(diff) < 20.0:
        status = "MARGINAL"
    else:
        status = "MISMATCH"

    results.append({
        "month": month,
        "unit": unit,
        "customer": row["Customer Name"],
        "meter": row["Meter Serial"],
        "cons": round(c, 2),
        "actual_total": round(actual_total, 2),
        "expected_total": round(expected, 2),
        "diff": round(diff, 2),
        "pct_error": round(pct, 2),
        "status": status,
    })

res_df = pd.DataFrame(results)
output_path = os.path.join(OUTPUT_DIR, "d2-water-replay-results.csv")
res_df.to_csv(output_path, index=False)
print(f"Output: {output_path}")

# Summary
print(f"\n=== REPLAY SUMMARY ===")
print(f"Total water invoices: {len(res_df)}")
print(f"Status counts: {res_df['status'].value_counts().to_dict()}")
print(f"Avg diff: {res_df['diff'].mean():.4f}")
print(f"Max abs diff: {res_df['diff'].abs().max():.2f}")
print(f"Zero-diff (MATCH): {(res_df['diff'].abs() < 0.01).sum()}/{len(res_df)}")

# By month
print(f"\n=== By Month ===")
for m in sorted(res_df["month"].unique()):
    mdf = res_df[res_df["month"] == m]
    match_rate = (mdf["diff"].abs() < 0.02).mean()
    print(f"  {m}: n={len(mdf)}, match={match_rate:.1%}, avg_diff={mdf['diff'].mean():.3f}")

# By unit type
print(f"\n=== By Premium vs Standard ===")
for label, mask in [("Standard", ~res_df["unit"].isin(PREMIUM_UNITS)),
                     ("Premium", res_df["unit"].isin(PREMIUM_UNITS))]:
    mdf = res_df[mask]
    if len(mdf) > 0:
        match_rate = (mdf["diff"].abs() < 0.02).mean()
        print(f"  {label}: n={len(mdf)}, match={match_rate:.1%}, avg_diff={mdf['diff'].mean():.3f}")

# Mismatches
print(f"\n=== MISMATCH rows ===")
mismatch = res_df[res_df["status"] == "MISMATCH"]
if len(mismatch) > 0:
    for _, row in mismatch.iterrows():
        print(f"  {row['month']} {row['unit']:30s} cons={row['cons']:8.2f} actual={row['actual_total']:8.2f} expected={row['expected_total']:8.2f} diff={row['diff']:8.2f}")
else:
    print("  None!")
