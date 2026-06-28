"""
EDNC Water Replay v6b — debug Retail-505 specifically
"""
import pandas as pd, os, glob

BASE_DIR = r"D:\meter\Meter\reference\meter-department\EDNC Migration 01 TO 05 - 2026"
OUTPUT_DIR = r"D:\meter\Meter\reports"
MIN_CHARGE = 62.0
ALT_MIN_UNITS = {"Offices-7-0-4", "Offices-6-3-3"}
ALT_MIN = 37.01

cons_col = "Consumption\nKWH/M3"
total_col = "Total Amount"

for f in sorted(glob.glob(os.path.join(BASE_DIR, "E & W EDNC*.xlsx"))):
    df = pd.read_excel(f)
    water = df[df["Meter Type"] == "WATER"].copy()
    fname = os.path.basename(f)
    month = fname.split(" ")[-1].replace(".xlsx", "")
    r505 = water[water["Unit umber"] == "Retail-505"]
    print(f"--- {month} ---")
    if len(r505) > 0:
        row = r505.iloc[0]
        print(f"  Unit: {row['Unit umber']}, Cons: {row[cons_col]}, Total: {row[total_col]}")
    else:
        print(f"  No Retail-505 found in WATER rows")
    print(f"  Total WATER rows in file: {len(water)}")
