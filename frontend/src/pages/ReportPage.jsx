import React, { useState } from "react";
import { reportService } from "../services/reportService";

export default function ReportPage() {
  const [category, setCategory] = useState("Nội dung & AI");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return alert("Vui lòng nhập nội dung!");

    setLoading(true);
    try {
      await reportService.createReport({ category, description });
      alert("Gửi báo cáo thành công! Cảm ơn đóng góp của bạn.");
      setDescription("");
      setCategory("Nội dung & AI");
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Gửi Báo Cáo / Góp Ý</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Loại báo cáo</label>
          <select 
            className="w-full border rounded px-3 py-2 focus:outline-blue-500 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Nội dung & AI">Báo cáo về Nội dung & AI (Sai lệch, lỗi thời)</option>
            <option value="Kỹ thuật">Báo cáo Lỗi kỹ thuật (Web chậm, lỗi file)</option>
            <option value="Góp ý">Góp ý cải thiện (Feedback)</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Chi tiết</label>
          <textarea
            className="w-full border rounded px-3 py-2 h-32 focus:outline-blue-500"
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải hoặc ý kiến đóng góp..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
        </button>
      </form>
    </div>
  );
}