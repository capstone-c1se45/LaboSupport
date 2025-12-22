import { salaryConfigModel } from "../models/SalaryConfig.js";

let cache = null;

export async function loadSalaryConfig() {
  if (!cache) {
    cache = {
      REGION_MIN_WAGE: await salaryConfigModel.getRegionMinWage(),
      TAX_BRACKETS: await salaryConfigModel.getTaxBrackets(),
    };
  }
  return cache;
}

// admin sửa xong → clear cache
export function clearSalaryConfigCache() {
  cache = null;
}
