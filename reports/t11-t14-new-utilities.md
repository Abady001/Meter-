# T11 + T12 + T13 + T14 — New Utility Designs

**Date**: 2026-06-18
**Note**: These utilities do NOT exist in SBill. Designed from scratch based on requirements.

## Solar Billing
| Element | Specification |
|---------|--------------|
| Invoice Name | فاتورة شمسية / Solar Invoice |
| Key Fields | Production Previous, Production Current, Production Difference, Consumption Previous, Consumption Current, Consumption Difference, Net Energy, Solar Credit, Solar Carry Forward |
| Charge Groups | 0 (Consumption), 8 (SolarCredit), 9 (SolarCarryForward) |
| Special Logic | Net metering calculation: Net = Consumption - Production. If Net < 0, credit carried forward. |

## Chilled Water Billing
| Element | Specification |
|---------|--------------|
| Type A Name | فاتورة مياه مثلجة |
| Type B Name | فاتورة وحدة التكييف الخارجية |
| Unit | RT / TR (Refrigeration Ton) |
| Charge Groups | 0 (Consumption), 10 (CoolingLoad), 11 (FixedChiller) |

## Settlement Billing
| Element | Specification |
|---------|--------------|
| Invoice Name | فاتورة تسوية / Settlement Invoice |
| Support | Manual entry, bulk upload, template import, invoice integration, posting into billing engine |
| Charge Groups | 12 (Settlement), 13 (Adjustment) |

## Gas Billing
| Element | Specification |
|---------|--------------|
| Invoice Name | فاتورة غاز / Gas Invoice |
| Unit | m³ or BTU |
| Charge Groups | 0 (Consumption), 14 (GasService) |
