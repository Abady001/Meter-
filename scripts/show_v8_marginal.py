"""
Show MARGINAL rows from v8 output
"""
import pandas as pd
res_df = pd.read_csv(r"D:\meter\Meter\reports\d2-water-replay-results.csv")
marginal = res_df[res_df["status"] == "MARGINAL"]
close = res_df[res_df["status"] == "CLOSE"]
print(f"MARGINAL ({len(marginal)}):")
for _, r in marginal.sort_values(["month", "unit"]).iterrows():
    print(f"  {r['month']} {r['unit']:30s} mtr={str(r['meter']):12s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
print(f"\nCLOSE ({len(close)}):")
for _, r in close.sort_values(["month", "unit"]).iterrows():
    print(f"  {r['month']} {r['unit']:30s} mtr={str(r['meter']):12s} cons={r['cons']:7.2f} actual={r['actual_total']:8.2f} expected={r['expected_total']:8.2f} diff={r['diff']:7.2f}")
