// controllers/bhxhTuNguyen.js

import { tinhBHXHTuNguyen } from "../services/bhxhTuNguyenService.js";

export const tinhBHYTTuNguyenController = (req, res) => {
  try {
    const { giaiDoans } = req.body;
    const result = tinhBHXHTuNguyen(giaiDoans);

    res.json({
      success: true,
      data: result,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
