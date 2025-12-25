import React, { useEffect, useState } from "react";
import { api } from "../../lib/api-client";

export default function BhxhPriceIndexManagement() {
  const [priceIndexes, setPriceIndexes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hệ số
  const fetchPriceIndexes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bhxh-price-index");
      const dataObj = res.data?.data || {};
      setPriceIndexes(
        Object.entries(dataObj).map(([year, coefficient]) => ({
          year: Number(year),
          coefficient
        }))
      );
    } catch (err) {
      alert("Lỗi tải hệ số BHXH");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceIndexes();
  }, []);

  // Sửa hệ số
  const handleEdit = async (row) => {
    const newValue = prompt(
      `Nhập hệ số mới cho năm ${row.year}:`,
      row.coefficient
    );
    if (newValue === null || isNaN(newValue) || newValue === "") return;
    try {
      await api.put(`/admin/bhxh-price-index/${row.year}`, {
        coefficient: Number(newValue),
      });
      alert("Cập nhật thành công!");
      fetchPriceIndexes();
    } catch (err) {
      alert("Lỗi cập nhật hệ số!");
    }
  };

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Cài đặt hệ số trượt giá BHXH</h3>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Năm</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Hệ số</th>
                <th className="px-4 py-2 text-right text-gray-600 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : priceIndexes.length > 0 ? (
                priceIndexes.map((row) => (
                  <tr key={row.year} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{row.year}</td>
                    <td className="px-4 py-2 text-gray-800 font-medium">{row.coefficient}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:underline"
                      >
                        ✏️ Sửa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400">
                    Không có dữ liệu hệ số.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
