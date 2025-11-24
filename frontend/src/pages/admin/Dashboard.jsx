import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminService.getReports();
        setStats(data);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!stats) return <div className="p-8 text-center">Không có dữ liệu báo cáo.</div>;

  // Xử lý dữ liệu cho biểu đồ
  const roleData = stats.byRole?.map(r => ({ name: r.role_name, value: r.total })) || [];
  const monthData = stats.byMonth?.map(m => ({ name: m.month, users: m.total_users })) || [];
  const genderData = stats.byGender?.map(g => ({ name: g.gender || "Chưa rõ", value: g.total })) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tổng quan hệ thống</h1>

      {/* Cards: Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Tổng người dùng" value={stats.overview?.total_users || 0} color="bg-blue-500" />
        <StatCard title="Đang hoạt động" value={stats.overview?.active_users || 0} color="bg-green-500" />
        <StatCard title="Ngưng hoạt động" value={stats.overview?.inactive_users || 0} color="bg-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biểu đồ 1: Tăng trưởng người dùng theo tháng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tăng trưởng người dùng</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="Người dùng mới" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 2: Phân bố Vai trò (Pie Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Phân bố vai trò</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 3: Giới tính */}
         <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Thống kê giới tính</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} fill="#82ca9d" dataKey="value" label>
                   {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng nhỏ: Top nghề nghiệp */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top nghề nghiệp phổ biến</h3>
          <ul className="divide-y">
            {stats.byOccupation?.map((occ, idx) => (
              <li key={idx} className="py-3 flex justify-between items-center">
                <span className="text-gray-700">{occ.occupation || "Chưa cập nhật"}</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                  {occ.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Component thẻ thống kê nhỏ
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-lg flex flex-col items-start`}>
      <h3 className="text-sm uppercase tracking-wider opacity-80 mb-1">{title}</h3>
      <span className="text-4xl font-bold">{value}</span>
    </div>
  );
}