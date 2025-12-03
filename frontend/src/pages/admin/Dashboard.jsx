import React from 'react';
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

const statsCards = [
  {
    title: 'Tổng số người dùng',
    value: '1,248',
    diff: '+1,248 so với tháng trước',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Tổng số hồ sơ',
    value: '864',
    diff: '+312 so với tháng trước',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Phản hồi / Tin nhắn',
    value: '3,215',
    diff: '+540 so với tháng trước',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Tăng trưởng',
    value: '32%',
    diff: '+6% so với tháng trước',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

const growthData = [
  { month: 'Th1', users: 140 },
  { month: 'Th2', users: 180 },
  { month: 'Th3', users: 230 },
  { month: 'Th4', users: 290 },
  { month: 'Th5', users: 360 },
  { month: 'Th6', users: 460 },
];

const activityData = [
  { month: 'Th1', contracts: 400, aiQueries: 2000 },
  { month: 'Th2', contracts: 600, aiQueries: 3200 },
  { month: 'Th3', contracts: 800, aiQueries: 4500 },
  { month: 'Th4', contracts: 900, aiQueries: 5600 },
  { month: 'Th5', contracts: 1100, aiQueries: 6700 },
  { month: 'Th6', contracts: 1300, aiQueries: 8200 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-900">
          Tổng quan Bảng điều khiển
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Chào mừng trở lại! Bảng điều khiển của bạn đã sẵn sàng.
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
            Xu hướng Tăng trưởng Người dùng
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
            Hoạt động Hệ thống
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
                  name="Hợp đồng"
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

