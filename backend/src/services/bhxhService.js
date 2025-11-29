const HE_SO_TRUOT_GIA = {
  "1995": 4.78, "1996": 4.51, "1997": 4.37, "1998": 4.06,
  "1999": 3.89, "2000": 3.95, "2001": 3.97, "2002": 3.82,
  "2003": 3.7, "2004": 3.43, "2005": 3.17, "2006": 2.95,
  "2007": 2.72, "2008": 2.21, "2009": 2.07, "2010": 1.9,
  "2011": 1.6, "2012": 1.47, "2013": 1.37, "2014": 1.32,
  "2015": 1.31, "2016": 1.28, "2017": 1.23, "2018": 1.19,
  "2019": 1.16, "2020": 1.12, "2021": 1.1, "2022": 1.07,
  "2023": 1.04, "2024": 1, "2025": 1
};

export function getHeSoTruotGia(year) {
  return HE_SO_TRUOT_GIA[year] || 1;
}

// Tính số năm quy đổi từ tháng (lẻ 1-6 tháng = 0.5 năm, 7-11 tháng = 1 năm)
export function convertMonthsToYears(months) {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  let extra = 0;
  if (remainder >= 1 && remainder <= 6) extra = 0.5;
  if (remainder >= 7) extra = 1;
  return years + extra;
}

// Tính MBQTL cho từng giai đoạn
export function tinhMBQTL(giaidoan) {
  const { startYear, startMonth, endYear, endMonth, luong, thaiSan } = giaidoan;
  let total = 0;
  let totalMonths = 0;

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const heSo = getHeSoTruotGia(year);
    total += luong * heSo;
    totalMonths++;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return { total, totalMonths };
}

// Tính BHXH một lần
export function tinhBHXH1Lan(giaiDoans) {
  let totalTien = 0;
  let totalThang = 0;

  // Tính MBQTL cho tất cả giai đoạn
  const chiTietGiaiDoan = giaiDoans.map(gd => {
    const { total, totalMonths } = tinhMBQTL(gd);
    totalTien += total;
    totalThang += totalMonths;
    return {
      ...gd,
      total,
      totalMonths
    };
  });

  const mbqtl = totalTien / totalThang;

  // Tính thời gian BHXH trước 2014 và từ 2014 trở đi
  let thoiGianTruoc2014 = 0;
  let thoiGianSau2014 = 0;

  chiTietGiaiDoan.forEach(gd => {
    const months = gd.totalMonths;
    if (gd.startYear < 2014) {
      thoiGianTruoc2014 += months;
    } else {
      thoiGianSau2014 += months;
    }
  });

  const soNamTruoc2014 = convertMonthsToYears(thoiGianTruoc2014);
  const soNamSau2014 = convertMonthsToYears(thoiGianSau2014);

  let bhxh1Lan = 0;

  if (totalThang < 12) {
    // Chưa đủ 1 năm: 22% tổng lương đã đóng, tối đa 2 tháng MBQTL
    bhxh1Lan = Math.min(0.22 * totalTien, 2 * mbqtl);
  } else {
    // Đủ ≥1 năm: tính BHXH 1 lần theo quy định
    bhxh1Lan = (mbqtl * 1.5 * soNamTruoc2014) + (mbqtl * 2 * soNamSau2014);
  }

  return {
    chiTietGiaiDoan,
    tongTien: totalTien,
    tongThang: totalThang,
    mbqtl,
    thoiGianTruoc2014: soNamTruoc2014,
    thoiGianSau2014: soNamSau2014,
    bhxh1Lan
  };
}

