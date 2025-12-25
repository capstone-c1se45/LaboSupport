export const createHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { inputData, resultData } = req.body;
    const historyId = await BhxhTuNguyenHistoryModel.createHistory(userId, inputData, resultData);
    res.json({ success: true, history_id: historyId });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
import { tinhBHXHTuNguyen } from "../services/bhxhTuNguyenService.js";
import BhxhTuNguyenHistoryModel from "../models/bhxhTuNguyenHistory.model.js";

export const tinhBHXHTuNguyenController = async (req, res) => {
  try {
    const { giaiDoans } = req.body;
    const userId = req.user.user_id;

    const result = tinhBHXHTuNguyen(giaiDoans);

    // Lưu lịch sử
    const historyId = await BhxhTuNguyenHistoryModel.createHistory(userId, giaiDoans, result);

    res.json({
      success: true,
      data: result,
      history_id: historyId
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getHistoryList = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const list = await BhxhTuNguyenHistoryModel.getHistoryList(userId);
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getHistoryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const data = await BhxhTuNguyenHistoryModel.getHistoryDetail(id, userId);
    if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy lịch sử" });

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await BhxhTuNguyenHistoryModel.deleteHistory(id, userId);
    res.json({ success: true, message: "Đã xoá lịch sử" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const deleteAllHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    await BhxhTuNguyenHistoryModel.deleteAllHistory(userId);
    res.json({ success: true, message: "Đã xoá toàn bộ lịch sử" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
