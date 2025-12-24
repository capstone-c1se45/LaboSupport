import React, { useEffect, useState, useCallback, Fragment } from "react";
import { api } from "../../lib/api-client";
import { adminService } from "../../services/adminService";
import { Dialog, Transition } from "@headlessui/react";

// Helper định dạng ngày
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString('vi-VN');
};

export default function HandbookManagement() {
  const [tab, setTab] = useState('law');

  // --- STATE QUẢN LÝ LUẬT ---
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State xử lý form & upload
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    law_code: "", law_summary: "", law_effective_date: "",
    article_title: "", chapter: "", content: "",
    file: null
  });

  // --- STATE RIÊNG CHO LƯƠNG & THUẾ ---
  const [regionWages, setRegionWages] = useState([]);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);

  // --- 1. HÀM FETCH DỮ LIỆU DUY NHẤT ---
  const fetchHandbooks = useCallback(async (page, search) => {
    if (tab !== 'law') return;
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/handbooks?page=${page}&limit=${pagination.limit}&search=${search}`
      );
      if (res.data && res.data.data) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setItems([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, tab]);

  // --- 2. EFFECT: DEBOUNCE SEARCH & TAB CHANGE ---
  useEffect(() => {
    if (tab !== 'law') return;
    const delayDebounceFn = setTimeout(() => {
      fetchHandbooks(1, searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, tab, fetchHandbooks]);

  // --- 3. EFFECT: PAGINATION ---
  useEffect(() => {
    if (tab !== 'law') return;
    if (pagination.page > 1) {
      fetchHandbooks(pagination.page, searchTerm);
    }
  }, [pagination.page, fetchHandbooks, tab, searchTerm]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // --- HANDLERS ACTIONS ---
  const handleDelete = async (sectionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa điều khoản này?")) return;
    try {
      await api.delete(`/admin/handbooks/${sectionId}`);
      alert("Xóa thành công!");
      fetchHandbooks(pagination.page, searchTerm);
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dữ liệu luật.\nBạn có chắc chắn không?")) return;
    if (!window.confirm("Xác nhận lần cuối?")) return;
    try {
      setLoading(true);
      await adminService.deleteAllHandbooks();
      alert("Đã xóa toàn bộ dữ liệu luật.");
      fetchHandbooks(1, "");
      setSearchTerm("");
    } catch (error) {
      alert("Lỗi khi xóa dữ liệu: " + (error.response?.data?.message || "Lỗi server"));
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        law_code: item.law_code || "",
        law_summary: item.law_summary || "",
        law_effective_date: item.effective_date ? item.effective_date.split('T')[0] : "",
        article_title: item.article_title || "",
        chapter: item.chapter || "",
        content: item.content || "",
        file: null
      });
    } else {
      setFormData({
        law_code: "", law_summary: "", law_effective_date: "",
        article_title: "", chapter: "", content: "",
        file: null
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const value = e.target.type === 'file' ? e.target.files[0] : e.target.value;
    const name = e.target.name;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.law_code || !formData.law_effective_date || !formData.law_summary) {
      alert("Vui lòng nhập đầy đủ thông tin Văn bản luật (*)");
      return;
    }
    setUploading(true);
    try {
      if (editingItem) {
        if (!formData.article_title || !formData.content) {
          alert("Vui lòng nhập Tiêu đề và Nội dung điều khoản.");
          setUploading(false); return;
        }
        await api.put(`/admin/handbooks/${editingItem.section_id}`, {
          article_title: formData.article_title,
          chapter: formData.chapter,
          content: formData.content,
        });
        alert("Cập nhật thành công!");
      } else {
        if (!formData.file) {
          alert("Vui lòng chọn file .docx để tải lên.");
          setUploading(false); return;
        }
        const submitData = new FormData();
        submitData.append("law_code", formData.law_code);
        submitData.append("law_summary", formData.law_summary);
        submitData.append("law_effective_date", formData.law_effective_date);
        submitData.append("file", formData.file);

        const res = await api.post("/admin/handbooks/import-docx", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(res.data.message || "Import thành công!");
      }
      setIsModalOpen(false);
      fetchHandbooks(pagination.page, searchTerm);
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  // --- LƯƠNG & THUẾ ---
  const fetchSalaryConfig = async () => {
    if (tab !== 'salary') return;
    setSalaryLoading(true);
    try {
      const [wages, taxes] = await Promise.all([
        adminService.getRegionWages(),
        adminService.getTaxBrackets()
      ]);
      setRegionWages(wages);
      setTaxBrackets(taxes);
    } catch (error) {
      console.error("Lỗi tải cấu hình lương:", error);
    } finally {
      setSalaryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'salary') {
      fetchSalaryConfig();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleEditWage = async (row) => {
    const newWage = prompt(`Nhập mức lương mới cho Vùng ${row.region_code}:`, row.wage);
    if (newWage === null || isNaN(newWage) || newWage === "") return;
    try {
      await adminService.updateRegionWage(row.region_code, Number(newWage));
      alert("Cập nhật thành công!");
      fetchSalaryConfig();
    } catch (err) {
      alert("Lỗi cập nhật lương");
    }
  };

  const handleEditTax = async (row) => {
    const newRate = prompt(`Nhập thuế suất mới cho Bậc ${row.sort_order} (VD: 0.1 cho 10%):`, row.rate);
    if (newRate === null || isNaN(newRate)) return;
    try {
      await adminService.updateTaxBracket(row.id, { ...row, rate: Number(newRate) });
      alert("Cập nhật thành công!");
      fetchSalaryConfig();
    } catch (err) {
      alert("Lỗi cập nhật thuế");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt Lao động</h2>
        <p className="mt-1 text-sm text-gray-600">Quản lý các cài đặt toàn hệ thống bao gồm luật lao động và thông tin lương theo khu vực.</p>
      </header>

      {/* Tabs */}
      <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200 text-sm">
        <button onClick={() => setTab('law')} className={`px-4 py-1.5 rounded-full transition ${tab === 'law' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}>Quản lý Luật</button>
        <button onClick={() => setTab('salary')} className={`px-4 py-1.5 rounded-full transition ${tab === 'salary' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}>Cài đặt lương</button>
      </div>

      {/* --- TAB QUẢN LÝ LUẬT --- */}
      {tab === 'law' && (
        <section className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex-1 max-w-lg relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm theo tiêu đề, nội dung, số hiệu luật..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => openModal(null)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 whitespace-nowrap shadow-sm">
                <span className="text-lg leading-none">+</span><span>Thêm Luật (File)</span>
              </button>
              <button type="button" onClick={handleDeleteAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 whitespace-nowrap border border-red-200">
                <span>🗑 Xóa tất cả</span>
              </button>
            </div>
          </div>
          {/* List Items */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
            ) : (
              <>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={item.section_id || idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 hover:shadow-md transition duration-200">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3 border-b border-gray-100 pb-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              📄 {item.law_code || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              🕒 Hiệu lực: {formatDate(item.effective_date)}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-800 leading-snug">{item.law_summary}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" onClick={() => openModal(item)} title="Chỉnh sửa">✏️</button>
                          <button type="button" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition" onClick={() => handleDelete(item.section_id)} title="Xóa">🗑</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-700 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{item.article_title}</span>
                          {item.chapter && <span className="text-xs font-medium text-gray-500">— {item.chapter}</span>}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed line-clamp-3 pl-1 border-l-2 border-gray-200">
                          {item.content || "Nội dung đang cập nhật..."}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-sm text-gray-500 text-center flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📭</span><p>Không tìm thấy kết quả nào.</p>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 items-center">
              <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 transition">&lt; Trước</button>
              <span className="px-3 py-1.5 text-sm text-gray-600 font-medium">Trang {pagination.page} / {pagination.totalPages}</span>
              <button disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 transition">Sau &gt;</button>
            </div>
          )}
        </section>
      )}

      {/* --- TAB CÀI ĐẶT LƯƠNG --- */}
      {tab === 'salary' && (
        <section className="space-y-6">
          {salaryLoading ? (
            <div className="text-center py-10 text-gray-500">Đang tải cấu hình lương...</div>
          ) : (
            <>
              {/* Bảng Lương vùng */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Mức lương tối thiểu vùng</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Vùng</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Mức lương</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionWages.map((row) => (
                        <tr key={row.region_code} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-800">Vùng {row.region_code}</td>
                          <td className="px-4 py-2 text-gray-800 font-medium">
                            {Number(row.wage).toLocaleString()} ₫
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => handleEditWage(row)} className="text-blue-600 hover:underline">✏️ Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Bảng Thuế TNCN */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Biểu thuế TNCN</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Bậc</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Thu nhập tính thuế</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Thuế suất</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxBrackets.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">Bậc {row.sort_order}</td>
                          <td className="px-4 py-2">
                            {row.min_income.toLocaleString()} - {row.max_income ? row.max_income.toLocaleString() : "Trở lên"}
                          </td>
                          <td className="px-4 py-2 font-bold text-blue-600">{(row.rate * 100)}%</td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => handleEditTax(row)} className="text-blue-600 hover:underline">✏️ Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* --- MODAL ADD/EDIT --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !uploading && setIsModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 border-b pb-4 mb-4 flex justify-between items-center">
                    {editingItem ? "✏️ Chỉnh sửa Nội dung" : "📂 Import Văn bản Luật mới"}
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                  </Dialog.Title>
                  <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột Trái */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                        <h4 className="font-bold text-blue-800 text-sm uppercase">Thông tin Văn bản</h4>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Số hiệu văn bản <span className="text-red-500">*</span></label>
                        <input type="text" name="law_code" value={formData.law_code} onChange={handleFormChange} placeholder="VD: 45/2019/QH14" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-blue-50/50" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày hiệu lực <span className="text-red-500">*</span></label>
                        <input type="date" name="law_effective_date" value={formData.law_effective_date} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Trích yếu nội dung <span className="text-red-500">*</span></label>
                        <textarea name="law_summary" rows="4" value={formData.law_summary} onChange={handleFormChange} placeholder="Mô tả ngắn gọn..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" required />
                      </div>
                    </div>
                    {/* Cột Phải */}
                    <div className="space-y-4 md:border-l md:pl-6 border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">2</span>
                        <h4 className="font-bold text-green-800 text-sm uppercase">{editingItem ? "Chi tiết Điều khoản" : "Nội dung chi tiết (File)"}</h4>
                      </div>
                      {editingItem ? (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề Điều khoản <span className="text-red-500">*</span></label>
                            <input type="text" name="article_title" value={formData.article_title} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition" required />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Chương</label>
                            <input type="text" name="chapter" value={formData.chapter} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                            <textarea name="content" rows="5" value={formData.content} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition" required />
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col justify-center">
                          <label className="block w-full cursor-pointer group">
                            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-green-300 border-dashed rounded-xl bg-green-50 group-hover:bg-green-100 transition">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="text-4xl mb-2">📂</span>
                                <p className="mb-2 text-sm text-green-700 font-semibold">Nhấn để chọn file .docx</p>
                                <p className="text-xs text-green-600">Hệ thống sẽ tự động tách các điều khoản</p>
                              </div>
                              <input type="file" name="file" accept=".docx" className="hidden" onChange={handleFormChange} />
                            </div>
                          </label>
                          {formData.file && <div className="mt-3 p-2 bg-gray-100 rounded text-sm flex items-center gap-2 text-gray-700">📎 {formData.file.name}</div>}
                        </div>
                      )}
                    </div>
                    {/* Footer */}
                    <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
                      <button type="button" className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition" onClick={() => setIsModalOpen(false)} disabled={uploading}>Hủy bỏ</button>
                      <button type="submit" className={`px-6 py-2.5 rounded-lg border border-transparent text-sm font-bold text-white shadow-sm focus:outline-none transition flex items-center gap-2 ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`} disabled={uploading}>
                        {uploading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                        {uploading ? "Đang xử lý..." : (editingItem ? "Lưu thay đổi" : "Import Dữ liệu")}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}