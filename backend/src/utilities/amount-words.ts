export function amountInWordsAr(amount: number): string {
  if (amount === 0) return 'صفر';
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', ' تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const intPart = Math.floor(amount);
  const fracPart = Math.round((amount - intPart) * 1000);

  function convert3(n: number): string {
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const r = n % 100;
    let res = hundreds[h] || '';
    if (r === 0) return res;
    if (res) res += ' و';
    if (r < 10) res += units[r];
    else if (r < 20) res += teens[r - 10];
    else {
      const t = Math.floor(r / 10);
      const u = r % 10;
      if (u > 0) res += units[u] + ' و';
      res += tens[t];
    }
    return res;
  }

  const billions = Math.floor(intPart / 1e9);
  const millions = Math.floor((intPart % 1e9) / 1e6);
  const thousands = Math.floor((intPart % 1e6) / 1e3);
  const rest = intPart % 1e3;

  let result = '';
  if (billions > 0) result += convert3(billions) + ' مليار ';
  if (millions > 0) result += convert3(millions) + ' مليون ';
  if (thousands > 0) result += convert3(thousands) + ' ألف ';
  if (rest > 0) result += convert3(rest);

  result += ' جنيهاً';
  if (fracPart > 0) result += ` و${convert3(fracPart)} مليم`;
  result += ' لا غير';
  return result.trim();
}

export function amountInWordsEn(amount: number): string {
  if (amount === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelow1000(n: number): string {
    if (n === 0) return '';
    let res = '';
    const h = Math.floor(n / 100);
    if (h > 0) res += ones[h] + ' Hundred ';
    const r = n % 100;
    if (r > 0) {
      if (res) res += 'and ';
      if (r < 20) res += ones[r];
      else {
        const t = Math.floor(r / 10);
        const u = r % 10;
        res += tens[t];
        if (u > 0) res += ' ' + ones[u];
      }
    }
    return res.trim();
  }

  const intPart = Math.floor(amount);
  const fracPart = Math.round((amount - intPart) * 1000);

  const billions = Math.floor(intPart / 1e9);
  const millions = Math.floor((intPart % 1e9) / 1e6);
  const thousands = Math.floor((intPart % 1e6) / 1e3);
  const rest = intPart % 1e3;

  let result = '';
  if (billions > 0) result += convertBelow1000(billions) + ' Billion ';
  if (millions > 0) result += convertBelow1000(millions) + ' Million ';
  if (thousands > 0) result += convertBelow1000(thousands) + ' Thousand ';
  if (rest > 0) result += convertBelow1000(rest);

  result += ' Egyptian Pounds';
  if (fracPart > 0) result += ' and ' + convertBelow1000(fracPart) + ' Milliemes';
  result += ' Only';
  return result.trim();
}
