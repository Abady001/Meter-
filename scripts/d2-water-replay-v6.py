"""
EDNC Water Replay v6 — Lean: per-unit-month rate estimation
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

# For each unit, compute per-month rate from cons>=5 rows
unit_rates = {}
for unit, grp in data.groupby("Unit umber"):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    r = {}
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        big = mdf[mdf[cons_col] >= 5]
        if len(big) > 0:
            row = big.iloc[0]
            c = row[cons_col]
            t = row[total_col]
            r[month] = (t - mc) / c
        else:
            r[month] = None
    unit_rates[unit] = r

def best_rate(unit, month):
    """Get the best rate for a unit-month. Try current month, then any month."""
    r = unit_rates.get(unit, {})
    v = r.get(month)
    if v is not None:
        return v
    # Try any other month's rate
    for m, v in r.items():
        if v is not None:
            return v
    # Fallback to standard
    return 10.81 if month.startswith("01") else 11.31

results = []
for _, row in data.iterrows():
    c = row[cons_col]
    month = row["month"]
    unit = row["Unit umber"]
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    rate = best_rate(unit, month)
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
total_ok = (res_df['diff'].abs() < 5.0).sum()
print(f"OK-or-better: {total_ok}/{len(res_df)} ({100*total_ok/len(res_df):.1f}%)")
total_match = (res_df['diff'].abs() < 0.02).sum()
print(f"MATCH: {total_match}/{len(res_df)} ({100*total_match/len(res_df):.1f}%)")

for m in sorted(res_df["month"].unique()):
    mdf = res_df[res_df["month"] == m]
    match = (mdf["diff"].abs() < 0.02).mean()
    ok = (mdf["diff"].abs() < 5.0).mean()
    mismatch = (mdf["diff"].abs() >= 20.0).sum()
    print(f"  {m}: n={len(mdf)}, MATCH={match:.0%}, OK+={ok:.0%}, MIS={mismatch}")

mis = res_df[res_df["status"] == "MISMATCH"]
if len(mis) > 0:
    print(f"\nMISMATCH ({len(mis)} rows):")
    for _, r in mis.sort_values(["month", "unit"]).iterrows():
        print(f"  {r['month']} {r['unit']:30s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
