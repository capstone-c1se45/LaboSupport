import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { adminService } from '../../services/adminService';

function DashboardCard({ title, value, diff, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-start gap-4">
      <div
        className={`${iconBg} ${iconColor} h-10 w-10 rounded-lg flex items-center justify-center`}
      >
        <span className="text-lg font-semibold">●</span>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-xs mt-1 text-green-600 font-medium">
          {diff}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContracts: 0,
    totalReports: 0,
    totalMessages: 0,
    activeUsers: 0
  });
  
  const [growthData, setGrowthData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminService.getReports();
        
        // 1. Cập nhật Stats Cards
        setStats({
          totalUsers: data.overview.total_users || 0,
          totalContracts: data.overview.totalContracts || 0,
          totalReports: data.overview.totalReports || 0,
          totalMessages: data.overview.totalMessages || 0,
          activeUsers: data.overview.active_users || 0
        });

        // 2. Xử lý dữ liệu User Growth (Cộng dồn user theo tháng)
        let cumulativeUsers = 0;
        const processedGrowthData = (data.byMonth || []).map(item => {
          cumulativeUsers += item.total_users;
          return {
            month: item.month, // Dạng "YYYY-MM"
            users: cumulativeUsers,
            newUsers: item.total_users
          };
        });
        setGrowthData(processedGrowthData);

        // 3. Xử lý dữ liệu Activity (Hợp đồng & AI Queries theo tháng)
        const contractsMap = new Map((data.contractsByMonth || []).map(i => [i.month, i.total]));
        const messagesMap = new Map((data.messagesByMonth || []).map(i => [i.month, i.total]));
        
        // Lấy danh sách tất cả các tháng có dữ liệu
        const allMonths = new Set([...contractsMap.keys(), ...messagesMap.keys()]);
        const sortedMonths = Array.from(allMonths).sort();

        const processedActivityData = sortedMonths.map(month => ({
          month: month,
          contracts: contractsMap.get(month) || 0,
          aiQueries: messagesMap.get(month) || 0
        }));
        
        setActivityData(processedActivityData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  const statsCards = [
    {
      title: 'Tổng số người dùng',
      value: stats.totalUsers.toLocaleString(),
      diff: `${stats.activeUsers} đang hoạt động`,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Tổng số hợp đồng',
      value: stats.totalContracts.toLocaleString(),
      diff: 'Dữ liệu thực tế',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Tổng tin nhắn AI',
      value: stats.totalMessages.toLocaleString(),
      diff: 'Tương tác với Chatbot',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Báo cáo / Phản hồi',
      value: stats.totalReports.toLocaleString(),
      diff: 'Từ người dùng',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-900">
          Tổng quan Bảng điều khiển
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Dữ liệu thống kê mới nhất từ hệ thống.
        </p>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <DashboardCard key={idx} {...card} />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Xu hướng Tăng trưởng Người dùng (Tích lũy)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Tổng người dùng"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Hoạt động Hệ thống (Theo tháng)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="contracts"
                  name="Hợp đồng mới"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="aiQueries"
                  name="Truy vấn AI"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}