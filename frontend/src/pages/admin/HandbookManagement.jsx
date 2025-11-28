import React, { useEffect, useState } from "react";
import { api } from "../../lib/api-client"; 
import { Dialog } from "@headlessui/react"; 

export default function HandbookManagement() {
  // State quản lý dữ liệu và phân trang
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  
  // State tìm kiếm & file
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);

  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Thêm mới, object = Sửa
  const [formData, setFormData] = useState({ article_title: "", chapter: "", content: "" });

  // 1. Hàm tải dữ liệu (Gọi API)
  const loadData = async (page = 1, search = "") => {
    setLoading(true);
    try {
      // Gọi API Backend: /admin/handbooks?page=1&limit=10&search=...
      const res = await api.get(`/admin/handbooks?page=${page}&limit=10&search=${search}`);
      
      if (res.data && res.data.data) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    loadData(1, "");
  }, []);

  // 2. Xử lý Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    loadData(1, searchTerm); // Reset về trang 1 khi tìm kiếm
  };

  // 3. Xử lý Upload File
  const handleFileUpload = async () => {
    if (!file) return alert("Vui lòng chọn file .docx");
    const data = new FormData();
    data.append("file", file);
    try {
      setLoading(true);
      await api.post("/admin/handbooks/import-docx", data);
      alert("Import thành công!");
      setFile(null);
      loadData(1, searchTerm);
    } catch (error) {
      alert("Lỗi import: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa điều luật này?")) return;
    try {
      await api.delete(`/admin/handbooks/${id}`);
      alert("Đã xóa!");
      loadData(pagination.page, searchTerm);
    } catch (error) {
      alert("Lỗi xóa: " + error.message);
    }
  };

  // 5. Xử lý Lưu (Thêm/Sửa)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Cập nhật
        await api.put(`/admin/handbooks/${editingItem.section_id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        // Thêm mới
        await api.post("/admin/handbooks", {
            ...formData,
            law_name: "Bộ Luật Lao động 2019",
            category: "luat lao dong",
            law_reference: "manual_add"
        });
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      loadData(pagination.page, searchTerm);
    } catch (error) {
      alert("Lỗi lưu: " + error.message);
    }
  };

  // Mở Modal
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ article_title: item.article_title, chapter: item.chapter, content: item.content });
    } else {
      setFormData({ article_title: "", chapter: "", content: "" });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Luật Lao động</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
           <input 
              type="file" accept=".docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
              onClick={handleFileUpload}
              disabled={!file || loading}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              Upload
            </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Tìm theo điều, nội dung..." 
                    className="border rounded px-3 py-2 text-sm w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    Tìm
                </button>
            </form>
            <button 
                onClick={() => openModal(null)}
                className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 whitespace-nowrap"
            >
                + Thêm Luật
            </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3 border-b">STT</th>
              <th className="p-3 border-b w-1/4">Tiêu đề Điều</th>
              <th className="p-3 border-b">Chương</th>
              <th className="p-3 border-b w-1/3">Nội dung (Trích)</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Đang tải dữ liệu...</td></tr>
            ) : items.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Không tìm thấy dữ liệu</td></tr>
            ) : (
                items.map((item, index) => (
                <tr key={item.section_id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm">{index + 1 + (pagination.page - 1) * pagination.limit}</td>
                    <td className="p-3 font-medium text-blue-900">{item.article_title}</td>
                    <td className="p-3 text-sm text-gray-600">{item.chapter}</td>
                    <td className="p-3 text-sm text-gray-500 truncate max-w-xs" title={item.content}>
                    {item.content ? item.content.substring(0, 80) + "..." : ""}
                    </td>
                    <td className="p-3 text-center">
                        <button 
                            onClick={() => openModal(item)}
                            className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-semibold"
                        >
                            Sửa
                        </button>
                        <button 
                            onClick={() => handleDelete(item.section_id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                            Xóa
                        </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
            <button 
                disabled={pagination.page <= 1}
                onClick={() => loadData(pagination.page - 1, searchTerm)}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            >
                Trước
            </button>
            <span className="text-sm font-medium">
                Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                     // Log kiểm tra xem sự kiện click có nhận không
                     console.log("Next page click:", pagination.page + 1);
                     loadData(pagination.page + 1, searchTerm);
                }}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            >
                Sau
            </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl">
                <h3 className="text-xl font-bold mb-4">{editingItem ? "Cập nhật Luật" : "Thêm Luật Mới"}</h3>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Chương</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded"
                            value={formData.chapter}
                            onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề Điều</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded"
                            value={formData.article_title}
                            onChange={(e) => setFormData({...formData, article_title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nội dung</label>
                        <textarea 
                            rows="6"
                            className="w-full border p-2 rounded"
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}