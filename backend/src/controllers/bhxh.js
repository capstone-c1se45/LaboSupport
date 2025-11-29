import { tinhBHXH1Lan } from "../services/bhxhService.js";
import HistoryModel from "../models/bhxhHistory.model.js";

export const tinhBHXHController = async (req, res) => {
  try {
    const { giaiDoans } = req.body;
    const userId = req.user.user_id;

    const result = tinhBHXH1Lan(giaiDoans);

    // Lưu DB bằng model
    const historyId = await HistoryModel.createHistory(userId, giaiDoans, result);

    res.json({
      success: true,
      data: result,
      history_id: historyId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistoryList = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const list = await HistoryModel.getHistoryList(userId);

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistoryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const data = await HistoryModel.getHistoryDetail(id, userId);
    if (!data)
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch sử" });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await HistoryModel.deleteHistory(id, userId);

    res.json({ success: true, message: "Đã xoá lịch sử" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    await HistoryModel.deleteAllHistory(userId);

    res.json({ success: true, message: "Đã xoá toàn bộ lịch sử" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
