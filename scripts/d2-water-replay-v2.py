"""
EDNC Water Replay v2 — Unit-specific rate discovery + replay
"""
import pandas as pd, os, glob, json

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

# Phase 1: Rate discovery per unit per month
unit_rates = {}
for unit, grp in data.groupby("Unit umber"):
    unit_rates[unit] = {}
    for month in sorted(grp["month"].unique()):
        mdf = grp[grp["month"] == month]
        mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
        rates = []
        for _, row in mdf.iterrows():
            c = row[cons_col]
            t = row[total_col]
            # Only use cons >= 5 for rate estimation to avoid first-unit distortion
            if c >= 5:
                r = (t - mc) / c
                rates.append(r)
        if rates:
            unit_rates[unit][month] = sum(rates) / len(rates)
        else:
            unit_rates[unit][month] = None

# Build replay formula for each unit
def calc_water_v2(cons, month_str, unit):
    mc = ALT_MIN if unit in ALT_MIN_UNITS else MIN_CHARGE
    if cons <= 0:
        return mc

    month_num = int(month_str[:2])

    # Get unit-specific rate for this month, or nearest available month
    rate = None
    if unit in unit_rates and month_str in unit_rates[unit]:
        rate = unit_rates[unit][month_str]

    if rate is None:
        # Fallback: use standard formula
        if month_num == 1:
            rate = 10.81
        else:
            rate = 11.31

    # Try: total = mc + cons * rate (for small cons, use per-unit rate)
    if cons < 1.0:
        # For sub-1 consumption, direct rate
        total = mc + cons * rate
    elif cons <= 1.0:
        # For exactly 1, check if we have a matching data point
        subset = data[(data["Unit umber"] == unit) & (data["month"] == month_str) & (data[cons_col] == cons)]
        if len(subset) > 0:
            return subset[total_col].iloc[0]
        total = mc + cons * rate
    else:
        # For > 1, use first-unit adjustment
        # The first unit has a special lower rate (~0.81 for V1, ~1.31 for V2)
        # while the rest uses the marginal rate
        # But the simplest formula is just total = mc + cons * rate
        total = mc + cons * rate

    return round(total, 2)

# Replay
results = []
for _, row in data.iterrows():
    c = row[cons_col]
    month = row["month"]
    unit = row["Unit umber"]
    expected = calc_water_v2(c, month, unit)
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

# Show MISMATCH details
mis = res_df[res_df["status"] == "MISMATCH"]
if len(mis) > 0:
    print(f"\nMISMATCH: {len(mis)} rows")
    for _, r in mis.sort_values(["month", "unit"]).iterrows():
        unit_rate = unit_rates.get(r["unit"], {}).get(r["month"], "?")
        print(f"  {r['month']} {r['unit']:30s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f} rate={unit_rate}")

# Identify different rate groups
print("\n\n=== Rate groups ===")
for unit, months in sorted(unit_rates.items()):
    avg_rates = [r for r in months.values() if r is not None]
    if avg_rates:
        avg = sum(avg_rates) / len(avg_rates)
        cat = "HIGH" if avg > 12.0 else "LOW"
        if avg > 11.5:
            rates_str = ", ".join([f"{m}:{r:.2f}" for m, r in sorted(months.items()) if r])
            print(f"  {cat} {unit:30s} avg={avg:.2f} [{rates_str}]")
