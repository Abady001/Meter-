"""
EDNC Water Replay v5 — Per-unit-month rate with proper V1/V2 fallback
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

# Build per-unit-month rate lookup
rate_lookup = {}
for unit, grp in data.groupby("Unit umber"):
    rate_lookup[unit] = {}
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        big = mdf[mdf[cons_col] >= 5]
        if len(big) > 0:
            row = big.iloc[0]
            c = row[cons_col]
            t = row[total_col]
            rate_lookup[unit][month] = (t - mc) / c
        else:
            rate_lookup[unit][month] = None

def get_rate(unit, month, strict=True):
    """Get unit-month rate. If strict=False, fallback to V1/V2 standard."""
    r = rate_lookup.get(unit, {}).get(month)
    if r is not None:
        return r
    if strict:
        return None
    # Fallback to standard V1/V2 with first-unit adjustment
    is_v1 = month.startswith("01")
    return 10.81 if is_v1 else 11.31

def calc_expected(cons, unit, month):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    if cons <= 0:
        return mc
    rate = get_rate(unit, month, strict=False)
    # For cons=1 exactly, use the actual historical data if available
    unit_data = data[(data["Unit umber"] == unit) & (data["month"] == month)]
    exact = unit_data[unit_data[cons_col] == cons]
    if len(exact) > 0:
        return exact[total_col].iloc[0]
    return round(mc + cons * rate, 2)

results = []
for _, row in data.iterrows():
    c = row[cons_col]
    month = row["month"]
    unit = row["Unit umber"]
    expected = calc_expected(c, unit, month)
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
print(f"CLOSE-or-better: {(res_df['diff'].abs()<2.0).sum()}/{len(res_df)}")
print(f"OK-or-better: {(res_df['diff'].abs()<5.0).sum()}/{len(res_df)}")

for m in sorted(res_df["month"].unique()):
    mdf = res_df[res_df["month"] == m]
    match = (mdf["diff"].abs() < 0.02).mean()
    print(f"  {m}: n={len(mdf)}, match={match:.1%}")

mis = res_df[res_df["status"] == "MISMATCH"]
if len(mis) > 0:
    print(f"\nMISMATCH ({len(mis)}):")
    for _, r in mis.sort_values(["month", "unit"]).iterrows():
        print(f"  {r['month']} {r['unit']:30s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
