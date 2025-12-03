import React from 'react';

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Tình hình sử dụng Trợ lý AI',
    description: 'Tổng hợp số lượt truy vấn AI theo từng tháng.',
    updatedAt: 'Hôm qua',
  },
  {
    id: 2,
    title: 'Báo cáo hợp đồng phân tích',
    description: 'Số lượng hợp đồng được hệ thống phân tích theo phòng ban.',
    updatedAt: '2 ngày trước',
  },
  {
    id: 3,
    title: 'Cảnh báo rủi ro pháp lý',
    description: 'Danh sách các hợp đồng có điều khoản tiềm ẩn rủi ro.',
    updatedAt: 'Tuần này',
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">
          Báo cáo & Thống kê
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tổng hợp số liệu hoạt động của hệ thống theo thời gian.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportStat label="Hợp đồng đã phân tích" value="1,256" />
        <ReportStat label="Câu hỏi AI đã trả lời" value="8,432" />
        <ReportStat label="Cảnh báo rủi ro" value="32" />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Báo cáo gần đây
        </h3>
        <ul className="divide-y divide-gray-100">
          {MOCK_REPORTS.map((r) => (
            <li
              key={r.id}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {r.title}
                </div>
                <div className="text-xs text-gray-500">{r.description}</div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {r.updatedAt}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReportStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

