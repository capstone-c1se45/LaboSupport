import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { createSocketConnection } from "../../lib/socket";

export default function ReportManagement() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho bộ lọc & phân trang
    const [filter, setFilter] = useState("ALL"); 
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; // Số lượng mỗi trang

    useEffect(() => {
        fetchReports();
    }, [page, filter]); // Gọi lại khi đổi trang hoặc đổi bộ lọc

    // Socket: Giữ nguyên logic real-time
    useEffect(() => {
        const socket = createSocketConnection();
        socket.on('report:new', (newReport) => {
            const audio = new Audio('/notification.mp3'); 
            audio.play().catch(() => {}); 
            alert(`🔔 Có báo cáo mới: ${newReport.category}`);
            
            // Nếu đang ở trang 1 và đúng bộ lọc (hoặc ALL) thì mới thêm vào đầu
            if (page === 1 && (filter === 'ALL' || filter === 'NEW')) {
                setReports((prev) => [newReport, ...prev]);
            } else {
                // Nếu ở trang khác, chỉ cần refresh lại để cập nhật số lượng
                 fetchReports();
            }
        });
        return () => {
            socket.off('report:new');
            socket.disconnect();
        };
    }, [page, filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Gọi API với tham số phân trang
            const res = await adminService.getAllReports(page, LIMIT, filter);
            setReports(res.data);
            setTotalPages(res.pagination.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1); // Reset về trang 1 khi đổi bộ lọc
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminService.updateReportStatus(id, newStatus);
            // Cập nhật giao diện ngay lập tức
            setReports(prev => prev.map(r => r.report_id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Lỗi cập nhật trạng thái");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Xóa báo cáo này?")) return;
        try {
            await adminService.deleteReport(id);
            setReports(prev => prev.filter(r => r.report_id !== id));
        } catch (error) {
            alert("Lỗi khi xóa");
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'NEW': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">MỚI</span>;
            case 'RESOLVED': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">ĐÃ XỬ LÝ</span>;
            case 'IGNORED': return <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold">BỎ QUA</span>;
            default: return status;
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 className="text-2xl font-bold mb-4">Quản lý Báo cáo & Góp ý</h2>
            
            {/* Bộ lọc */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => handleFilterChange("ALL")} className={`px-3 py-1 rounded ${filter==="ALL" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Tất cả</button>
                <button onClick={() => handleFilterChange("NEW")} className={`px-3 py-1 rounded ${filter==="NEW" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}>Mới</button>
                <button onClick={() => handleFilterChange("RESOLVED")} className={`px-3 py-1 rounded ${filter==="RESOLVED" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Đã xử lý</button>
            </div>

            {/* Bảng dữ liệu */}
            <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left border-b">Loại</th>
                        <th className="p-3 text-left border-b">Người gửi</th>
                        <th className="p-3 text-left border-b w-1/3">Nội dung</th>
                        <th className="p-3 text-left border-b">Ngày gửi</th>
                        <th className="p-3 text-left border-b">Trạng thái</th>
                        <th className="p-3 text-left border-b">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan="6" className="p-4 text-center">Đang tải...</td></tr>}
                    {!loading && reports.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">Không có dữ liệu</td></tr>}
                    
                    {reports.map((item) => (
                        <tr key={item.report_id} className="hover:bg-gray-50 border-b">
                            <td className="p-3 text-sm font-semibold text-blue-800">{item.category}</td>
                            <td className="p-3 text-sm">
                                {item.username ? (
                                    <div>
                                        <div className="font-medium">{item.full_name || item.username}</div>
                                        <div className="text-xs text-gray-500">{item.email}</div>
                                    </div>
                                ) : <span className="text-gray-400 italic">Ẩn danh</span>}
                            </td>
                            <td className="p-3 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</td>
                            <td className="p-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                            <td className="p-3">{getStatusBadge(item.status)}</td>
                            <td className="p-3 flex flex-col gap-1">
                                {item.status === 'NEW' && (
                                    <button onClick={() => handleStatusChange(item.report_id, 'RESOLVED')} className="text-green-600 hover:underline text-sm font-medium text-left">
                                        ✔ Xử lý
                                    </button>
                                )}
                                {item.status !== 'IGNORED' && (
                                    <button onClick={() => handleStatusChange(item.report_id, 'IGNORED')} className="text-gray-500 hover:underline text-sm text-left">
                                        🚫 Bỏ qua
                                    </button>
                                )}
                                <button onClick={() => handleDelete(item.report_id)} className="text-red-500 hover:underline text-sm text-left">
                                    🗑 Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🔥 THANH PHÂN TRANG */}
            <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">
                    Trang <b>{page}</b> / <b>{totalPages}</b>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <button 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === totalPages || totalPages === 0}
                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}