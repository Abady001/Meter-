/**
 * Template configuration driven by JRXML properties.
 * Each utility type maps to its JRXML layout parameters.
 * Add new templates here — the HTML builder reads this config.
 */
export interface TemplateColumn {
  /** JRXML column label in Arabic */
  label: string;
  /** English label */
  labelEn?: string;
  /** JRXML position (x coordinate) */
  x: number;
  /** Column width in points */
  width: number;
  /** Charge group(s) that map to this column */
  chargeGroups: number[];
  /** How to format the value: 'amount' div by 1000, 'number' raw */
  format: 'amount' | 'number' | 'abs-amount';
}

export interface TemplateConfig {
  name: string;
  invoiceTitle: string;
  invoiceTitleEn?: string;
  /** JRXML page dimensions */
  pageWidth: number;
  pageHeight: number;
  orientation: 'landscape' | 'portrait';
  /** Unit label for readings (e.g. "ك.و.س", "متر مكعب") */
  unitLabel: string;
  unitLabelEN?: string;
  /** Language: 'ar' (default) or 'en' */
  lang?: string;
  /** Column header labels — order matches JRXML charge grid at y=166 */
  chargeColumns: TemplateColumn[];
  /** Labels for the header info grid (y=64 row) — 5 columns */
  headerRowLabels: string[];
  headerRowLabelsEn?: string[];
  /** Labels for row 2 (y=98) */
  row2Labels: string[];
  row2LabelsEn?: string[];
  /** Labels for row 3 (y=132) */
  row3Labels: string[];
  row3LabelsEn?: string[];
  /** Label for col 0 in charge matrix (changes by utility) */
  col0Label: string;
  col0LabelEn?: string;
  /** Top-left area box label */
  areaBoxLabel?: string;
  areaBoxLabelEn?: string;
  /** Mapping of internal group names to charge_group numbers */
  chargeGroupMapping: Record<string, number[]>;
  /** Additional charge groups that only appear in specific templates */
  extraGroups?: string[];
}

export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  electricity: {
    name: 'elec_invoice',
    invoiceTitle: 'فاتورة كهرباء',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'ك.و.س',
    col0Label: 'خصومات (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية (ك.و.س)', 'سابقة (ك.و.س)', 'الإستهلاك (ك.و.س)'],
    row3Labels: ['خصومات (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'خصومات (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك (ك.و.س)', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      SETTLEMENT: [6],
    },
  },

  water: {
    name: 'water_invoice',
    invoiceTitle: 'فاتورة مياه',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'متر مكعب',
    col0Label: 'حمام سباحة (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية (متر مكعب)', 'سابقة (متر مكعب)', 'الإستهلاك (متر مكعب)'],
    row3Labels: ['حمام سباحة (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'حمام سباحة (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك (متر مكعب)', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      PERCENTAGE: [5],
      SETTLEMENT: [6],
    },
    extraGroups: ['PERCENTAGE'],
  },

  water_new: {
    name: 'water_invoice_new',
    invoiceTitle: 'فاتورة مياه',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'متر مكعب',
    col0Label: 'حمام سباحة (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية (متر مكعب)', 'سابقة (متر مكعب)', 'الإستهلاك (متر مكعب)'],
    row3Labels: ['حمام سباحة (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'حمام سباحة (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'قيمة مضافة (جم)', x: 59, width: 59, chargeGroups: [6], format: 'amount' },
      { label: 'خدمات الجهاز التنظيمى (جم)', x: 118, width: 59, chargeGroups: [7], format: 'amount' },
      { label: 'إستدامة الخدمة (جم)', x: 177, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك (متر مكعب)', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0],
      CUSTOMER_SERVICE: [2, 3],
      SUSTAIN_FEES: [4],
      SERVICE_FEES: [1],
      VAT: [6],
      OTHER: [7],
      PERCENTAGE: [5],
    },
    extraGroups: ['ServiceFees', 'SustainFees', 'VAT', 'PERCENTAGE'],
  },

  solar: {
    name: 'solar_invoice',
    invoiceTitle: 'فاتورة شمسية',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'ك.و.س',
    col0Label: 'خصومات (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية (ك.و.س)', 'سابقة (ك.و.س)', 'الإستهلاك (ك.و.س)'],
    row3Labels: ['خصومات (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'خصومات (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك (ك.و.س)', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      SETTLEMENT: [6],
    },
  },

  chilled_water: {
    name: 'chilled_water_invoice',
    invoiceTitle: 'فاتورة مياه مثلجة',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'ر.ت',
    col0Label: 'خصومات (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية', 'سابقة', 'الإستهلاك'],
    row3Labels: ['خصومات (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'خصومات (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      SETTLEMENT: [6],
    },
  },

  settlement: {
    name: 'settlement_invoice',
    invoiceTitle: 'فاتورة تسوية',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: '',
    col0Label: 'تسويات (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية', 'سابقة', 'الإستهلاك'],
    row3Labels: ['خصومات (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'خصومات (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة التسوية (جم)', x: 236, width: 59, chargeGroups: [12, 13], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'البيان', x: 354, width: 59, chargeGroups: [12], format: 'number' },
    ],
    chargeGroupMapping: {
      SETTLEMENT_AMOUNT: [12, 13],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      SETTLEMENT: [6],
    },
  },

  gas: {
    name: 'gas_invoice',
    invoiceTitle: 'فاتورة غاز',
    pageWidth: 421,
    pageHeight: 297,
    orientation: 'landscape',
    unitLabel: 'متر مكعب',
    col0Label: 'خصومات (جم)',
    headerRowLabels: ['نوع النشاط', 'كود العميل', 'تاريخ الإصدار', 'اشهر المحاسبة', 'رقم العداد'],
    row2Labels: ['عدد العدادات', 'السيد/', 'حالية (متر مكعب)', 'سابقة (متر مكعب)', 'الإستهلاك (متر مكعب)'],
    row3Labels: ['خصومات (جم)', 'العنوان/', 'قيمة الإستهلاك (جم)', 'إجمالي الإستهلاك', 'حالة الفاتورة'],
    chargeColumns: [
      { label: 'خصومات (جم)', x: 0, width: 59, chargeGroups: [-1], format: 'amount' },
      { label: 'إدارية (جم)', x: 59, width: 59, chargeGroups: [4], format: 'amount' },
      { label: 'تسويات (جم)', x: 118, width: 59, chargeGroups: [6], format: 'abs-amount' },
      { label: 'رسوم ودمغات (جم)', x: 177, width: 59, chargeGroups: [1], format: 'amount' },
      { label: 'قيمة الإستهلاك (جم)', x: 236, width: 59, chargeGroups: [0, 14], format: 'amount' },
      { label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' },
      { label: 'الإستهلاك (متر مكعب)', x: 354, width: 59, chargeGroups: [0], format: 'number' },
    ],
    chargeGroupMapping: {
      CONSUMPTION: [0, 14],
      CUSTOMER_SERVICE: [2, 3],
      ISSUE_FEES: [4],
      FEES: [1],
      SETTLEMENT: [6],
    },
  },
};

export function getTemplateConfig(utilityType: string): TemplateConfig {
  const raw = utilityType?.toLowerCase().replace(/\s+/g, '_') || 'electricity';
  // Map meter subtypes to their parent template config
  const subtypeMap: Record<string, string> = {
    'water_main': 'water',
    'water_child': 'water',
    'water_01': 'water',
    'water_04': 'water',
    'water_new': 'water_new',
    'chilled_water_a': 'chilled_water',
    'chilled_water_b': 'chilled_water',
    'outdoor_unit': 'chilled_water',
    'solar_pv': 'solar',
  };
  const key = subtypeMap[raw] || raw;
  return TEMPLATE_REGISTRY[key] || TEMPLATE_REGISTRY.electricity;
}
