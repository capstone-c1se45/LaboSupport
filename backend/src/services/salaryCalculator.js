// services/salaryCalculator.js
import { loadSalaryConfig } from "./configService.js";

const BASE_SALARY = 2340000; // vẫn có thể hardcode hoặc đưa DB sau
const PERSONAL_DEDUCTION = 11000000;
const DEPENDENT_DEDUCTION = 4400000;

// Bảo hiểm bắt buộc (NLĐ)
const INSURANCE_RATES = {
  BHXH: 0.08,
  BHYT: 0.015,
  BHTN: 0.01,
};

// =======================
// TÍNH THUẾ TNCN (DÙNG DB)
// =======================
function calculatePersonalIncomeTax(taxableIncome, taxBrackets) {
  let remaining = taxableIncome;
  let totalTax = 0;

  for (const b of taxBrackets) {
    const min = b.min_income;
    const max = b.max_income ?? Infinity;

    const taxablePart = Math.min(remaining, max - min);
    if (taxablePart > 0) {
      totalTax += taxablePart * b.rate;
      remaining -= taxablePart;
    }

    if (remaining <= 0) break;
  }

  return totalTax;
}

// =======================
// GROSS → NET
// =======================
async function grossToNet({
  grossSalary,
  insuranceSalary,
  dependents = 0,
  region = "I",
}) {
  const { REGION_MIN_WAGE, TAX_BRACKETS } = await loadSalaryConfig();

  // Lương đóng BH
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

  const taxableIncome = Math.max(
    0,
    taxableIncomeBeforeDeduction - totalDeduction
  );

  const incomeTax = calculatePersonalIncomeTax(
    taxableIncome,
    TAX_BRACKETS
  );

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
    regionMinWage: REGION_MIN_WAGE[region],
  };
}

// =======================
// NET → GROSS
// =======================
async function netToGross({
  netSalary,
  insuranceSalary,
  dependents = 0,
  region = "I",
}) {
  let estimatedGross = netSalary;
  let result = {};

  for (let i = 0; i < 25; i++) {
    result = await grossToNet({
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
  BASE_SALARY,
  PERSONAL_DEDUCTION,
  DEPENDENT_DEDUCTION,
};
