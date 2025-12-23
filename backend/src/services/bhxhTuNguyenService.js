// src/services/bhxhTuNguyenService.js
import { getHeSoTruotGia } from "./bhxhPriceIndex.service.js";

/**
 * Quy đổi tháng → năm
 * 1–6 tháng = 0.5 năm
 * 7–11 tháng = 1 năm
 */
export function convertMonthsToYears(months) {
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  if (remainder >= 7) return years + 1;
  if (remainder >= 1) return years + 0.5;
  return years;
}

/**
 * Tính MBQTL cho 1 giai đoạn
 */
export function tinhMBQTL(gd) {
  let total = 0;
  let totalMonths = 0;

  const { startYear, startMonth, endYear, endMonth, luong } = gd;

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
 * Tính hỗ trợ Nhà nước theo đối tượng & năm
 */
function tinhHoTro(doiTuong, year) {
  const base = year <= 2021 ? 700_000 : 1_500_000;

  const percent =
    doiTuong === "Hộ nghèo"
      ? 0.3
      : doiTuong === "Hộ cận nghèo"
      ? 0.25
      : 0.1;

  return 0.22 * base * percent;
}

/**
 * Tính BHXH một lần + hỗ trợ Nhà nước (TỰ NGUYỆN)
 */
export function tinhBHXHTuNguyen(giaiDoans) {
  let tongTien = 0;
  let tongThang = 0;
  let tongSupport = 0;

  const chiTietGiaiDoan = giaiDoans.map(gd => {
    const { total, totalMonths } = tinhMBQTL(gd);

    // Tính hỗ trợ Nhà nước theo từng tháng
    for (let y = gd.startYear; y <= gd.endYear; y++) {
      const start = y === gd.startYear ? gd.startMonth : 1;
      const end = y === gd.endYear ? gd.endMonth : 12;

      for (let m = start; m <= end; m++) {
        tongSupport += tinhHoTro(gd.doiTuong, y);
      }
    }

    tongTien += total;
    tongThang += totalMonths;

    return {
      ...gd,
      total,
      totalMonths
    };
  });

  // MBQTL
  const mbqtl = tongTien / tongThang;

  let mucHuong = 0;

  // ===============================
  // 1️⃣ Chưa đủ 1 năm (< 12 tháng)
  // ===============================
  if (tongThang < 12) {
    mucHuong = Math.min(
      tongTien * 0.22,
      mbqtl * 2 // tối đa 2 tháng MBQTL
    );
  }
  // ===============================
  // 2️⃣ Đủ ≥ 1 năm
  // ===============================
  else {
    const soNam = convertMonthsToYears(tongThang);
    mucHuong = mbqtl * soNam * 2;
  }

  const thucNhan = mucHuong - tongSupport;

  return {
    chiTietGiaiDoan,
    tongThang,
    mbqtl,
    mucHuong,
    tongSupport,
    thucNhan
  };
}
