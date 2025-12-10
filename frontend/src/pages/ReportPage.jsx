import React, { useState, useEffect } from "react";
import { reportService } from "../services/reportService";
import { createSocketConnection } from "../lib/socket";

export default function ReportPage() {
  const [category, setCategory] = useState("Nội dung & AI");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng báo cáo mỗi trang

  useEffect(() => {
    fetchMyReports();
    const socket = createSocketConnection();
    socket.on('REPORT_STATUS_UPDATED', (data) => {
      setMyReports(prevReports => 
        prevReports.map(report => 
          report.report_id === data.report_id 
          ? { ...report, status: data.status, admin_response: data.admin_response } 
          : report
        )
      );
    });
    return () => socket.disconnect();
  }, []);

  const fetchMyReports = async () => {
    try {
      const res = await reportService.getMyReports();
      // Sắp xếp báo cáo mới nhất lên đầu
      const sortedReports = (res.data || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setMyReports(sortedReports);
    } catch (error) {
      console.error("Lỗi tải lịch sử báo cáo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportService.createReport({ category, description });
      alert("Gửi báo cáo thành công!");
      setDescription("");
      fetchMyReports(); 
      setCurrentPage(1); // Reset về trang 1 sau khi gửi mới
    } catch (error) {
      alert("Lỗi khi gửi báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'PROCESSED': return 'bg-green-100 text-green-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = myReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(myReports.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      
      {/* FORM GỬI BÁO CÁO (Giữ nguyên) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Gửi Báo Cáo / Góp Ý</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại báo cáo</label>
                <select 
                    className="w-full border rounded px-3 py-2 bg-white"
                    value={category} onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Nội dung & AI">Nội dung & AI</option>
                    <option value="Kỹ thuật">Lỗi kỹ thuật</option>
                    <option value="Góp ý">Góp ý</option>
                </select>
            </div>
            <div>
                <textarea 
                    className="w-full border rounded px-3 py-2 h-24 focus:outline-blue-500" 
                    placeholder="Mô tả chi tiết..." 
                    value={description} onChange={(e) => setDescription(e.target.value)} 
                    required 
                />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-50">
                {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
            </button>
        </form>
      </div>

      {/* DANH SÁCH LỊCH SỬ (Có phân trang) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-bold text-gray-800">Lịch sử báo cáo</h3>
            <span className="text-sm text-gray-500">Tổng: {myReports.length}</span>
        </div>
        
        {myReports.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Bạn chưa gửi báo cáo nào.</p>
        ) : (
            <>
                <div className="space-y-4 min-h-[300px]">
                    {currentReports.map((item) => (
                        <div key={item.report_id} className="border rounded-lg p-4 hover:bg-gray-50 transition shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-semibold text-blue-600 text-sm">#{item.report_id.substring(0,8)}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="font-medium text-gray-700">{item.category}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                                    {item.status === 'PENDING' ? 'Đang chờ' : item.status === 'PROCESSED' ? 'Đã xử lý' : item.status}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-2 rounded border border-gray-100">{item.description}</p>
                            
                            {item.admin_response && (
                                <div className="mt-3 pl-3 border-l-4 border-green-500 bg-green-50 p-2 rounded text-sm">
                                    <p className="font-bold text-green-700 text-xs mb-1">Phản hồi từ Admin:</p>
                                    <p className="text-gray-800">{item.admin_response}</p>
                                </div>
                            )}
                            
                            <div className="text-right text-xs text-gray-400 mt-2">
                                {new Date(item.created_at).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Trước
                        </button>
                        
                        {/* Hiển thị số trang */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded text-sm font-medium transition ${
                                    currentPage === page 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white border hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

    </div>
  );
}