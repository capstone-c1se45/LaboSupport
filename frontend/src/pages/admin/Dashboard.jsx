import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await adminService.getReports();
      setStats(data);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải dữ liệu thống kê...</div>;
  if (!stats) return <div>Không có dữ liệu.</div>;

  // Dữ liệu trả về từ backend bao gồm: overview, byRole, byMonth, byGender...
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Phần Tổng quan (Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Tổng người dùng" value={stats.overview?.totalUsers || 0} color="bg-blue-500" />
        <StatCard title="Người dùng mới (Tháng này)" value={stats.overview?.newUsersThisMonth || 0} color="bg-green-500" />
        <StatCard title="Đang hoạt động" value={stats.overview?.activeUsers || 0} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thống kê theo Vai trò (Role) */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Phân bố vai trò</h3>
          <ul>
            {stats.byRole?.map((item, index) => (
              <li key={index} className="flex justify-between py-2 border-b">
                <span>{item.role_id}</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Thống kê theo Nghề nghiệp (Occupation) */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Nghề nghiệp</h3>
          <ul>
            {stats.byOccupation?.map((item, index) => (
              <li key={index} className="flex justify-between py-2 border-b">
                <span>{item.occupation || "Chưa cập nhật"}</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Khu vực cho biểu đồ phát triển theo tháng (nếu cài Recharts) */}
      <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Tăng trưởng người dùng theo tháng</h3>
          <div className="h-64 flex items-end gap-2">
             {/* Render đơn giản nếu không có thư viện chart */}
             {stats.byMonth?.map((m, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div style={{height: `${m.count * 10}px`}} className="w-10 bg-blue-400 rounded-t"></div>
                    <span className="text-xs mt-1">T{m.month}</span>
                </div>
             ))}
          </div>
      </div>
    </div>
  );
}

// Component con hiển thị thẻ thống kê
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-md`}>
      <h3 className="text-lg opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}