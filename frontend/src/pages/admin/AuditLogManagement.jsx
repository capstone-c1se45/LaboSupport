import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api-client";

// Helper định dạng ngày giờ
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString('vi-VN');
};

export default function AuditLogManagement() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm fetch dữ liệu
  const fetchLogs = useCallback(async (page, search) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${page}&limit=${pagination.limit}&search=${search}`);
      if (res.data && res.data.data) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setItems([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
      }
    } catch (error) {
      console.error("Lỗi tải logs:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs(1, searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchLogs]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    fetchLogs(newPage, searchTerm);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Nhật ký Hoạt động</h2>
        <p className="mt-1 text-sm text-gray-600">Theo dõi toàn bộ thao tác của người dùng trong hệ thống.</p>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input
                type="text"
                className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm theo username, hành động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Người dùng</th>
                <th className="px-6 py-3">Hành động</th>
                <th className="px-6 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Đang tải...</td></tr>
              ) : items.length > 0 ? (
                items.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{log.full_name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">@{log.username}</div>
                    </td>
                    <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${log.action.includes('DELETE') ? 'bg-red-100 text-red-800' : 
                              log.action.includes('UPDATE') ? 'bg-yellow-100 text-yellow-800' : 
                              log.action.includes('LOGIN') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 max-w-md truncate" title={log.details}>
                        {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Không có dữ liệu nhật ký.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">Tổng cộng: {pagination.total} dòng</div>
                <div className="flex gap-2">
                    <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)} className="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm">Trước</button>
                    <span className="px-3 py-1 text-sm font-medium flex items-center">{pagination.page} / {pagination.totalPages}</span>
                    <button disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)} className="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-sm">Sau</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}