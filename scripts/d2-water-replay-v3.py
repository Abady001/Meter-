"""
EDNC Water Replay v3 — Per-unit rate table approach
"""
import pandas as pd, os, glob

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
OUTPUT_DIR = r"D:\meter\Meter\reports"
MIN_CHARGE = 62.0
ALT_MIN_UNITS = {"Offices-7-0-4", "Offices-6-3-3"}
ALT_MIN = 37.01

cons_col = "Consumption\nKWH/M3"
total_col = "Total Amount"

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

# Build per-unit rate table
# For each unit, find months where they have cons >= 5, compute rate
unit_rate_map = {}
for unit, grp in data.groupby("Unit umber"):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    rates_by_month = {}
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        big = mdf[mdf[cons_col] >= 5]
        if len(big) > 0:
            c = big[cons_col].iloc[0]
            t = big[total_col].iloc[0]
            rates_by_month[month] = (t - mc) / c
    # Use the most common rate, or any rate available
    if rates_by_month:
        unit_rate_map[unit] = sum(rates_by_month.values()) / len(rates_by_month)
    else:
        unit_rate_map[unit] = None

# For units with no rate (only small cons), use nearest neighbor approach
# Or just use the standard formula
def get_unit_rate(unit, month_str):
    """Get rate for a unit, with fallback."""
    rate = unit_rate_map.get(unit)
    if rate is not None:
        return rate
    # Fallback: standard V1/V2 rate
    return 10.81 if month_str.startswith("01") else 11.31

# Replay
results = []
for _, row in data.iterrows():
    c = row[cons_col]
    month = row["month"]
    unit = row["Unit umber"]
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE

    rate = get_unit_rate(unit, month)
    expected = round(mc + c * rate, 2)

    actual = row[total_col]
    diff = actual - expected

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
        "month": month, "unit": unit, "customer": row["Customer Name"],
        "meter": row["Meter Serial"], "cons": round(c, 2),
        "actual_total": round(actual, 2), "expected_total": round(expected, 2),
        "diff": round(diff, 2), "status": status,
    })

res_df = pd.DataFrame(results)
res_df.to_csv(os.path.join(OUTPUT_DIR, "d2-water-replay-results.csv"), index=False)

print(f"Total: {len(res_df)}")
print(f"Status: {res_df['status'].value_counts().to_dict()}")
print(f"Avg diff: {res_df['diff'].mean():.4f}")
print(f"MATCH: {(res_df['diff'].abs()<0.02).sum()}/{len(res_df)}")

# By month
for m in sorted(res_df["month"].unique()):
    mdf = res_df[res_df["month"] == m]
    match = (mdf["diff"].abs() < 0.02).mean()
    print(f"  {m}: n={len(mdf)}, match={match:.1%}")

# MISMATCH details
mis = res_df[res_df["status"] == "MISMATCH"]
if len(mis) > 0:
    print(f"\nMISMATCH ({len(mis)}):")
    for _, r in mis.sort_values(["month", "unit"]).iterrows():
        print(f"  {r['month']} {r['unit']:30s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
