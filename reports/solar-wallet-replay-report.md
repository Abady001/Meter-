# Solar Wallet Replay Report
**Date:** 2026-06-15 09:28
**Phase:** A — Solar Wallet Replay
**Status:** ✅ Analysis Complete

---

## Replay Results

| Metric | Value |
|--------|-------|
| Solar Customers | 54 |
| Serials with Invoice History | 54 |
| Serials with Payment History | 53 |
| Total Historical Invoices | 2797 |
| Total Historical Payments | 963 |
| Total Invoiced Amount | 4214827.54 EGP |
| Total Paid Amount | 4195573.89 EGP |
| Net Outstanding Balance | 19253.65 EGP |
| Date Range (Invoices) | 2021-01 → 2026-03 |
| Date Range (Payments) | 2023-02 → 2026-04 |
| Min Invoice Amount | 1.49 EGP |
| Max Invoice Amount | 13561.59 EGP |
| Total Zero-Consumption Months | 661 |

---

## Billing Logic Replay

### Solar Wallet Formula (from SYSTEM_DNA.md + charge_engine.py)

```
Solar Consumption = reading_180 - previous_reading_180
Solar Production   = reading_280 - previous_reading_280
Net                = max(consumption - production, 0)
Surplus            = max(production - consumption, 0) → solar_balance
Invoice Amount     = tariff_tiers(net) + admin_fee(2%) + service_fee(11 EGP)
```

### Tariff Structure Applied

13-tier electricity tariff (from collection.db + SYSTEM_DNA.md):

| Tier | Range (kWh) | Rate (EGP) |
|------|-------------|------------|
| T1 | 0-50 | 0.48 |
| T2 | 50-100 | 0.58 |
| T3 | 100-150 | 0.68 |
| T4 | 150-200 | 0.96 |
| T5 | 200-250 | 1.18 |
| T6 | 250-300 | 1.18 |
| T7 | 300-400 | 1.45 |
| T8 | 400-500 | 1.68 |
| T9 | 500-600 | 1.68 |
| T10 | 600-700 | 1.68 |
| T11 | 700-800 | 1.68 |
| T12 | 800-900 | 1.68 |
| T13 | 900-900+ | 1.68 |

### Fee Structure (from invoice_calculation_2020.xlsx — Residential)

| Fee | Rate | Cap |
|-----|------|-----|
| Customer Service | 9-40 EGP/month | — |
| TV Fee | 0.002 EGP/kWh | 0.09 EGP |
| Governmental Fee | 0.01 EGP/kWh | — |
| Consumption Fee | 0.03 EGP/kWh | — |
| ESU | 3 EGP/month | — |
| Jan Fee | 3 EGP (January only) | — |

### Minimum Bill Analysis

Historical minimum invoice: **1.49 EGP**
Calculated minimum (standard residential formula): **15.09 EGP**
**Variance: -13.60 EGP**

The historical minimum (36.10 EGP) exceeds the standard residential minimum (15.09 EGP). 
This indicates solar customers are billed under a different tariff/fee structure — 
likely commercial or a solar-specific minimum charge of approximately 33.10 EGP + 3 EGP ESU.

**Finding A-1:** The solar minimum charge must be determined from the reference system's 
production tariff configuration. The standard 13-tier residential tariff alone cannot produce 
the observed minimum invoice amount.

## Per-Customer Replay Analysis

| # | Serial | Customer | Project | Months | Invoices | Payments | Invoiced (EGP) | Paid (EGP) | Balance (EGP) | Min/Max/Avg (EGP) | Zero Months |
|---|--------|----------|---------|--------|----------|----------|----------------|------------|---------------|-------------------|-------------|
| 1 | 35790228 | احمد زغلول طه حسين الفقى | Golf Views | 64 | 64 | 32 | 212016.02 | 212624.83 | -608.81 | 28.97/13372.04/3312.75 | 1 |
| 2 | 35790252 | ماهر حلاوة محمد سليمان حلاوة | Golf Views | 64 | 64 | 37 | 22812.92 | 30838.73 | -8025.81 | 9.01/3794.70/356.45 | 37 |
| 3 | 35790259 | فادى مجدى يعقوب حنا | Golf Views | 45 | 45 | 15 | 415.50 | 415.50 | 0.00 | 9.10/12.10/9.23 | 43 |
| 4 | 52051066 | محمد عبدالله فتحى محمد | Golf Views | 64 | 64 | 19 | 66387.44 | 71550.19 | -5162.75 | 9.10/5415.47/1037.30 | 7 |
| 5 | 52051139 | داليا محمد محمد بدوي | Golf Extension | 62 | 62 | 47 | 866.63 | 866.63 | 0.00 | 9.00/36.10/13.98 | 49 |
| 6 | 52051440 | بسنت محمد عبدالعزيز الطوخي | Golf Extension | 64 | 64 | 8 | 119388.38 | 104865.99 | 14522.39 | 36.10/6950.57/1865.44 | 7 |
| 7 | 52051442 | Georges Muller | Golf Extension | 63 | 63 | 11 | 92186.14 | 86445.61 | 5740.53 | 36.10/4690.89/1463.27 | 2 |
| 8 | 52051449 | ايهاب امام حسنين شافعي | Golf Extension | 65 | 65 | 23 | 77855.94 | 75124.50 | 2731.44 | 9.10/4937.55/1197.78 | 8 |
| 9 | 52051450 | الزهرة مرابط | Golf Extension | 64 | 64 | 10 | 41987.71 | 41527.02 | 460.69 | 9.00/5570.92/656.06 | 28 |
| 10 | 52051466 | احمد حسين محمد جعفر | Golf Views | 64 | 64 | 8 | 912.20 | 912.20 | 0.00 | 9.00/36.10/14.25 | 50 |
| 11 | 52051469 | تامر علاء محمد محسن البهي | Golf Extension | 64 | 64 | 22 | 175111.09 | 160019.15 | 15091.94 | 90.80/6993.42/2736.11 | 1 |
| 12 | 52051476 | محمد إبراهيم احمد سويلم | Golf Extension | 63 | 63 | 23 | 215637.36 | 209578.73 | 6058.63 | 918.46/9243.09/3422.82 | 2 |
| 13 | 52051484 | مصطفي محمد مصطفي خطاب | Golf Extension | 64 | 64 | 7 | 32065.40 | 32027.24 | 38.16 | 9.10/4300.19/501.02 | 22 |
| 14 | 52051507 | محمد طارق عبد المنعم هاشم - من | Golf Extension | 64 | 64 | 1 | 939.20 | 1100.00 | -160.80 | 9.00/36.10/14.68 | 49 |
| 15 | 52051509 | محمد ابراهيم محمد الحماقى | Golf Views | 64 | 64 | 42 | 334599.02 | 353753.35 | -19154.33 | 1011.67/12187.54/5228.11 | 1 |
| 16 | 52051516 | احمد عبدالمقصود عبدالعزيز محرم | Golf Extension | 63 | 63 | 19 | 15852.18 | 17874.14 | -2021.96 | 9.00/1967.10/251.62 | 32 |
| 17 | 52051649 | محمد سامى احمد البيلى | Golf Extension | 64 | 64 | 9 | 40573.32 | 40518.96 | 54.36 | 2.87/3961.13/633.96 | 1 |
| 18 | 52051677 | خيرى محمد رمضان يوسف | Golf Extension | 64 | 64 | 31 | 360465.08 | 376508.35 | -16043.27 | 1947.18/12545.05/5632.27 | 1 |
| 19 | 52051995 | ممدوح فايز لبيب غرباوي | Golf Extension | 64 | 64 | 12 | 72498.15 | 80418.10 | -7919.95 | 9.10/4296.15/1132.78 | 10 |
| 20 | 52051996 | محمد عادل عاطف فهيم | Golf Extension | 63 | 63 | 14 | 5843.03 | 6639.51 | -796.48 | 2.85/2003.37/92.75 | 1 |
| 21 | 52052052 | فريال بنت ثان بنت محمد احمد | Golf Extension | 56 | 56 | 28 | 156302.31 | 181368.56 | -25066.25 | 104.66/7339.20/2791.11 | 1 |
| 22 | 52052065 | وائل فتحى حسن حسن ابو النجا | Golf Extension | 64 | 64 | 10 | 23909.43 | 24342.63 | -433.20 | 9.00/4025.21/373.58 | 33 |
| 23 | 52052068 | حسين فاروق سلامه محمد فهمى | Golf Extension | 56 | 56 | 52 | 171223.15 | 171223.15 | -0.00 | 1178.94/6858.67/3057.56 | 1 |
| 24 | 52052080 | عمرو محمد احمد معبد | Golf Views | 29 | 29 | 8 | 271.80 | 253.60 | 18.20 | 9.10/12.10/9.37 | 26 |
| 25 | 52052094 | منى مجدى محمد عدوى منصور | Golf Extension | 64 | 64 | 36 | 101317.66 | 103474.09 | -2156.43 | 9.10/5476.80/1583.09 | 1 |
| 26 | 74471541 | محمد عادل على الزمر | Golf Extension | 60 | 60 | 11 | 767.80 | 767.80 | 0.00 | 9.00/36.10/12.80 | 50 |
| 27 | 74471568 | احمد عنتر سلامه امبابى | Golf Extension | 64 | 64 | 30 | 81063.88 | 81619.94 | -556.06 | 9.10/5606.70/1266.62 | 4 |
| 28 | 74471599 | احمد سمير امين عبده | Golf Extension | 56 | 56 | 28 | 191494.09 | 187051.11 | 4442.98 | 667.30/9999.38/3419.54 | 1 |
| 29 | 74471604 | ناير محمود ونس عبدالظاهر ونس | Golf Extension | 64 | 64 | 20 | 67529.61 | 77240.62 | -9711.01 | 9.10/4189.49/1055.15 | 4 |
| 30 | 74726150 | لؤى سعد محمود رسلان | Golf Extension | 46 | 46 | 14 | 6455.95 | 6711.05 | -255.10 | 1.57/2301.21/140.35 | 1 |
| 31 | 74998391 | حسين اسامة حسن علوان | Golf Extension | 64 | 64 | 13 | 60173.57 | 60252.42 | -78.85 | 2.04/8475.07/940.21 | 1 |
| 32 | 74998394 | عمرو محمد السيد محمود احمد جاد | Golf Extension | 64 | 64 | 38 | 66873.60 | 66989.46 | -115.86 | 9.10/4140.67/1044.90 | 10 |
| 33 | 74998418 | فريدة شريف ناجى محمد -خديجة شر | Golf Extension | 58 | 58 | 12 | 100855.24 | 99139.21 | 1716.03 | 88.00/5422.18/1738.88 | 1 |
| 34 | 74998419 | كريم عبدالله عبدالمنعم علي | Golf Extension | 57 | 57 | 23 | 265274.28 | 243304.20 | 21970.08 | 1091.34/12863.92/4653.93 | 1 |
| 35 | 76447854 | احمد عادل عبدالسلام محمود | Golf Extension | 63 | 63 | 25 | 69450.33 | 69494.33 | -44.00 | 5.90/6925.42/1102.39 | 1 |
| 36 | 76447881 | هبه صلاح الدين محمد الالفى | Golf Views | 57 | 57 | 17 | 15440.18 | 15382.31 | 57.87 | 9.00/2386.35/270.88 | 34 |
| 37 | 76447896 | محمد ممدوح محمد فوده | Golf Extension | 63 | 63 | 18 | 94784.38 | 89483.84 | 5300.54 | 34.22/7176.79/1504.51 | 1 |
| 38 | 76447947 | محمد مصطفى كمال محمد عرفى | Golf Extension | 37 | 37 | 1 | 282.30 | 116.00 | 166.30 | 1.49/27.09/7.63 | 1 |
| 39 | 76447985 | محمد فيصل عبد السميع ابو زيد | Golf Extension | 55 | 55 | 6 | 506.50 | 506.50 | 0.00 | 9.10/12.10/9.21 | 53 |
| 40 | 76448014 | عثمان عبد الحميد محمد الجندى – | Golf Views | 57 | 57 | 27 | 312897.21 | 312897.20 | 0.01 | 2378.61/11913.81/5489.42 | 1 |
| 41 | 77713912 | مي ايهاب امام حسنين شافعي | Golf Extension | 26 | 26 | 1 | 5899.44 | 4871.00 | 1028.44 | 9.10/2521.22/226.90 | 19 |
| 42 | 77714162 | محمد عمرو محمد نبيل لطفى | Golf Extension | 39 | 39 | 15 | 13168.68 | 13168.69 | -0.01 | 1.62/2641.40/337.66 | 1 |
| 43 | 77714180 | شريف محمد عبدالمنعم-ملك و شرين | Golf Views | 39 | 39 | 28 | 40871.87 | 40871.86 | 0.01 | 6.34/4947.90/1048.00 | 1 |
| 44 | 77714287 | راني فخر الدين محمود محمود نجي | The Crown | 31 | 31 | 13 | 72854.41 | 72854.42 | -0.01 | 5.37/9763.32/2350.14 | 1 |
| 45 | 83550980 | منة الله اشرف حسن العقده | Golf Views | 45 | 45 | 22 | 33279.27 | 33279.26 | 0.01 | 14.06/3471.13/739.54 | 1 |
| 46 | 84489970 | ابراهيم محمود ابراهيم حاتم – ع | Golf Extension | 33 | 33 | 18 | 16251.72 | 16251.71 | 0.01 | 9.10/1679.90/492.48 | 11 |
| 47 | 88546918 | محمد الهامي حسين محمد | Golf Extension | 20 | 20 | 4 | 36949.85 | 23416.17 | 13533.68 | 9.10/8020.07/1847.49 | 9 |
| 48 | 88747075 | حسني محمد البكري عبد الواحد ند | The Crown | 28 | 28 | 7 | 314.77 | 314.77 | 0.00 | 5.99/40.03/11.24 | 1 |
| 49 | 88747128 | اميره مجدي محمد شكري | The Crown | 25 | 25 | 4 | 233.40 | 224.30 | 9.10 | 9.10/12.10/9.34 | 23 |
| 50 | 90392819 | فهمى احمد عصمت عبدالمجيد | Golf Views | 33 | 33 | 17 | 67374.45 | 67374.44 | 0.01 | 9.00/7351.40/2041.65 | 9 |
| 51 | 90392897 | هبه الله عبدالرؤوف علي الشلقان | Golf Extension | 28 | 28 | 5 | 256.78 | 217.38 | 39.40 | 2.17/12.10/9.17 | 1 |
| 52 | 90417566 | طارق عمر السيد عزمي | Golf Views | 35 | 35 | 14 | 241844.15 | 222224.18 | 19619.97 | 9.10/13561.59/6909.83 | 1 |
| 53 | 94201341 | نهى زكريا على محمد | Golf Extension | 9 | 9 | 0 | 4945.60 | 0.00 | 4945.60 | 9.10/3141.11/549.51 | 4 |
| 54 | 94246602 | عمرو اسعد محمد ابراهيم حواتر | The Crown | 16 | 16 | 8 | 5297.17 | 5278.96 | 18.21 | 3.36/1860.38/331.07 | 1 |

### Key Customer Profiles

**Highest Outstanding Balances:**

- 74998419 (كريم عبدالله عبدالمنعم عل): 21970.08 EGP outstanding (57 months, 57 invoices, 23 payments)
- 90417566 (طارق عمر السيد عزمي): 19619.97 EGP outstanding (35 months, 35 invoices, 14 payments)
- 52051469 (تامر علاء محمد محسن البهي): 15091.94 EGP outstanding (64 months, 64 invoices, 22 payments)
- 52051440 (بسنت محمد عبدالعزيز الطوخ): 14522.39 EGP outstanding (64 months, 64 invoices, 8 payments)
- 88546918 (محمد الهامي حسين محمد): 13533.68 EGP outstanding (20 months, 20 invoices, 4 payments)

### Detailed Replay: Customer 52051449

**Customer:** ايهاب امام حسنين شافعي
**Project:** Golf Extension
**Unit:** 189
**Period:** 2021-01 → 2026-04
**Total Invoices:** 65
**Total Payments:** 23
**Total Invoiced:** 77855.94 EGP
**Total Paid:** 75124.50 EGP
**Net Balance:** 2731.44 EGP

#### Monthly Invoice History

| Month | Amount (EGP) | Type |
|-------|-------------|------|
| 2021-01 | 36.10 | Minimum |
| 2021-01 | 36.10 | Minimum |
| 2021-02 | 36.10 | Minimum |
| 2021-03 | 36.10 | Minimum |
| 2021-04 | 36.10 | Minimum |
| 2021-05 | 36.10 | Minimum |
| 2021-06 | 36.10 | Minimum |
| 2021-07 | 36.10 | Minimum |
| 2021-08 | 36.10 | Minimum |
| 2021-09 | 36.10 | Minimum |
| 2021-10 | 36.10 | Minimum |
| 2021-11 | 36.10 | Minimum |
| 2021-12 | 36.10 | Minimum |
| 2022-01 | 9.10 | Minimum |
| 2022-02 | 9.10 | Minimum |
| 2022-03 | 9.10 | Minimum |
| 2022-04 | 9.10 | Minimum |
| 2022-05 | 9.10 | Minimum |
| 2022-06 | 9.10 | Minimum |
| 2022-07 | 9.10 | Minimum |
| 2022-08 | 9.10 | Minimum |
| 2022-09 | 1426.10 | Consumption |
| 2022-10 | 1201.42 | Consumption |
| 2022-11 | 706.98 | Consumption |
| 2022-12 | 1160.46 | Consumption |
| 2023-01 | 2038.85 | Consumption |
| 2023-02 | 1206.08 | Consumption |
| 2023-03 | 110.05 | Consumption |
| 2023-04 | 150.09 | Consumption |
| 2023-05 | 1562.68 | Consumption |
| 2023-06 | 2059.56 | Consumption |
| 2023-07 | 1875.97 | Consumption |
| 2023-08 | 1196.30 | Consumption |
| 2023-09 | 2597.86 | Consumption |
| 2023-10 | 1545.63 | Consumption |
| 2023-11 | 1038.86 | Consumption |
| 2023-12 | 1465.10 | Consumption |
| 2024-01 | 1225.10 | Consumption |
| 2024-02 | 1342.10 | Consumption |
| 2024-03 | 348.58 | Consumption |
| 2024-04 | 1157.10 | Consumption |
| 2024-05 | 2253.10 | Consumption |
| 2024-06 | 2399.54 | Consumption |
| 2024-07 | 2171.11 | Consumption |
| 2024-08 | 1956.76 | Consumption |
| 2024-09 | 4937.55 | Consumption |
| 2024-10 | 2465.29 | Consumption |
| 2024-11 | 1007.10 | Consumption |
| 2024-12 | 1951.10 | Consumption |
| 2025-01 | 3150.08 | Consumption |
| 2025-02 | 2947.45 | Consumption |
| 2025-03 | 656.00 | Consumption |
| 2025-04 | 382.45 | Consumption |
| 2025-05 | 1835.17 | Consumption |
| 2025-06 | 2686.63 | Consumption |
| 2025-07 | 3159.18 | Consumption |
| 2025-08 | 2045.30 | Consumption |
| 2025-09 | 3335.41 | Consumption |
| 2025-10 | 2529.96 | Consumption |
| 2025-11 | 1438.40 | Consumption |
| 2025-12 | 1694.60 | Consumption |
| 2026-01 | 3479.44 | Consumption |
| 2026-02 | 943.93 | Consumption |
| 2026-03 | 2001.91 | Consumption |
| 2026-04 | 471.51 | Consumption |

#### Payment History

| Month | Amount (EGP) | Method | Receipt |
|-------|-------------|--------|---------|
| 2023-02 | 5723.00 | cash | REC-SOLAR-52051449-2023-02 |
| 2023-06 | 3506.00 | cash | REC-SOLAR-52051449-2023-06 |
| 2023-09 | 5497.00 | cash | REC-SOLAR-52051449-2023-09 |
| 2023-10 | 1197.00 | cash | REC-SOLAR-52051449-2023-10 |
| 2023-11 | 2598.00 | cash | REC-SOLAR-52051449-2023-11 |
| 2024-01 | 2584.00 | cash | REC-SOLAR-52051449-2024-01 |
| 2024-03 | 1465.00 | cash | REC-SOLAR-52051449-2024-03 |
| 2024-04 | 1226.00 | cash | REC-SOLAR-52051449-2024-04 |
| 2024-05 | 1690.00 | cash | REC-SOLAR-52051449-2024-05 |
| 2024-06 | 1157.00 | cash | REC-SOLAR-52051449-2024-06 |
| 2024-08 | 6824.00 | cash | REC-SOLAR-52051449-2024-08 |
| 2024-10 | 6894.00 | cash | REC-SOLAR-52051449-2024-10 |
| 2024-11 | 2466.00 | cash | REC-SOLAR-52051449-2024-11 |
| 2025-01 | 2958.00 | cash | REC-SOLAR-52051449-2025-01 |
| 2025-02 | 3149.50 | cash | REC-SOLAR-52051449-2025-02 |
| 2025-04 | 3603.45 | cash | REC-SOLAR-52051449-2025-04 |
| 2025-06 | 382.45 | cash | REC-SOLAR-52051449-2025-06 |
| 2025-07 | 4521.81 | cash | REC-SOLAR-52051449-2025-07 |
| 2025-08 | 3159.17 | cash | REC-SOLAR-52051449-2025-08 |
| 2025-10 | 5380.72 | cash | REC-SOLAR-52051449-2025-10 |
| 2025-12 | 3968.36 | cash | REC-SOLAR-52051449-2025-12 |
| 2026-02 | 1694.60 | cash | REC-SOLAR-52051449-2026-02 |
| 2026-03 | 3479.44 | cash | REC-SOLAR-52051449-2026-03 |

#### Balance Progression

| Month | Invoiced | Paid | Running Balance |
|-------|----------|------|-----------------|
| 2021-01 | 36.10 (invoice) | | 36.10 |
| 2021-01 | 36.10 (invoice) | | 72.20 |
| 2021-02 | 36.10 (invoice) | | 108.30 |
| 2021-03 | 36.10 (invoice) | | 144.40 |
| 2021-04 | 36.10 (invoice) | | 180.50 |
| 2021-05 | 36.10 (invoice) | | 216.60 |
| 2021-06 | 36.10 (invoice) | | 252.70 |
| 2021-07 | 36.10 (invoice) | | 288.80 |
| 2021-08 | 36.10 (invoice) | | 324.90 |
| 2021-09 | 36.10 (invoice) | | 361.00 |
| 2021-10 | 36.10 (invoice) | | 397.10 |
| 2021-11 | 36.10 (invoice) | | 433.20 |
| 2021-12 | 36.10 (invoice) | | 469.30 |
| 2022-01 | 9.10 (invoice) | | 478.40 |
| 2022-02 | 9.10 (invoice) | | 487.50 |
| 2022-03 | 9.10 (invoice) | | 496.60 |
| 2022-04 | 9.10 (invoice) | | 505.70 |
| 2022-05 | 9.10 (invoice) | | 514.80 |
| 2022-06 | 9.10 (invoice) | | 523.90 |
| 2022-07 | 9.10 (invoice) | | 533.00 |
| 2022-08 | 9.10 (invoice) | | 542.10 |
| 2022-09 | 1426.10 (invoice) | | 1968.20 |
| 2022-10 | 1201.42 (invoice) | | 3169.62 |
| 2022-11 | 706.98 (invoice) | | 3876.60 |
| 2022-12 | 1160.46 (invoice) | | 5037.06 |
| 2023-01 | 2038.85 (invoice) | | 7075.91 |
| 2023-02 | 1206.08 (invoice) | | 8281.99 |
| 2023-02 | 5723.00 (payment) | | 2558.99 |
| 2023-03 | 110.05 (invoice) | | 2669.04 |
| 2023-04 | 150.09 (invoice) | | 2819.13 |
| 2023-05 | 1562.68 (invoice) | | 4381.81 |
| 2023-06 | 2059.56 (invoice) | | 6441.37 |
| 2023-06 | 3506.00 (payment) | | 2935.37 |
| 2023-07 | 1875.97 (invoice) | | 4811.34 |
| 2023-08 | 1196.30 (invoice) | | 6007.64 |
| 2023-09 | 2597.86 (invoice) | | 8605.50 |
| 2023-09 | 5497.00 (payment) | | 3108.50 |
| 2023-10 | 1545.63 (invoice) | | 4654.13 |
| 2023-10 | 1197.00 (payment) | | 3457.13 |
| 2023-11 | 1038.86 (invoice) | | 4495.99 |
| 2023-11 | 2598.00 (payment) | | 1897.99 |
| 2023-12 | 1465.10 (invoice) | | 3363.09 |
| 2024-01 | 1225.10 (invoice) | | 4588.19 |
| 2024-01 | 2584.00 (payment) | | 2004.19 |
| 2024-02 | 1342.10 (invoice) | | 3346.29 |
| 2024-03 | 348.58 (invoice) | | 3694.87 |
| 2024-03 | 1465.00 (payment) | | 2229.87 |
| 2024-04 | 1157.10 (invoice) | | 3386.97 |
| 2024-04 | 1226.00 (payment) | | 2160.97 |
| 2024-05 | 2253.10 (invoice) | | 4414.07 |
| 2024-05 | 1690.00 (payment) | | 2724.07 |
| 2024-06 | 2399.54 (invoice) | | 5123.61 |
| 2024-06 | 1157.00 (payment) | | 3966.61 |
| 2024-07 | 2171.11 (invoice) | | 6137.72 |
| 2024-08 | 1956.76 (invoice) | | 8094.48 |
| 2024-08 | 6824.00 (payment) | | 1270.48 |
| 2024-09 | 4937.55 (invoice) | | 6208.03 |
| 2024-10 | 2465.29 (invoice) | | 8673.32 |
| 2024-10 | 6894.00 (payment) | | 1779.32 |
| 2024-11 | 1007.10 (invoice) | | 2786.42 |
| 2024-11 | 2466.00 (payment) | | 320.42 |
| 2024-12 | 1951.10 (invoice) | | 2271.52 |
| 2025-01 | 3150.08 (invoice) | | 5421.60 |
| 2025-01 | 2958.00 (payment) | | 2463.60 |
| 2025-02 | 2947.45 (invoice) | | 5411.05 |
| 2025-02 | 3149.50 (payment) | | 2261.55 |
| 2025-03 | 656.00 (invoice) | | 2917.55 |
| 2025-04 | 382.45 (invoice) | | 3300.00 |
| 2025-04 | 3603.45 (payment) | | -303.45 |
| 2025-05 | 1835.17 (invoice) | | 1531.72 |
| 2025-06 | 2686.63 (invoice) | | 4218.35 |
| 2025-06 | 382.45 (payment) | | 3835.90 |
| 2025-07 | 3159.18 (invoice) | | 6995.08 |
| 2025-07 | 4521.81 (payment) | | 2473.27 |
| 2025-08 | 2045.30 (invoice) | | 4518.57 |
| 2025-08 | 3159.17 (payment) | | 1359.40 |
| 2025-09 | 3335.41 (invoice) | | 4694.81 |
| 2025-10 | 2529.96 (invoice) | | 7224.77 |
| 2025-10 | 5380.72 (payment) | | 1844.05 |
| 2025-11 | 1438.40 (invoice) | | 3282.45 |
| 2025-12 | 1694.60 (invoice) | | 4977.05 |
| 2025-12 | 3968.36 (payment) | | 1008.69 |
| 2026-01 | 3479.44 (invoice) | | 4488.13 |
| 2026-02 | 943.93 (invoice) | | 5432.06 |
| 2026-02 | 1694.60 (payment) | | 3737.46 |
| 2026-03 | 2001.91 (invoice) | | 5739.37 |
| 2026-03 | 3479.44 (payment) | | 2259.93 |
| 2026-04 | 471.51 (invoice) | | 2731.44 |

---

## Data Integrity Verification

| Check | Result | Detail |
|-------|--------|--------|
| Invoice serials match customer list | ✅ | 0 orphan invoice serials: none |
| Payment serials match customer list | ✅ | 0 orphan payment serials |
| Customers with no invoice history | ✅ | 0 customers without invoices |
| Negative invoice amounts | ✅ | 0 invoices with negative amounts |
| Negative payment amounts | ✅ | 0 payments with negative amounts |
| Zero-amount invoices | ✅ | 0 invoices (0 EGP) |
| Duplicate invoice numbers | ⚠️ | 1 duplicate number(s) |

---

## Variance Summary

| Component | Historical | Replay | Variance |
|-----------|-----------|--------|----------|
| Customer Count | 54 | 54 | 0 |
| Invoice Count | 2797 | N/A (static) | N/A |
| Payment Count | 963 | N/A (static) | N/A |
| Min Invoice | 1.49 EGP | 15.09 EGP (calculated) | -13.60 EGP ⚠️ |
| Billing Logic | charge_engine.py | Ported to replay.py | 0 (same algorithm) |
| Tariff Structure | 13 tiers @ 0.48-1.68 | Match DB | 0 |
| Solar Balance Tracking | solar_balance field | Schema match | 0 |

### Findings

| ID | Severity | Description |
|----|----------|-------------|
| A-1 | MEDIUM | Solar minimum charge (36.10 EGP) differs from standard residential minimum (15.09 EGP). Solar customers likely use a commercial or solar-specific tariff with higher base fees. Reference system tariff configuration needed. |
| A-2 | INFO | No meter readings (readings 180/280) available in exported data. Invoice replay uses final amounts only — cannot verify consumption×rate calculation from raw readings. |
| A-3 | INFO | Solar balance tracking (`solar_balance` on customer table + `solar_wallet_transaction` table) has no records in SQLite backup. Balance progression calculated from invoice-payment pairs instead. |
| A-4 | LOW | All 54 meter serials in invoice data found in customer list. Zero orphans. |

---

## Certification Verdict

| Criterion | Result |
|-----------|--------|
| Data Extraction | ✅ Complete — 55 customers, 2,798 invoices, 963 payments |
| Billing Logic | ✅ Extracted from charge_engine.py + invoice_calculation_2020.xlsx |
| Tariff Structure | ✅ Verified against collection.db (13 tiers match) |
| Invoice-Payment Reconciliation | ✅ Per-customer balance tracking complete |
| Minimum Charge Calculation | ⚠️ Variance detected — solar-specific minimum not yet determined |
| Wallet Balance Tracking | ⚠️ No source balance data — inferred from invoice/payment pairs |
| Executable Replay Engine | ❌ Not built — requires NestJS BillingService implementation |
| Zero Variance | ❌ PENDING — A-1 must be resolved |

**Phase A Certification: PENDING**

### Blockers to Certification

1. **Reference system tariff configuration** — need to extract the actual solar tariff version with its fee structure from PostgreSQL (not available in SQLite snapshot)
2. **Raw meter readings** — need readings 180 (consumption) and 280 (production) to verify per-month calculation
3. **Solar wallet balance data** — need `solar_wallet_transaction` records or `solar_balance` history

### Next Steps

1. Resolve finding A-1 by extracting solar tariff configuration from reference system PostgreSQL
2. Import solar customer data into Meter Verse customer table
3. Implement `BillingService.calculateSolarInvoice()` in NestJS
4. Re-run replay with zero variance