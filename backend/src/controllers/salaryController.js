import salaryCalculator from "../services/salaryCalculator.js";
import { salaryHistoryModel } from "../models/SalaryHistory.js";

export const calculateSalary = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { type, salary, insuranceSalary, dependents, region } = req.body;

    if (!type || !salary) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedSalary = parseFloat(salary);
    const parsedInsuranceSalary = insuranceSalary ? parseFloat(insuranceSalary) : null;
    const parsedDependents = parseInt(dependents) || 0;
    const regionCode = region || "I";

    let result;

    if (type === "grossToNet") {
      result = salaryCalculator.grossToNet({
        grossSalary: parsedSalary,
        insuranceSalary: parsedInsuranceSalary,
        dependents: parsedDependents,
        region: regionCode,
      });
    } else if (type === "netToGross") {
      result = salaryCalculator.netToGross({
        netSalary: parsedSalary,
        insuranceSalary: parsedInsuranceSalary,
        dependents: parsedDependents,
        region: regionCode,
      });
    } else {
      return res.status(400).json({ message: "Invalid type (grossToNet | netToGross)" });
    }

    // Save history
    const historyId = await salaryHistoryModel.save(
      userId,
      type,
      parsedSalary,
      parsedInsuranceSalary,
      parsedDependents,
      regionCode,
      result
    );

    return res.status(200).json({
      ...result,
      historyId,
    });

  } catch (error) {
    console.error("Salary calculation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// =========================
// GET lịch sử người dùng
// =========================
export const getSalaryHistory = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const history = await salaryHistoryModel.getByUser(userId);

    return res.status(200).json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// =========================
// DELETE 1 lịch sử theo id
// =========================
export const deleteSalaryHistory = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const historyId = req.params.id;

    const removed = await salaryHistoryModel.deleteOne(userId, historyId);

    if (!removed) {
      return res.status(404).json({ message: "History not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// =========================
// DELETE toàn bộ lịch sử
// =========================
export const deleteAllSalaryHistory = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    const count = await salaryHistoryModel.deleteAll(userId);

    return res.status(200).json({
      message: `Deleted ${count} history records`,
    });
  } catch (error) {
    console.error("Delete all history error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
