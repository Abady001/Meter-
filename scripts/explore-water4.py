import pandas as pd, os, glob

base = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
cons_col = "Consumption\nKWH/M3"

# Explore E&W files (combined electricity + water for same buildings)
print("=== E&W Files (Combined Elec + Water) ===")
for f in sorted(glob.glob(os.path.join(base, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    fname = os.path.basename(f)
    water = df[df["Meter Type"] == "WATER"]
    elec = df[df["Meter Type"] != "WATER"]
    print(f"\n{fname}: {len(df)} rows (elec={len(elec)}, water={len(water)})")
    print(f"  Columns: {list(df.columns)}")
    if len(water) > 0:
        for _, row in water.head(3).iterrows():
            c = row[cons_col]
            fees = row.get("Fees", "N/A")
            admin = row.get("Admin Fees", "N/A")
            csrv = row.get("Customer Service", "N/A")
            total = row.get("Total Amount", "N/A")
            print(f"  WATER: unit={row['Unit umber']}, cons={c}, fees={fees}, admin={admin}, csrv={csrv}, total={total}")
    if len(elec) > 0:
        for _, row in elec.head(3).iterrows():
            c = row[cons_col]
            fees = row.get("Fees", "N/A")
            admin = row.get("Admin Fees", "N/A")
            csrv = row.get("Customer Service", "N/A")
            total = row.get("Total Amount", "N/A")
            print(f"  ELEC:  unit={row['Unit umber']}, cons={c}, fees={fees}, admin={admin}, csrv={csrv}, total={total}")

# Focus on water rows from E&W files that have BOTH columns
print("\n\n=== Water Fees & Admin Fees Analysis (E&W files) ===")
all_water = []
for f in sorted(glob.glob(os.path.join(base, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "WATER"].copy()
    if len(water):
        month = os.path.basename(f).split(" ")[-1].replace(".xlsx","")
        water["month"] = month
        all_water.append(water)

if all_water:
    water = pd.concat(all_water, ignore_index=True)
    print(f"Total water rows (E&W): {len(water)}")
    
    if "Fees" in water.columns:
        fees_uniq = sorted(water["Fees"].dropna().unique())
        print(f"Fees column: min={water['Fees'].min()}, max={water['Fees'].max()}, uniq={fees_uniq}")
    if "Admin Fees" in water.columns:
        admin_uniq = sorted(water["Admin Fees"].dropna().unique())
        print(f"Admin Fees: min={water['Admin Fees'].min()}, max={water['Admin Fees'].max()}, uniq={admin_uniq}")
    if "Customer Service" in water.columns:
        csrv_uniq = sorted(water["Customer Service"].dropna().unique())
        print(f"CSRV: min={water['Customer Service'].min()}, max={water['Customer Service'].max()}, uniq={csrv_uniq[:20]}")
    if "Taxs" in water.columns:
        tax_uniq = sorted(water["Taxs"].dropna().unique())
        print(f"Tax: min={water['Taxs'].min()}, max={water['Taxs'].max()}, uniq={tax_uniq[:20]}")
    
    print(f"\n=== Sample water rows ===")
    total_col = "Total Amount"
    for _, row in water.head(15).iterrows():
        c = row[cons_col]
        total = row[total_col]
        fees = row.get("Fees", 0)
        admin = row.get("Admin Fees", 0)
        csrv = row.get("Customer Service", 0)
        tax = row.get("Taxs", 0)
        eff_rate = total / c if c > 0 else 0
        print(f"  cons={c:6.1f}, total={total:8.2f}, rate={eff_rate:.4f}, fees={fees}, admin={admin}, csrv={csrv}, tax={tax}")
