import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { createSocketConnection } from "../../lib/socket";

export default function ReportManagement() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL"); // ALL, NEW, RESOLVED

    useEffect(() => {
        fetchReports();
    }, []);


    useEffect(() => {
        const socket = createSocketConnection();


        // Lắng nghe sự kiện có báo cáo mới
        socket.on('report:new', (newReport) => {
            // Phát âm thanh thông báo 
            const audio = new Audio('../../assets/sound/notification-admin.mp3'); 
            audio.play().catch(() => {}); 
            console.log("Báo cáo mới nhận được via socket:", newReport);

            alert(`🔔 Có báo cáo mới: ${newReport.category}`);

            // Cập nhật State: Thêm cái mới lên đầu danh sách
            setReports((prevReports) => [newReport, ...prevReports]);
        });

        // Cleanup khi rời trang
        return () => {
            socket.off('report:new');
            socket.disconnect();
        };
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllReports();
            setReports(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminService.updateReportStatus(id, newStatus);
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

    const filteredReports = filter === "ALL" ? reports : reports.filter(r => r.status === filter);

    // Helper format màu sắc trạng thái
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
            <h2 className="text-2xl font-bold mb-4">Quản lý Báo cáo vi phạm & Góp ý</h2>
            
            <div className="flex gap-2 mb-4">
                <button onClick={() => setFilter("ALL")} className={`px-3 py-1 rounded ${filter==="ALL" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Tất cả</button>
                <button onClick={() => setFilter("NEW")} className={`px-3 py-1 rounded ${filter==="NEW" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}>Mới</button>
                <button onClick={() => setFilter("RESOLVED")} className={`px-3 py-1 rounded ${filter==="RESOLVED" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Đã xử lý</button>
            </div>

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
                    {!loading && filteredReports.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">Không có dữ liệu</td></tr>}
                    
                    {filteredReports.map((item) => (
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
                            <td className="p-3">
                                {item.status === 'NEW' && (
                                    <button onClick={() => handleStatusChange(item.report_id, 'RESOLVED')} className="mr-2 text-green-600 hover:underline text-sm font-medium">
                                        Xử lý
                                    </button>
                                )}
                                {item.status !== 'IGNORED' && (
                                    <button onClick={() => handleStatusChange(item.report_id, 'IGNORED')} className="mr-2 text-gray-500 hover:underline text-sm">
                                        Bỏ qua
                                    </button>
                                )}
                                <button onClick={() => handleDelete(item.report_id)} className="text-red-500 hover:underline text-sm">
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};