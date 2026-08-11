/**
 * ePOWER Customer Service Meter Workflow V1
 * Bind this project to the imported Google Sheet.
 */

const SHEETS = Object.freeze({
  INPUT: 'إدخال خدمة العملاء',
  CUSTOMERS: 'قاعدة بيانات العملاء',
  METERS: 'العدادات',
  READINGS: 'سجل القراءات',
  BILLING: 'سجل الفواتير',
  TARIFFS: 'التعريفة',
  CONFIG: 'الإعدادات والتعريفات',
  REPORT: 'تقرير الشهر',
  AUDIT: 'سجل العمليات',
  LISTS: 'القوائم',
});

const INPUT = Object.freeze({
  METER_SERIAL: 'B4',
  CURRENT_READING: 'B10',
  MONTH: 'E10',
  YEAR: 'G10',
  READING_STATUS: 'G12',
  MANUAL_OVERRIDE: 'B13',
  EXCEPTION_REASON: 'E13',
  NOTES: 'B14',
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('خدمة العملاء')
    .addItem('حفظ القراءة', 'saveReading')
    .addItem('مسح الحقول', 'clearInput')
    .addSeparator()
    .addItem('تحديث تقرير الشهر', 'buildMonthlyReport')
    .addItem('استخراج تقرير الشهر PDF', 'exportMonthlyReportPdf')
    .addSeparator()
    .addItem('إعداد الحماية', 'applyProtections')
    .addToUi();
}

function setupProject() {
  validateRequiredSheets_();
  applyProtections();
  onOpen();
  SpreadsheetApp.getUi().alert('تم إعداد المشروع. راجع التعريفة والإعدادات واختبارات الجودة قبل التشغيل الفعلي.');
}

function saveReading() {
  const ui = SpreadsheetApp.getUi();
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) {
    ui.alert('تعذر الحفظ الآن لأن هناك عملية أخرى قيد التنفيذ. حاول مرة أخرى بعد لحظات.');
    return;
  }

  try {
    validateRequiredSheets_();
    const ss = SpreadsheetApp.getActive();
    const inputSheet = ss.getSheetByName(SHEETS.INPUT);
    const config = getConfig_();
    const demoMode = toBoolean_(config.Demo_Mode);
    const goLiveReady = toBoolean_(config.Go_Live_Ready);

    if (!demoMode && !goLiveReady) {
      throw new Error('النظام غير معتمد للتشغيل بعد. يجب اعتماد التعريفة واجتياز اختبارات الجودة أولاً.');
    }

    const meterSerial = normalizeKey_(inputSheet.getRange(INPUT.METER_SERIAL).getDisplayValue());
    const month = Number(inputSheet.getRange(INPUT.MONTH).getValue());
    const year = Number(inputSheet.getRange(INPUT.YEAR).getValue());
    const currentRaw = inputSheet.getRange(INPUT.CURRENT_READING).getValue();
    const manualOverrideRaw = inputSheet.getRange(INPUT.MANUAL_OVERRIDE).getValue();
    const exceptionReason = cleanText_(inputSheet.getRange(INPUT.EXCEPTION_REASON).getDisplayValue());
    const notes = cleanText_(inputSheet.getRange(INPUT.NOTES).getDisplayValue());

    if (!meterSerial) throw new Error('برجاء إدخال رقم العداد.');
    if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('برجاء اختيار شهر صحيح.');
    if (!Number.isInteger(year) || year < 2020 || year > 2100) throw new Error('برجاء اختيار سنة صحيحة.');

    const meterTable = getTable_(SHEETS.METERS);
    const customerTable = getTable_(SHEETS.CUSTOMERS);
    const readingTable = getTable_(SHEETS.READINGS);

    const meterMatches = meterTable.rows.filter(r => normalizeKey_(r.Meter_Serial) === meterSerial);
    if (!meterMatches.length) throw new Error('رقم العداد غير موجود. برجاء مراجعة الرقم أو التواصل مع المشرف.');
    if (meterMatches.length > 1) throw new Error('رقم العداد مكرر ويحتاج تحديد السجل الصحيح بواسطة المشرف.');

    const meter = meterMatches[0];
    const customer = customerTable.rows.find(r => cleanText_(r.Customer_ID) === cleanText_(meter.Customer_ID));
    if (!customer) throw new Error('سجل العميل المرتبط بالعداد غير موجود.');

    const allowDemoRecord = demoMode && meterSerial.startsWith('DEMO-');
    if (!allowDemoRecord && cleanText_(meter.Active_Status) !== 'Active') {
      throw new Error('العداد غير نشط ولا يمكن تسجيل قراءة عليه.');
    }
    if (!allowDemoRecord && cleanText_(customer.Active_Status) !== 'Active') {
      throw new Error('العميل غير نشط ولا يمكن تسجيل قراءة عليه.');
    }

    const duplicate = readingTable.rows.some(r =>
      normalizeKey_(r.Meter_Serial) === meterSerial &&
      Number(r.Billing_Month) === month &&
      Number(r.Billing_Year) === year &&
      cleanText_(r.Reading_Status) !== 'Cancelled'
    );
    if (duplicate) throw new Error('تم تسجيل قراءة لهذا العداد في نفس الشهر والسنة من قبل. لن يتم الحفظ المكرر.');

    const billingMethod = cleanText_(meter.Billing_Method) || 'Metered';
    const noNumericReadingMethods = new Set(['No meter', 'Contract/fixed consumption', 'Suspended / no billing']);
    const currentReading = toOptionalNumber_(currentRaw);
    if (!noNumericReadingMethods.has(billingMethod) && currentReading === null) {
      throw new Error('برجاء إدخال قراءة حالية رقمية صحيحة.');
    }

    const previousReading = findPreviousReading_(readingTable.rows, meterSerial, meter.Initial_Reading);
    const multiplier = toNumberOrDefault_(meter.Meter_Multiplier, 1);
    const conversionFactor = toNumberOrDefault_(meter.Conversion_Factor, 1);
    const minimumConsumption = toNumberOrDefault_(meter.Minimum_Consumption, 0);
    const contractConsumption = toNumberOrDefault_(meter.Contract_Consumption, 0);
    const rawDelta = currentReading === null || previousReading === null ? null : currentReading - previousReading;
    const calculatedConsumption = rawDelta === null ? null : rawDelta * multiplier * conversionFactor;
    const manualOverride = toOptionalNumber_(manualOverrideRaw);

    let billingConsumption;
    switch (billingMethod) {
      case 'Minimum consumption':
        billingConsumption = Math.max(calculatedConsumption || 0, minimumConsumption);
        break;
      case 'Contract/fixed consumption':
      case 'No meter':
        billingConsumption = contractConsumption;
        break;
      case 'Suspended / no billing':
        billingConsumption = 0;
        break;
      case 'Manual approved override':
        if (manualOverride === null) throw new Error('طريقة الاحتساب اليدوي تتطلب إدخال قيمة الاستهلاك اليدوي.');
        billingConsumption = manualOverride;
        break;
      default:
        billingConsumption = calculatedConsumption;
    }

    if (manualOverride !== null) billingConsumption = manualOverride;
    if (billingConsumption === null || !Number.isFinite(billingConsumption) || billingConsumption < 0) {
      throw new Error('تعذر تحديد استهلاك صالح للفوترة. راجع طريقة الاحتساب والاستثناء.');
    }

    const maxNormal = toOptionalNumber_(config.Max_Normal_Consumption);
    const negativeDelta = rawDelta !== null && rawDelta < 0;
    const abnormalHigh = maxNormal !== null && billingConsumption > maxNormal;
    const hasOverride = manualOverride !== null && manualOverride !== calculatedConsumption;
    const exceptionRequired = negativeDelta || abnormalHigh || hasOverride;
    if (exceptionRequired && !exceptionReason) {
      throw new Error('هذه القراءة تحتاج سبب استثناء واضح قبل الحفظ.');
    }

    const now = new Date();
    const user = Session.getEffectiveUser().getEmail() || 'Unknown User';
    const readingId = makeId_('RDG', year, month);
    const billingId = makeId_('BIL', year, month);
    const needsApproval = exceptionRequired && toBoolean_(config.Override_Approval_Required);
    const readingStatus = needsApproval ? 'Pending Approval' : 'Approved';
    const billingStatus = needsApproval ? 'Pending Approval' : 'Generated';
    const eventType = inferEventType_(billingMethod, exceptionReason);
    const approvedBy = needsApproval ? '' : user;
    const approvedAt = needsApproval ? '' : now;
    const readingDate = new Date(year, month, 0);

    appendByHeaders_(SHEETS.READINGS, {
      Reading_ID: readingId,
      Customer_ID: customer.Customer_ID,
      Meter_Serial: meter.Meter_Serial,
      Reading_Date: readingDate,
      Billing_Month: month,
      Billing_Year: year,
      Previous_Reading: previousReading,
      Current_Reading: currentReading,
      Raw_Delta: rawDelta,
      Meter_Multiplier: multiplier,
      Conversion_Factor: conversionFactor,
      Calculated_Consumption: calculatedConsumption,
      Minimum_Consumption: minimumConsumption,
      Contract_Consumption: contractConsumption,
      Manual_Override_Consumption: manualOverride,
      Billing_Consumption: billingConsumption,
      Override_Reason: exceptionReason,
      Reading_Status: readingStatus,
      Entered_By: user,
      Entered_At: now,
      Approved_By: approvedBy,
      Approved_At: approvedAt,
      Event_Type: eventType,
      Notes: notes,
      Source: 'CS_Input',
    });

    const bill = calculateBill_(meter, billingConsumption, readingDate, demoMode);
    appendByHeaders_(SHEETS.BILLING, {
      Billing_ID: billingId,
      Reading_ID: readingId,
      Customer_ID: customer.Customer_ID,
      Meter_Serial: meter.Meter_Serial,
      Billing_Month: month,
      Billing_Year: year,
      Tariff_Profile: meter.Tariff_Profile,
      Tariff_Version: bill.version,
      Effective_Rate: bill.effectiveRate,
      Billing_Consumption: billingConsumption,
      Consumption_Amount: bill.consumptionAmount,
      Customer_Service_Fee: bill.customerServiceFee,
      Admin_Fee: bill.adminFee,
      Stamp_Tax_Rate: bill.stampTaxRate,
      Stamp_Tax: bill.stampTax,
      Fixed_Fee: bill.fixedFee,
      Other_Fee: 0,
      Discount: 0,
      Total_Bill: bill.total,
      Billing_Status: billingStatus,
      Generated_At: now,
      Generated_By: user,
      Source: 'CS_Input',
    });

    appendAudit_({
      action: 'SAVE_READING',
      entityType: 'Reading',
      customerId: customer.Customer_ID,
      meterSerial: meter.Meter_Serial,
      readingId,
      billingId,
      oldValue: previousReading,
      newValue: currentReading,
      reason: exceptionReason || 'Normal reading',
      approval: needsApproval ? 'Pending Approval' : 'Auto Approved',
      result: 'Success',
      source: 'CS_Input',
      user,
      now,
    });

    SpreadsheetApp.flush();
    clearInputFields_();
    ui.alert(`تم حفظ القراءة بنجاح.\nرقم العملية: ${readingId}\nحالة القراءة: ${readingStatus}`);
  } catch (error) {
    try {
      appendAudit_({
        action: 'SAVE_READING',
        entityType: 'Reading',
        result: 'Failed',
        reason: error.message || String(error),
        source: 'CS_Input',
      });
    } catch (_) {}
    ui.alert(`لم يتم الحفظ.\n${error.message || error}`);
  } finally {
    lock.releaseLock();
  }
}

function clearInput() {
  clearInputFields_();
  SpreadsheetApp.getUi().alert('تم مسح حقول الإدخال مع الاحتفاظ بالشهر والسنة.');
}

function buildMonthlyReport() {
  validateRequiredSheets_();
  const ss = SpreadsheetApp.getActive();
  const report = ss.getSheetByName(SHEETS.REPORT);
  const month = Number(report.getRange('B3').getValue());
  const year = Number(report.getRange('D3').getValue());
  const locationFilter = cleanText_(report.getRange('F3').getDisplayValue());
  const serviceFilter = cleanText_(report.getRange('H3').getDisplayValue());
  const statusFilter = cleanText_(report.getRange('J3').getDisplayValue());
  if (!Number.isInteger(month) || !Number.isInteger(year)) throw new Error('اختر الشهر والسنة أولاً.');

  const bills = getTable_(SHEETS.BILLING).rows;
  const customers = getTable_(SHEETS.CUSTOMERS).rows;
  const meters = getTable_(SHEETS.METERS).rows;
  const readings = getTable_(SHEETS.READINGS).rows;
  const customerMap = new Map(customers.map(r => [cleanText_(r.Customer_ID), r]));
  const meterMap = new Map(meters.map(r => [normalizeKey_(r.Meter_Serial), r]));
  const readingMap = new Map(readings.map(r => [cleanText_(r.Reading_ID), r]));

  const rows = bills
    .filter(r => Number(r.Billing_Month) === month && Number(r.Billing_Year) === year)
    .map(r => {
      const meter = meterMap.get(normalizeKey_(r.Meter_Serial)) || {};
      const customer = customerMap.get(cleanText_(r.Customer_ID)) || {};
      const reading = readingMap.get(cleanText_(r.Reading_ID)) || {};
      return {
        data: r,
        output: [
          r.Billing_ID,
          customer.Customer_Name || '',
          r.Meter_Serial,
          meter.Location || meter.Station || '',
          meter.Service_Type || '',
          r.Billing_Consumption,
          r.Total_Bill,
          r.Billing_Status,
          reading.Override_Reason || '',
          r.Generated_At,
        ],
      };
    })
    .filter(item => locationFilter === 'الكل' || !locationFilter || cleanText_(item.output[3]) === locationFilter)
    .filter(item => serviceFilter === 'الكل' || !serviceFilter || cleanText_(item.output[4]) === serviceFilter)
    .filter(item => statusFilter === 'الكل' || !statusFilter || cleanText_(item.output[7]) === statusFilter)
    .map(item => item.output);

  const lastRow = Math.max(report.getLastRow(), 11);
  report.getRange(11, 1, lastRow - 10, 10).clearContent();
  if (rows.length) report.getRange(11, 1, rows.length, 10).setValues(rows);
  report.getRange('L2').setValue('Generated_At');
  report.getRange('M2').setValue(new Date()).setNumberFormat('yyyy-mm-dd hh:mm');
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert(`تم تحديث التقرير. عدد السجلات: ${rows.length}`);
}

function exportMonthlyReportPdf() {
  buildMonthlyReport();
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEETS.REPORT);
  const month = Number(sheet.getRange('B3').getValue());
  const year = Number(sheet.getRange('D3').getValue());
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const fileName = `Monthly_Report_${year}-${String(month).padStart(2, '0')}_Dekheila_Port_${stamp}.pdf`;
  const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export` +
    `?format=pdf&gid=${sheet.getSheetId()}&size=A4&portrait=false&fitw=true` +
    '&sheetnames=false&printtitle=false&pagenumbers=true&gridlines=false&fzr=true';
  const blob = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: false,
  }).getBlob().setName(fileName);
  const folderId = cleanText_(getConfig_().Export_Folder_ID);
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const file = folder.createFile(blob);
  appendAudit_({ action: 'EXPORT_MONTHLY_REPORT', entityType: 'Report', newValue: file.getUrl(), result: 'Success', source: SHEETS.REPORT });
  SpreadsheetApp.getUi().alert(`تم إنشاء التقرير:\n${fileName}\n${file.getUrl()}`);
}

function applyProtections() {
  const ss = SpreadsheetApp.getActive();
  const owner = Session.getEffectiveUser().getEmail();
  const inputSheet = ss.getSheetByName(SHEETS.INPUT);
  const editable = ['B4:C4', 'B10:C10', 'E10:F10', 'G10:H10', 'G12:H12', 'B13:C13', 'E13:H13', 'B14:H14']
    .map(a1 => inputSheet.getRange(a1));

  removeManagedProtections_(ss);
  const inputProtection = inputSheet.protect().setDescription('CS_INPUT_MANAGED');
  inputProtection.setUnprotectedRanges(editable);
  restrictProtection_(inputProtection, owner);

  [SHEETS.CUSTOMERS, SHEETS.METERS, SHEETS.READINGS, SHEETS.BILLING, SHEETS.TARIFFS, SHEETS.CONFIG, SHEETS.AUDIT, SHEETS.LISTS]
    .forEach(name => {
      const protection = ss.getSheetByName(name).protect().setDescription(`BACKEND_MANAGED_${name}`);
      restrictProtection_(protection, owner);
    });
  SpreadsheetApp.getUi().alert('تم تطبيق الحماية. المالك الحالي يحتفظ بصلاحية إدارة جداول الخلفية.');
}

function calculateBill_(meter, consumption, billingDate, demoMode) {
  const tariffRows = getTable_(SHEETS.TARIFFS).rows;
  const profile = cleanText_(meter.Tariff_Profile);
  const serviceType = cleanText_(meter.Service_Type);
  const candidates = tariffRows.filter(r => {
    const from = toDate_(r.Effective_From);
    const to = toDate_(r.Effective_To);
    const status = cleanText_(r.Approval_Status);
    const statusAllowed = status === 'Approved' || (demoMode && profile.startsWith('DEMO-') && status === 'Draft');
    return cleanText_(r.Tariff_Profile) === profile &&
      cleanText_(r.Service_Type) === serviceType &&
      statusAllowed &&
      (!from || billingDate >= from) &&
      (!to || billingDate <= to);
  });
  if (!candidates.length) throw new Error('لا توجد تعريفة معتمدة وسارية لهذا العداد والفترة.');

  candidates.sort((a, b) => (toDate_(b.Effective_From) || 0) - (toDate_(a.Effective_From) || 0));
  const version = cleanText_(candidates[0].Version);
  const versionRows = candidates.filter(r => cleanText_(r.Version) === version)
    .sort((a, b) => Number(a.Band_Order || 0) - Number(b.Band_Order || 0));
  const method = cleanText_(versionRows[0].Calculation_Method) || 'Flat';
  let consumptionAmount = 0;

  if (method === 'Progressive') {
    versionRows.forEach(r => {
      const lower = toNumberOrDefault_(r.Min_Band, 0);
      const upper = toOptionalNumber_(r.Max_Band);
      const rate = toNumberOrDefault_(r.Rate, 0);
      const bandQuantity = upper === null
        ? Math.max(0, consumption - lower)
        : Math.max(0, Math.min(consumption, upper) - lower);
      consumptionAmount += bandQuantity * rate;
    });
  } else {
    const row = versionRows.find(r => {
      const lower = toNumberOrDefault_(r.Min_Band, 0);
      const upper = toOptionalNumber_(r.Max_Band);
      return consumption >= lower && (upper === null || consumption <= upper);
    });
    if (!row) throw new Error('لا توجد شريحة تعريفة تغطي الاستهلاك المحسوب.');
    consumptionAmount = consumption * toNumberOrDefault_(row.Rate, 0);
  }

  const first = versionRows[0];
  const customerServiceFee = toNumberOrDefault_(first.Customer_Service_Fee, 0);
  const adminFee = toNumberOrDefault_(first.Admin_Fee, 0);
  const stampTaxRate = toNumberOrDefault_(first.Stamp_Tax_Rate, 0);
  const stampBasis = cleanText_(first.Stamp_Tax_Basis) || 'Consumption';
  const stampTax = stampBasis === 'Amount' ? consumptionAmount * stampTaxRate : consumption * stampTaxRate;
  const fixedFee = toNumberOrDefault_(first.Fixed_Fee, 0);
  const total = consumptionAmount + customerServiceFee + adminFee + stampTax + fixedFee;
  return {
    version,
    effectiveRate: consumption ? consumptionAmount / consumption : 0,
    consumptionAmount,
    customerServiceFee,
    adminFee,
    stampTaxRate,
    stampTax,
    fixedFee,
    total,
  };
}

function getTable_(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) throw new Error(`ورقة العمل غير موجودة: ${sheetName}`);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { headers: [], rows: [] };
  const headers = values[0].map(cleanText_);
  const rows = values.slice(1)
    .filter(row => row.some(value => cleanText_(value) !== ''))
    .map(row => Object.fromEntries(headers.map((header, i) => [header, row[i]])));
  return { headers, rows };
}

function appendByHeaders_(sheetName, record) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(cleanText_);
  const row = headers.map(header => Object.prototype.hasOwnProperty.call(record, header) ? record[header] : '');
  sheet.appendRow(row);
}

function appendAudit_(event) {
  const now = event.now || new Date();
  const user = event.user || Session.getEffectiveUser().getEmail() || 'Unknown User';
  appendByHeaders_(SHEETS.AUDIT, {
    Event_ID: makeId_('EVT', now.getFullYear(), now.getMonth() + 1),
    Timestamp: now,
    User: user,
    Action: event.action || '',
    Entity_Type: event.entityType || '',
    Customer_ID: event.customerId || '',
    Meter_Serial: event.meterSerial || '',
    Reading_ID: event.readingId || '',
    Billing_ID: event.billingId || '',
    Old_Value: event.oldValue ?? '',
    New_Value: event.newValue ?? '',
    Reason: event.reason || '',
    Approval: event.approval || '',
    Result: event.result || '',
    Source: event.source || '',
  });
}

function getConfig_() {
  return Object.fromEntries(getTable_(SHEETS.CONFIG).rows.map(r => [cleanText_(r.Key), r.Value]));
}

function findPreviousReading_(rows, meterSerial, initialReading) {
  const approved = rows
    .filter(r => normalizeKey_(r.Meter_Serial) === meterSerial && cleanText_(r.Reading_Status) === 'Approved')
    .sort((a, b) => toDate_(b.Reading_Date) - toDate_(a.Reading_Date));
  if (approved.length) return toOptionalNumber_(approved[0].Current_Reading);
  return toOptionalNumber_(initialReading);
}

function inferEventType_(billingMethod, reason) {
  if (billingMethod === 'No meter') return 'No meter';
  if (billingMethod === 'New meter / installation') return 'New meter';
  if (billingMethod === 'Final settlement' || reason === 'Final settlement') return 'Final settlement';
  if (reason === 'Meter replacement') return 'Meter replacement';
  if (reason === 'Meter rollover') return 'Rollover';
  return 'Normal';
}

function clearInputFields_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.INPUT);
  ['B4', 'B10', 'G12', 'B13', 'E13', 'B14'].forEach(a1 => sheet.getRange(a1).clearContent());
}

function validateRequiredSheets_() {
  const ss = SpreadsheetApp.getActive();
  Object.values(SHEETS).forEach(name => {
    if (!ss.getSheetByName(name)) throw new Error(`ورقة العمل المطلوبة غير موجودة: ${name}`);
  });
}

function removeManagedProtections_(ss) {
  ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    .filter(p => /MANAGED/.test(p.getDescription() || ''))
    .forEach(p => p.remove());
}

function restrictProtection_(protection, owner) {
  if (owner) protection.addEditor(owner);
  const removable = protection.getEditors().filter(user => user.getEmail() !== owner);
  if (removable.length) protection.removeEditors(removable);
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
}

function makeId_(prefix, year, month) {
  const date = new Date();
  const time = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const random = Utilities.getUuid().split('-')[0].toUpperCase();
  return `${prefix}-${year}${String(month).padStart(2, '0')}-${time}-${random}`;
}

function cleanText_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalizeKey_(value) {
  return cleanText_(value).toUpperCase().replace(/\s+/g, '');
}

function toOptionalNumber_(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toNumberOrDefault_(value, fallback) {
  const number = toOptionalNumber_(value);
  return number === null ? fallback : number;
}

function toBoolean_(value) {
  if (typeof value === 'boolean') return value;
  return ['TRUE', 'YES', '1'].includes(cleanText_(value).toUpperCase());
}

function toDate_(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
