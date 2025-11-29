// src/services/bhxhTuNguyenService.js

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

// Lấy hệ số trượt giá theo năm
export function getHeSoTruotGia(year) {
  return HE_SO_TRUOT_GIA[year] || 1;
}

// Quy đổi tháng → năm
export function convertMonthsToYears(months) {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder >= 7) return years + 1;
  if (remainder >= 1) return years + 0.5;
  return years;
}

// Tính MBQTL cho 1 giai đoạn
export function tinhMBQTL(gd) {
  let total = 0;
  let totalMonths = 0;
  let { startYear, startMonth, endYear, endMonth, luong } = gd;

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    total += luong * getHeSoTruotGia(year);
    totalMonths++;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return { total, totalMonths };
}

// Hỗ trợ Nhà nước theo đối tượng và năm
function tinhHoTro(doiTuong, year) {
  const base = year <= 2021 ? 700000 : 1500000;
  const percent = doiTuong === "Hộ nghèo" ? 0.3 :
                  doiTuong === "Hộ cận nghèo" ? 0.25 : 0.10;
  return 0.22 * base * percent;
}

// Tính BHXH một lần + hỗ trợ nhà nước (TỰ NGUYỆN)
export function tinhBHXHTuNguyen(giaiDoans) {
  let tongTien = 0;
  let tongThang = 0;
  let tongSupport = 0;

  const chiTietGiaiDoan = giaiDoans.map(gd => {
    const { total, totalMonths } = tinhMBQTL(gd);

    // Hỗ trợ nhà nước theo tháng
    for (let y = gd.startYear; y <= gd.endYear; y++) {
      let start = y === gd.startYear ? gd.startMonth : 1;
      let end = y === gd.endYear ? gd.endMonth : 12;

      for (let m = start; m <= end; m++) {
        tongSupport += tinhHoTro(gd.doiTuong, y);
      }
    }

    tongTien += total;
    tongThang += totalMonths;

    return { ...gd, total, totalMonths };
  });

  // Tính MBQTL
  const mbqtl = tongTien / tongThang;

  let mucHuong = 0;

  // ======================================
  // 1) Trường hợp CHƯA ĐỦ 1 NĂM (< 12 tháng)
  // ======================================
  if (tongThang < 12) {
    mucHuong = Math.min(
      tongTien * 0.22,
      mbqtl * 2 // tối đa 2 tháng MBQTL
    );
  } 
  else {
    // ======================================
    // 2) ĐỦ ≥ 1 NĂM → tính đúng theo BHXH tự nguyện
    // ======================================
    const soNamSau2014 = convertMonthsToYears(tongThang);
    mucHuong = mbqtl * soNamSau2014 * 2; 
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
