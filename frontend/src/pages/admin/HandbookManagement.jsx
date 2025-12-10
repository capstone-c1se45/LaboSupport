import React, { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { adminService } from "../../services/adminService";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const REGION_SALARY = [
  { region: 'Vùng I', salary: '4.680.000 ₫', effective: '01/07/2023' },
  { region: 'Vùng II', salary: '4.160.000 ₫', effective: '01/07/2023' },
  { region: 'Vùng III', salary: '3.640.000 ₫', effective: '01/07/2023' },
  { region: 'Vùng IV', salary: '3.250.000 ₫', effective: '01/07/2023' },
];

const TAX_TABLE = [
  { level: 1, income: '0 ₫ - 5.000.000 ₫', rate: '5%' },
  { level: 2, income: '5.000.000 ₫ - 10.000.000 ₫', rate: '10%' },
  { level: 3, income: '10.000.000 ₫ - 18.000.000 ₫', rate: '15%' },
  { level: 4, income: '18.000.000 ₫ - 32.000.000 ₫', rate: '20%' },
  { level: 5, income: '32.000.000 ₫ - 52.000.000 ₫', rate: '25%' },
  { level: 6, income: '52.000.000 ₫ - 80.000.000 ₫', rate: '30%' },
  { level: 7, income: 'Trên 80.000.000 ₫', rate: '35%' },
];

export default function HandbookManagement() {
  const [tab, setTab] = useState('law'); 

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  // State tìm kiếm & file
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Thêm mới, object = Sửa
  const [formData, setFormData] = useState({ article_title: "", chapter: "", content: "" });

  const loadData = async (page = 1, search = searchTerm) => {
    if (tab !== 'law') return;

    setLoading(true);
    try {
      // Gọi API Backend: /admin/handbooks?page=1&limit=10&search=...
      const res = await api.get(`/admin/handbooks?page=${page}&limit=${pagination.limit}&search=${search}`);
      
      if (res.data && res.data.data) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // alert("Lỗi tải dữ liệu. Vui lòng kiểm tra console.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu & khi page/limit/tab thay đổi
  useEffect(() => {
    loadData(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, tab]);

  // Handler: Thay đổi page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handler: Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset về trang 1 và tải lại
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(1, searchTerm);
  };

  // Handler: Xóa 1 điều khoản
  const handleDelete = async (sectionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa điều khoản này?")) return;

    try {
      // Backend cũ dùng section_id để DELETE
      await api.delete(`/admin/handbooks/${sectionId}`); 
      alert("Xóa thành công!");
      loadData(pagination.page, searchTerm); // Tải lại để update list
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Có lỗi xảy ra khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  // Handler: Xóa toàn bộ
  const handleDeleteAll = async () => {
    const confirmMsg = "CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dữ liệu luật trong hệ thống và không thể khôi phục.\n\nBạn có chắc chắn muốn tiếp tục không?";
    if (!window.confirm(confirmMsg)) return;

    // Hỏi lại lần 2 cho chắc chắn (UX an toàn cho tính năng nguy hiểm)
    if (!window.confirm("Xác nhận lần cuối: Bạn thực sự muốn xóa sạch dữ liệu?")) return;

    try {
        setLoading(true);
        await adminService.deleteAllHandbooks(); 
        alert("Đã xóa toàn bộ dữ liệu luật.");
        loadData(1, searchTerm); // Tải lại danh sách (trống)
    } catch (error) {
        console.error(error);
        alert("Lỗi khi xóa dữ liệu: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
        setLoading(false);
    }
  };

  // Handler: Upload File Docx
  const handleFileUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn file .docx để upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
        // Endpoint cho upload file docx
        const res = await api.post("/admin/handbooks/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        alert(`Upload thành công! Đã thêm ${res.data?.count || 0} điều khoản.`);
        setFile(null);
        loadData(1);
    } catch (error) {
        console.error("Lỗi Upload:", error);
        alert("Lỗi khi upload file: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
        setUploading(false);
    }
  };


  // Handler: Mở Modal
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ article_title: item.article_title, chapter: item.chapter, content: item.content });
    } else {
      setFormData({ article_title: "", chapter: "", content: "" });
    }
    setIsModalOpen(true);
  };
  
  // Handler: Thay đổi form data
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler: Submit Modal (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.article_title || !formData.content) {
        alert("Vui lòng nhập đầy đủ Tiêu đề Điều và Nội dung.");
        return;
    }
    
    setLoading(true);
    try {
      if (editingItem) {
        // Cập nhật (PUT)
        await api.put(`/admin/handbooks/${editingItem.section_id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        // Thêm mới (POST)
        await api.post("/admin/handbooks", {
            ...formData,
            law_name: "Bộ Luật Lao động 2019", // Giả định
            category: "luat lao dong",
            law_reference: "manual_add"
        });
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      loadData(pagination.page, searchTerm);
    } catch (error) {
      alert("Lỗi lưu: " + (error.response?.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">
          Cài đặt Lao động
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý các cài đặt toàn hệ thống bao gồm luật lao động và thông tin
          lương theo khu vực.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200 text-sm">
        <button
          type="button"
          onClick={() => setTab('law')}
          className={`px-4 py-1.5 rounded-full transition ${
            tab === 'law'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Quản lý Luật
        </button>
        <button
          type="button"
          onClick={() => setTab('salary')}
          className={`px-4 py-1.5 rounded-full transition ${
            tab === 'salary'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Cài đặt lương
        </button>
      </div>

      {tab === 'law' && (
        <section className="space-y-4">
          
          {/* File Upload, Search, Add/Delete Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            
            {/* File Upload */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              <button
                onClick={handleFileUpload}
                disabled={!file || uploading}
                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {uploading ? "Đang xử lý..." : "⬆️ Upload (.docx)"}
              </button>
            </div>

            {/* Search and Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto items-center">
                <form onSubmit={handleSearch} className="flex gap-2 items-center">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
                            placeholder="Tìm kiếm điều khoản..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 whitespace-nowrap">
                        Tìm
                    </button>
                </form>
                
                <button
                    type="button"
                    onClick={() => openModal(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 whitespace-nowrap"
                >
                    <span className="text-base leading-none">＋</span>
                    <span>Thêm Luật</span>
                </button>
                <button
                    type="button"
                    onClick={handleDeleteAll}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 whitespace-nowrap"
                >
                    <span>🗑 Xóa tất cả</span>
                </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading && items.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <>
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                        <LawCard 
                            key={item.section_id || idx} 
                            item={item} 
                            onDelete={() => handleDelete(item.section_id)} 
                            onEdit={() => openModal(item)}
                        />
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-500 text-center">
                        Không tìm thấy điều khoản phù hợp trong Database.
                        </div>
                    )}
                </>
            )}
          </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 items-center">
                <span className="text-sm text-gray-600">
                    Tổng cộng: {pagination.total} điều khoản
                </span>
                <button 
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    &lt; Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                    Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button 
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Sau &gt;
                </button>
            </div>
          )}
        </section>
      )}

      {tab === 'salary' && (
        <section className="space-y-6">
          {/* Region salary table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Mức lương tối thiểu vùng (Static Data)
            </h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Vùng
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Mức lương
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Ngày có hiệu lực
                    </th>
                    <th className="px-4 py-2 text-right text-gray-600 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_SALARY.map((row, idx) => (
                    <tr
                      key={row.region}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-gray-800">
                        {row.region}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {row.salary}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {row.effective}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✏️ Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Biểu thuế thu nhập cá nhân (TNCN)
            </h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Bậc
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Thu nhập tính thuế / tháng (VND)
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">
                      Thuế suất (%)
                    </th>
                    <th className="px-4 py-2 text-right text-gray-600 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_TABLE.map((row) => (
                    <tr
                      key={row.level}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-gray-800">
                        {row.level}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {row.income}
                      </td>
                      <td className="px-4 py-2 text-gray-800">{row.rate}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✏️ Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Modal Add/Edit */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {editingItem ? "Chỉnh sửa Điều khoản" : "Thêm Điều khoản mới"}
                  </Dialog.Title>
                  <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="article_title" className="block text-sm font-medium text-gray-700">Tiêu đề Điều khoản (VD: Điều 1)</label>
                      <input
                        type="text"
                        name="article_title"
                        id="article_title"
                        value={formData.article_title}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="chapter" className="block text-sm font-medium text-gray-700">Chương (Tùy chọn)</label>
                      <input
                        type="text"
                        name="chapter"
                        id="chapter"
                        value={formData.chapter}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung</label>
                      <textarea
                        name="content"
                        id="content"
                        rows="6"
                        value={formData.content}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        required
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={() => setIsModalOpen(false)}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        disabled={loading}
                      >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
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

// Component LawCard đã được cập nhật để hiển thị dữ liệu từ logic cũ
function LawCard({ item, onDelete, onEdit }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
            {item.article_title || 'N/A'}
          </span>
          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
            Chương: {item.chapter || '?'}
          </span>
          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            ID: {item.section_id || 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={onEdit}
          >
            ✏️ Sửa
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={onDelete}
          >
            🗑 Xoá
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-800">
        <div className="font-semibold">{item.article_title}</div>
        {/* Chỉ hiển thị một đoạn ngắn, giữ nguyên giao diện */}
        <div className="text-gray-600">{item.content ? item.content.substring(0, 200) + '...' : 'Không có nội dung.'}</div>
      </div>
    </div>
  );
}