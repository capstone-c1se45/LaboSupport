// services/salaryCalculator.js

const BASE_SALARY = 2340000; // Lương cơ sở
const PERSONAL_DEDUCTION = 11000000; // Giảm trừ bản thân
const DEPENDENT_DEDUCTION = 4400000; // Giảm trừ người phụ thuộc

// Lương tối thiểu vùng
const REGION_MIN_WAGE = {
  I: 4960000,
  II: 4410000,
  III: 3860000,
  IV: 3450000,
};

// Bảo hiểm bắt buộc (phần người lao động)
const INSURANCE_RATES = {
  BHXH: 0.08, // Bảo hiểm xã hội
  BHYT: 0.015, // Bảo hiểm y tế
  BHTN: 0.01, // Bảo hiểm thất nghiệp
};

// Bảo hiểm phần doanh nghiệp trả
const EMPLOYER_INSURANCE_RATES = {
  BHXH: 0.17,
  BHYT: 0.03,
  BHTN: 0.01,
  TNLDBNN: 0.005, // Tai nạn lao động - bệnh nghề nghiệp
};

// Bậc thuế thu nhập cá nhân (TNCN)
const TAX_BRACKETS = [
  { max: 5000000, rate: 0.05 },
  { max: 10000000, rate: 0.1 },
  { max: 18000000, rate: 0.15 },
  { max: 32000000, rate: 0.2 },
  { max: 52000000, rate: 0.25 },
  { max: 80000000, rate: 0.3 },
  { max: Infinity, rate: 0.35 },
];

// Tính thuế TNCN theo thu nhập chịu thuế
function calculatePersonalIncomeTax(taxableIncome) {
  let remaining = taxableIncome;
  let totalTax = 0;

  for (const bracket of TAX_BRACKETS) {
    const taxableAmount = Math.min(remaining, bracket.max);
    totalTax += taxableAmount * bracket.rate;
    remaining -= taxableAmount;
    if (remaining <= 0) break;
  }

  return totalTax;
}

// Hàm tính lương Gross -> Net
function grossToNet({ grossSalary, insuranceSalary, dependents = 0, region = "I" }) {

  // Nếu không nhập thì mặc định = gross
  const insSalary = insuranceSalary || grossSalary;

  const insurances = {
    BHXH: insSalary * INSURANCE_RATES.BHXH,
    BHYT: insSalary * INSURANCE_RATES.BHYT,
    BHTN: insSalary * INSURANCE_RATES.BHTN,
  };

  const totalInsurance = Object.values(insurances).reduce((a, b) => a + b, 0);
  const taxableIncomeBeforeDeduction = grossSalary - totalInsurance;

  const totalDeduction =
    PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION;

  const taxableIncome = Math.max(0, taxableIncomeBeforeDeduction - totalDeduction);
  const incomeTax = calculatePersonalIncomeTax(taxableIncome);

  const netSalary = taxableIncomeBeforeDeduction - incomeTax;

  return {
    grossSalary,
    insuranceSalary: insSalary,
    netSalary,
    insurances,
    totalInsurance,
    taxableIncomeBeforeDeduction,
    taxableIncome,
    incomeTax,
  };
}


// Hàm tính lương Net -> Gross
function netToGross({ netSalary, insuranceSalary, dependents = 0, region = "I" }) {
  let estimatedGross = netSalary;
  let result = {};

  for (let i = 0; i < 25; i++) {
    result = grossToNet({
      grossSalary: estimatedGross,
      insuranceSalary,
      dependents,
      region,
    });

    const diff = netSalary - result.netSalary;
    if (Math.abs(diff) < 1) break;

    estimatedGross += diff;
  }

  return result;
}


export default {
  grossToNet,
  netToGross,
  REGION_MIN_WAGE,
  BASE_SALARY,
  PERSONAL_DEDUCTION,
  DEPENDENT_DEDUCTION,
};
