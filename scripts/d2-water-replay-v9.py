"""
EDNC Water Replay v9 — Handle fractional consumption (<1 M3) correctly
"""
import pandas as pd, os, glob

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
OUTPUT_DIR = r"D:\meter\Meter\reports"
MIN_CHARGE = 62.0
ALT_MIN_UNITS = {"Offices-7-0-4", "Offices-6-3-3"}
ALT_MIN = 37.01
FIRST_UNIT_RATES = {"01-2026": 0.81, "02-2026": 1.31, "03-2026": 1.31, "04-2026": 1.31, "05-2026": 1.31}

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
data["meter_str"] = data["Meter Serial"].astype(str)

# Build per-meter-month main_rate table
meter_main_rates = {}
for (meter, unit), grp in data.groupby(["meter_str", "Unit umber"]):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    main_rates_by_month = {}
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        big = mdf[mdf[cons_col] >= 2]
        if len(big) > 0:
            r = big.iloc[0]
            c = r[cons_col]
            t = r[total_col]
            fur = FIRST_UNIT_RATES[month]
            main_rates_by_month[month] = (t - mc - fur) / (c - 1)
        else:
            main_rates_by_month[month] = None
    if main_rates_by_month:
        meter_main_rates[(meter, unit)] = main_rates_by_month

def get_main_rate(meter, unit, month):
    key = (meter, unit)
    r = meter_main_rates.get(key, {})
    v = r.get(month)
    if v is not None:
        return v
    vals = [v for v in r.values() if v is not None]
    if vals:
        return sum(vals) / len(vals)
    if r:
        for v in r.values():
            if v is not None:
                return v
    for k, kr in meter_main_rates.items():
        if k[1] == unit:
            for v in kr.values():
                if v is not None:
                    return v
    return 10.81 if month.startswith("01") else 11.31

results = []
for _, row in data.iterrows():
    c = row[cons_col]
    month = row["month"]
    unit = row["Unit umber"]
    meter = str(row["Meter Serial"])
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    fur = FIRST_UNIT_RATES[month]
    main_rate = get_main_rate(meter, unit, month)

    if c <= 0:
        expected = round(mc, 2)
    elif c < 1:
        # Fractional: pro-rated, no first-unit fee
        expected = round(mc + main_rate * c, 2)
    else:
        expected = round(mc + fur + main_rate * (c - 1), 2)

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
        "month": month, "unit": unit, "meter": meter, "customer": row["Customer Name"],
        "cons": round(c, 2), "actual_total": round(actual, 2), "expected_total": round(expected, 2),
        "diff": round(diff, 2), "status": status,
    })

res_df = pd.DataFrame(results)
res_df.to_csv(os.path.join(OUTPUT_DIR, "d2-water-replay-results.csv"), index=False)

print(f"Total: {len(res_df)}")
print(f"Status: {res_df['status'].value_counts().to_dict()}")
print(f"Avg diff: {res_df['diff'].mean():.6f}")
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

marginal = res_df[res_df["status"] == "MARGINAL"]
print(f"\nRemaining MARGINAL ({len(marginal)}):")
for _, r in marginal.sort_values(["month", "unit"]).iterrows():
    print(f"  {r['month']} {r['unit']:30s} mtr={r['meter']:12s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
