// controllers/salaryController.js
import salaryCalculator from "../services/salaryCalculator.js";
import { salaryHistoryModel } from "../models/SalaryHistory.js";
import responseHandler from "../utils/response.js";
import { validator } from "../utils/validator.js";

export const calculateSalary = async (req, res) => {
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

    // Lưu lịch sử qua model
    const historyId = await salaryHistoryModel.save(type, parsedSalary, parsedDependents, regionCode, result);

    return res.status(200).json({
      ...result,
      info: {
        baseSalary: salaryCalculator.BASE_SALARY,
        personalDeduction: salaryCalculator.PERSONAL_DEDUCTION,
        dependentDeduction: salaryCalculator.DEPENDENT_DEDUCTION,
        regionMinWage: salaryCalculator.REGION_MIN_WAGE[regionCode],
      },
      historyId,
    });
  } catch (error) {
    console.error("Salary calculation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await salaryHistoryModel.getAll();
    return responseHandler.success(res, "History fetched successfully", history);
  } catch (err) {
    console.error("Error fetching history:", err);
    return responseHandler.internalServerError(res, "Internal server error");
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !validator.isNumeric(id) || parseInt(id) <= 0) {
      return responseHandler.badRequest(res, "Invalid or missing ID (must be a positive number)");
    }

    const isDeleted = await salaryHistoryModel.deleteById(parseInt(id));

    if (!isDeleted) {
      return responseHandler.notFound(res, "History record not found");
    }

    return responseHandler.success(res, "History record deleted successfully");
  } catch (err) {
    console.error("Error deleting history:", err);
    return responseHandler.internalServerError(res, "Internal server error");
  }
};