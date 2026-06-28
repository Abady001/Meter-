import pandas as pd, glob, os

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
files = sorted(glob.glob(os.path.join(base, "*.xlsx")))

results = []
all_water = []
for f in files:
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "Water"]
    elec = df[df["Meter Type"] != "Water"]
    month = os.path.basename(f).split("-")[1].replace(".xlsx", "")
    results.append((os.path.basename(f), month, len(df), len(water), len(elec)))
    if len(water):
        w = water.copy()
        w["month"] = month
        all_water.append(w)

print("=== Files ===")
for r in results:
    print(f"  {r[0]}: total={r[2]}, elec={r[3]}, water={r[4]}")

water = pd.concat(all_water, ignore_index=True)
print(f"\n=== Water Summary ===")
print(f"  Total water invoices: {len(water)}")
print(f"  Unique months: {sorted(water['month'].unique())}")
print(f"  Unique units: {water['Unit umber'].nunique()}")
print(f"\n=== Consumption (M3) ===")
cons_col = "Consumption\nKWH/M3"
cons = water[cons_col]
print(cons.describe())
print(f"\n=== Total Amount ===")
tot = water["Total Amount"]
print(tot.describe())
print(f"\n=== Taxes range ===")
tax_min = water["Taxs"].min()
tax_max = water["Taxs"].max()
csrv_min = water["Customer Service"].min()
csrv_max = water["Customer Service"].max()
print(f"  Tax: {tax_min:.2f} - {tax_max:.2f}")
print(f"  CSRV: {csrv_min:.2f} - {csrv_max:.2f}")

print("\n=== Sample rows per month ===")
for m in sorted(water["month"].unique()):
    mdf = water[water["month"] == m]
    print(f"\n--- Month {m} ({len(mdf)} rows) ---")
    for _, row in mdf.head(5).iterrows():
        c = row[cons_col]
        t = row["Total Amount"]
        rate_pm3 = t / c if c > 0 else 0
        print(f"  cons={c:8.1f}, total={t:8.2f}, rate={rate_pm3:.4f}, tax={row['Taxs']:6.2f}, csrv={row['Customer Service']:6.2f}")
