// src/pages/admin/HandbookManagement.jsx
import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";

export default function HandbookManagement() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = mode thêm mới, object = mode sửa
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    law_name: "",
    chapter: "",
    article_title: "",
    content: "",
    law_reference: "",
    category: "luat lao dong"
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(query = "") {
    try {
      const data = await adminService.getHandbooks(query);
      setItems(data);
    } catch (error) {
      alert("Lỗi tải dữ liệu handbook");
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    loadData(search);
  }

  function handleEdit(item) {
    setEditing(item);
    setFormData({
      law_name: item.law_name,
      chapter: item.chapter,
      article_title: item.article_title,
      content: item.content,
      law_reference: item.law_reference || "",
      category: item.category || "luat lao dong"
    });
    setShowForm(true);
  }

  function handleCreate() {
    setEditing(null);
    setFormData({ law_name: "", chapter: "", article_title: "", content: "", law_reference: "", category: "luat lao dong" });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await adminService.updateHandbook(editing.section_id, formData);
        alert("Cập nhật thành công!");
      } else {
        await adminService.createHandbook(formData);
        alert("Thêm mới thành công!");
      }
      setShowForm(false);
      loadData(search);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng kiểm tra lại console.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa mục này?")) return;
    try {
      await adminService.deleteHandbook(id);
      setItems(prev => prev.filter(i => i.section_id !== id));
    } catch (error) {
      alert("Lỗi khi xóa.");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Cẩm nang Pháp luật</h2>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm mục mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Tìm theo tên luật, điều khoản..." 
          className="border p-2 rounded w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={handleSearch} className="bg-gray-200 px-4 py-2 rounded">Tìm</button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Tên Luật</th>
              <th className="p-3 border-b">Điều khoản</th>
              <th className="p-3 border-b w-1/3">Nội dung (trích)</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.section_id} className="hover:bg-gray-50">
                <td className="p-3 border-b text-sm font-medium">{item.law_name}</td>
                <td className="p-3 border-b text-sm text-gray-600">{item.article_title}</td>
                <td className="p-3 border-b text-sm text-gray-500 truncate max-w-xs">
                  {item.content?.substring(0, 100)}...
                </td>
                <td className="p-3 border-b text-center space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(item.section_id)} className="text-red-600 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">Không tìm thấy dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">{editing ? "Chỉnh sửa" : "Thêm mới"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên luật</label>
                  <input required className="w-full border p-2 rounded" value={formData.law_name} onChange={e => setFormData({...formData, law_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chương</label>
                  <input className="w-full border p-2 rounded" value={formData.chapter} onChange={e => setFormData({...formData, chapter: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề điều khoản (Article Title)</label>
                <input required className="w-full border p-2 rounded" value={formData.article_title} onChange={e => setFormData({...formData, article_title: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nội dung chi tiết</label>
                <textarea required rows={6} className="w-full border p-2 rounded" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tham chiếu luật (Law Reference)</label>
                  <input className="w-full border p-2 rounded" value={formData.law_reference} onChange={e => setFormData({...formData, law_reference: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <input className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}