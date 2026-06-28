export interface ChargeGroupDef {
  id: number;
  nameEn: string;
  nameAr: string;
  color: string;
}

export const CHARGE_GROUPS: Record<number, ChargeGroupDef> = {
  0: { id: 0, nameEn: 'Consumption', nameAr: 'استهلاك', color: '#000000' },
  1: { id: 1, nameEn: 'Service Fees', nameAr: 'رسوم خدمات', color: '#555555' },
  2: { id: 2, nameEn: 'Customer Service', nameAr: 'خدمة عملاء', color: '#666666' },
  3: { id: 3, nameEn: 'Administrative', nameAr: 'إداري', color: '#777777' },
  4: { id: 4, nameEn: 'Sustainability', nameAr: 'استدامة', color: '#888888' },
  5: { id: 5, nameEn: 'Percentage', nameAr: 'نسبة مئوية', color: '#999999' },
  6: { id: 6, nameEn: 'VAT', nameAr: 'ضريبة', color: '#AAAAAA' },
  7: { id: 7, nameEn: 'Other', nameAr: 'أخرى', color: '#BBBBBB' },
  8: { id: 8, nameEn: 'Solar Credit', nameAr: 'رصيد شمسي', color: '#FFD700' },
  9: { id: 9, nameEn: 'Solar Carry Forward', nameAr: 'مرحل شمسي', color: '#FFA500' },
  10: { id: 10, nameEn: 'Cooling Load', nameAr: 'حمل تبريد', color: '#00BFFF' },
  11: { id: 11, nameEn: 'Fixed Chiller', nameAr: 'مبرد ثابت', color: '#1E90FF' },
  12: { id: 12, nameEn: 'Settlement', nameAr: 'تسوية', color: '#32CD32' },
  13: { id: 13, nameEn: 'Adjustment', nameAr: 'تعديل', color: '#FF6347' },
  14: { id: 14, nameEn: 'Gas Service', nameAr: 'خدمة غاز', color: '#FF4500' },
};

export function getChargeGroupName(groupId: number, lang: 'en' | 'ar' = 'ar'): string {
  const g = CHARGE_GROUPS[groupId];
  return g ? (lang === 'ar' ? g.nameAr : g.nameEn) : `Group ${groupId}`;
}
