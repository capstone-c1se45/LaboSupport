// controllers/salaryController.js

import salaryCalculator from "../services/salaryCalculator.js";

export const calculateSalary = (req, res) => {
  try {
    const { type, salary, dependents, region } = req.body;

    if (!type || !salary) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedSalary = parseFloat(salary);
    const parsedDependents = parseInt(dependents) || 0;
    const regionCode = region || "I";

    let result;
    if (type === "grossToNet") {
      result = salaryCalculator.grossToNet({
        grossSalary: parsedSalary,
        dependents: parsedDependents,
        region: regionCode,
      });
    } else if (type === "netToGross") {
      result = salaryCalculator.netToGross({
        netSalary: parsedSalary,
        dependents: parsedDependents,
        region: regionCode,
      });
    } else {
      return res.status(400).json({ message: "Invalid type (must be grossToNet or netToGross)" });
    }

    return res.status(200).json({
      ...result,
      info: {
        baseSalary: salaryCalculator.BASE_SALARY,
        personalDeduction: salaryCalculator.PERSONAL_DEDUCTION,
        dependentDeduction: salaryCalculator.DEPENDENT_DEDUCTION,
        regionMinWage: salaryCalculator.REGION_MIN_WAGE[regionCode],
      },
    });
  } catch (error) {
    console.error("Salary calculation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
