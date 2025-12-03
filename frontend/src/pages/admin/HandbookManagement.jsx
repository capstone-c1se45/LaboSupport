import React, { useState } from 'react';

const LAW_ITEMS = [
  {
    code: 'BL 45/2019/QH14',
    article: 'Điều 90',
    effective: '01/01/2021',
    title: 'Thời giờ làm việc bình thường',
    description:
      'Thời giờ làm việc bình thường không quá 8 giờ trong 1 ngày và 48 giờ trong 1 tuần.',
    note: 'Áp dụng cho tất cả người lao động.',
  },
  {
    code: 'BL 45/2019/QH14',
    article: 'Điều 95',
    effective: '01/01/2021',
    title: 'Kỳ hạn trả lương',
    description:
      'Người sử dụng lao động phải trả lương đúng thời hạn, đầy đủ cho người lao động.',
    note: 'Có thể thoả thuận theo tháng, nửa tháng hoặc theo chu kỳ.',
  },
];

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
  const [tab, setTab] = useState('law'); // law | salary
  const [search, setSearch] = useState('');

  const filteredLaw = LAW_ITEMS.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tìm kiếm điều khoản..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              <span className="text-base leading-none">＋</span>
              <span>Thêm điều khoản mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredLaw.map((item, idx) => (
              <LawCard key={idx} item={item} />
            ))}
            {filteredLaw.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-500">
                Không tìm thấy điều khoản phù hợp.
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'salary' && (
        <section className="space-y-6">
          {/* Region salary table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Mức lương tối thiểu vùng
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
    </div>
  );
}

function LawCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
            {item.code}
          </span>
          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
            {item.article}
          </span>
          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            Hiệu lực: {item.effective}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
          >
            ✏️ Sửa
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
          >
            🗑 Xoá
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-800">
        <div className="font-semibold">{item.title}</div>
        <div>{item.description}</div>
        {item.note && (
          <div className="text-xs text-gray-500 mt-1 italic">Ghi chú: {item.note}</div>
        )}
      </div>
    </div>
  );
}

