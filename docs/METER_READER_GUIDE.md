# METER READER GUIDE

## Daily Reading Collection

### 1. View Assigned Meters
1. Go to **Readings** → **New Reading**
2. Select project to see meters needing readings
3. System shows: meter serial, type, location, last reading

### 2. Enter Reading
1. Select meter from list
2. **Current Reading**: Enter the value shown on the meter
3. **Previous Reading**: Auto-populated from last reading
4. **Consumption**: Auto-calculated (current - previous)
5. **Source**: Select manual/automated/estimated
6. Click **Submit**

### 3. Reading Validation
After submission, system checks:
- Is consumption negative? → flagged `suspicious`  
- Is consumption zero? → flagged `pending_review`
- Is consumption too high? → flagged `suspicious`
- All clear → status `valid`

### 4. Handling Issues

| Scenario | Action |
|----------|--------|
| Meter not accessible | Note as `estimated` reading |
| Meter damaged | Submit ticket for meter replacement |
| Zero reading (new meter) | Enter 0 — first reading is expected |
| Negative consumption | Re-check meter — possible meter swap |

## Meter Types

| Type | Typical Unit | Reading Range |
|------|-------------|---------------|
| Electricity (1PH) | kWh | 0-99999 |
| Electricity (3PH) | kWh | 0-999999 |
| Water | m³ | 0-99999 |
| Solar | kWh | 0-99999 |
| Chilled Water | kWh | 0-99999 |

## First Reading Rule

For a newly installed meter, the first reading should be 0.
- If the meter shows a value > 0, enter the actual value
- Consumption = entered value (since previous = 0)
- The first invoice will include the full consumption
