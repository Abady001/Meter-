export const UTILITY_CONFIG = {
  electricity: { nameEn: 'Electricity', nameAr: 'كهرباء', unit: 'kWh', invoiceTitle: 'فاتورة كهرباء', chargeGroups: [0, 1, 2, 3, 4, 5, 6, 7] },
  water: { nameEn: 'Water', nameAr: 'مياه', unit: 'm³', invoiceTitle: 'فاتورة مياه', chargeGroups: [0, 1, 2, 3, 4, 5, 6, 7] },
  chilled_water: { nameEn: 'Chilled Water', nameAr: 'مياه مثلجة', unit: 'RT', invoiceTitle: 'فاتورة مياه مثلجة', chargeGroups: [0, 10, 11] },
  chilled_water_ou: { nameEn: 'Outdoor Unit', nameAr: 'وحدة تكييف خارجية', unit: 'BTU', invoiceTitle: 'فاتورة وحدة التكييف الخارجية', chargeGroups: [0, 10, 11] },
  solar: { nameEn: 'Solar', nameAr: 'شمسي', unit: 'kWh', invoiceTitle: 'فاتورة شمسية', chargeGroups: [0, 8, 9] },
  settlement: { nameEn: 'Settlement', nameAr: 'تسوية', unit: '', invoiceTitle: 'فاتورة تسوية', chargeGroups: [12, 13] },
  gas: { nameEn: 'Gas', nameAr: 'غاز', unit: 'm³', invoiceTitle: 'فاتورة غاز', chargeGroups: [0, 14] },
} as const;

export type UtilityType = keyof typeof UTILITY_CONFIG;

export function getUtilityConfig(utility: string) {
  return (UTILITY_CONFIG as any)[utility] ?? UTILITY_CONFIG.electricity;
}
