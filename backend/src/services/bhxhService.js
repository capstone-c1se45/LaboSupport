// bhxhService.js
import { getHeSoTruotGia } from "./bhxhPriceIndex.service.js";

/**
 * Tính số năm quy đổi từ tháng
 * 1–6 tháng = 0.5 năm
 * 7–11 tháng = 1 năm
 */
export function convertMonthsToYears(months) {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  let extra = 0;

  if (remainder >= 1 && remainder <= 6) extra = 0.5;
  if (remainder >= 7) extra = 1;

  return years + extra;
}

/**
 * Tính MBQTL cho từng giai đoạn
 */
export function tinhMBQTL(giaidoan) {
  const { startYear, startMonth, endYear, endMonth, luong } = giaidoan;

  let total = 0;
  let totalMonths = 0;

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const heSo = getHeSoTruotGia(year); // ✅ lấy từ DB
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

/**
 * Tính BHXH một lần
 */
export function tinhBHXH1Lan(giaiDoans) {
  let totalTien = 0;
  let totalThang = 0;

  // Chi tiết từng giai đoạn
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

  // Phân loại thời gian trước / sau 2014
  let thoiGianTruoc2014 = 0;
  let thoiGianSau2014 = 0;

  chiTietGiaiDoan.forEach(gd => {
    if (gd.startYear < 2014) {
      thoiGianTruoc2014 += gd.totalMonths;
    } else {
      thoiGianSau2014 += gd.totalMonths;
    }
  });

  const soNamTruoc2014 = convertMonthsToYears(thoiGianTruoc2014);
  const soNamSau2014 = convertMonthsToYears(thoiGianSau2014);

  let bhxh1Lan = 0;

  if (totalThang < 12) {
    // Chưa đủ 1 năm
    bhxh1Lan = Math.min(0.22 * totalTien, 2 * mbqtl);
  } else {
    // Đủ ≥ 1 năm
    bhxh1Lan =
      mbqtl * 1.5 * soNamTruoc2014 +
      mbqtl * 2 * soNamSau2014;
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
