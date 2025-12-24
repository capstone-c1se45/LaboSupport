import React, { useEffect, useMemo, useState } from 'react';
import NavbarLogged from '../components/NavbarLogged';
import { api, getErrorMessage } from '../lib/api-client';

// Helper: format and parse VND text
const fmtVND = (n) =>
  (isNaN(n) ? 0 : Math.round(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseVND = (s) => {
  if (typeof s === 'number') return s;
  const digits = (s || '').toString().replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const regions = [
  { code: 'I', label: 'Vùng I' },
  { code: 'II', label: 'Vùng II' },
  { code: 'III', label: 'Vùng III' },
  { code: 'IV', label: 'Vùng IV' },
];

export default function SalaryTool() {
  const [tab, setTab] = useState('calc'); // calc | history | ref
  const [mode, setMode] = useState('grossToNet'); // grossToNet | netToGross

  const [salaryText, setSalaryText] = useState('');
  const [insuranceMode, setInsuranceMode] = useState('official'); // official | custom
  const [insuranceText, setInsuranceText] = useState('');
  const [region, setRegion] = useState('I');
  const [dependentsText, setDependentsText] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const salaryNumber = useMemo(() => parseVND(salaryText), [salaryText]);
  const insuranceNumber = useMemo(
    () => (insuranceMode === 'official' ? salaryNumber : parseVND(insuranceText)),
    [insuranceMode, insuranceText, salaryNumber],
  );
  const dependentsNumber = useMemo(
    () => Number(dependentsText || 0),
    [dependentsText],
  );

  // Fetch salary history from backend
  async function fetchHistory() {
  setHistoryLoading(true);
  try {
    const res = await api.get('/salary/history');
    // Sửa dòng này: backend trả về mảng trực tiếp trong res.data
    const list = res?.data || []; 
    setHistory(Array.isArray(list) ? list : []);
  } catch (e) {
    console.error('Failed to load salary history', e);
  } finally {
    setHistoryLoading(false);
  }
}

  useEffect(() => {
    fetchHistory();
  }, []);

  function validate() {
    if (!salaryNumber || salaryNumber <= 0) {
      return 'Số tiền lương phải lớn hơn 0.';
    }
    if (!['I', 'II', 'III', 'IV'].includes(region)) {
      return 'Vui lòng chọn đúng vùng.';
    }
    if (
      !Number.isFinite(dependentsNumber) ||
      dependentsNumber < 0 ||
      !Number.isInteger(dependentsNumber)
    ) {
      return 'Số người phụ thuộc phải là số nguyên không âm.';
    }
    if (insuranceMode === 'custom' && (!insuranceNumber || insuranceNumber <= 0)) {
      return 'Mức lương đóng bảo hiểm (khác) phải lớn hơn 0.';
    }
    return null;
  }

  async function handleCalculate(nextMode) {
    const err = validate();
    if (err) {
      setError(err);
      setResult(null);
      return;
    }

    setMode(nextMode);
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      type: nextMode,
      salary: salaryNumber,
      insuranceSalary: insuranceNumber,
      dependents: dependentsNumber,
      region,
    };

    try {
      const res = await api.post('/salary', payload);
      const data = res?.data?.data || res?.data;
      setResult(data || null);
      // Lịch sử do backend lưu, sau khi tính lại thì reload
      fetchHistory();
    } catch (e) {
      setError(getErrorMessage(e, 'Không thể tính lương. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteHistoryItem = async (item) => {
    const id = item?.id || item?._id || item?.history_id;
    if (!id) return;
    try {
      await api.delete(`/salary/history/${id}`);
      fetchHistory();
    } catch (e) {
      setError(getErrorMessage(e, 'Không thể xoá lịch sử này.'));
    }
  };

  const handleClearHistory = async () => {
    if (!history.length) return;
    try {
      await api.delete('/salary/history');
      fetchHistory();
    } catch (e) {
      setError(getErrorMessage(e, 'Không thể xoá toàn bộ lịch sử.'));
    }
  };

  const SummaryTable = ({ data }) => (
    <div className="mt-8">
      <div className="text-sm text-gray-500 mb-2">Đơn vị tính: VND</div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            <tr className="bg-blue-50/60">
              <td className="px-4 py-3 text-gray-700">Lương GROSS</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {fmtVND(data?.grossSalary)} (đ)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Bảo hiểm</td>
              <td className="px-4 py-3 text-right text-gray-900">
                - {fmtVND(data?.totalInsurance)} (đ)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Thuế TNCN</td>
              <td className="px-4 py-3 text-right text-gray-900">
                - {fmtVND(data?.incomeTax)} (đ)
              </td>
            </tr>
            <tr className="bg-blue-50/60">
              <td className="px-4 py-3 font-semibold text-gray-800">Lương NET</td>
              <td className="px-4 py-3 text-right font-semibold text-red-600">
                {fmtVND(data?.netSalary)} (đ)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const DetailTable = ({ data }) => (
    <div className="mt-8">
      <div className="text-sm text-gray-500 mb-2">Chi tiết khấu trừ</div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 text-gray-700">Số người phụ thuộc</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {data?.dependents ?? dependentsNumber}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 text-gray-700">Thu nhập chịu thuế</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {fmtVND(data?.taxableIncome || 0)} (đ)
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 text-gray-700">BHXH (8%) + BHYT (1.5%) + BHTN (1%)</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {fmtVND(data?.totalInsurance || 0)} (đ)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Thuế TNCN phải nộp</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {fmtVND(data?.incomeTax || 0)} (đ)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <NavbarLogged />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Công cụ tính lương & bảo hiểm
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Tính lương GROSS ↔ NET theo quy định hiện hành, kèm mức đóng bảo
            hiểm xã hội, y tế và thất nghiệp.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setTab('calc')}
            className={`px-4 py-2 rounded-full border ${
              tab === 'calc'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tính lương
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-full border ${
              tab === 'history'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Lịch sử
          </button>
          <button
            type="button"
            onClick={() => setTab('ref')}
            className={`px-4 py-2 rounded-full border ${
              tab === 'ref'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tham khảo
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* Tab 1: Tính lương */}
        {tab === 'calc' && (
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức lương
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 25,000,000"
                    value={salaryText}
                    onChange={(e) => {
                      const raw = parseVND(e.target.value);
                      setSalaryText(raw ? fmtVND(raw) : '');
                    }}
                  />
                  <span className="inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-xs text-gray-600">
                    VND
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Nhập tổng lương GROSS hoặc NET tùy chiều tính toán.
                </p>

                <div className="mt-5">
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Số người phụ thuộc
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dependentsText}
                    onChange={(e) => setDependentsText(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tính theo người phụ thuộc được giảm trừ gia cảnh.
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Mức lương đóng bảo hiểm
                </span>
                <div className="space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="insuranceBase"
                      className="accent-blue-600"
                      checked={insuranceMode === 'official'}
                      onChange={() => setInsuranceMode('official')}
                    />
                    <span>Trên lương chính thức</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="insuranceBase"
                      className="accent-blue-600"
                      checked={insuranceMode === 'custom'}
                      onChange={() => setInsuranceMode('custom')}
                    />
                    <span>Khác:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                      placeholder="VD: 20,000,000"
                      value={insuranceText}
                      onChange={(e) => {
                        const raw = parseVND(e.target.value);
                        setInsuranceText(raw ? fmtVND(raw) : '');
                      }}
                      disabled={insuranceMode !== 'custom'}
                    />
                    <span className="text-xs text-gray-500">VND</span>
                  </label>
                </div>

                <div className="mt-5">
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Vùng
                  </span>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    {regions.map((r) => (
                      <label key={r.code} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="region"
                          className="accent-blue-600"
                          checked={region === r.code}
                          onChange={() => setRegion(r.code)}
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Vùng lương tối thiểu dùng để giới hạn mức đóng bảo hiểm.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCalculate('grossToNet')}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md px-5 py-2 text-sm font-semibold"
              >
                {loading && mode === 'grossToNet' ? 'Đang tính…' : 'GROSS → NET'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCalculate('netToGross')}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md px-5 py-2 text-sm font-semibold"
              >
                {loading && mode === 'netToGross' ? 'Đang tính…' : 'NET → GROSS'}
              </button>
            </div>

            {result && (
              <>
                <SummaryTable data={result} />
                <DetailTable data={{ ...result, dependents: dependentsNumber }} />
              </>
            )}
          </section>
        )}

        {/* Tab 2: Lịch sử */}
        {tab === 'history' && (
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                Lịch sử tính toán lương (do backend lưu).
              </div>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={handleClearHistory}
                disabled={!history.length}
              >
                Xoá tất cả
              </button>
            </div>
            {historyLoading ? (
              <div className="text-sm text-gray-500">Đang tải lịch sử…</div>
            ) : history.length ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">Thời gian</th>
                      <th className="text-left px-4 py-2">Kiểu</th>
                      <th className="text-left px-4 py-2">Vùng</th>
                      <th className="text-right px-4 py-2">GROSS</th>
                      <th className="text-right px-4 py-2">NET</th>
                      <th className="px-4 py-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                  {history.map((item, idx) => {
  // 1. Lấy ID chính xác từ cột 'history_id' trong Database
  const key = item.history_id || idx;
  
  // 2. GIẢI MÃ JSON: Vì backend lưu kết quả vào cột result_json
  let resultData = {};
  try {
    resultData = typeof item.result_json === 'string' 
      ? JSON.parse(item.result_json) 
      : (item.result_json || {});
  } catch (e) {
    console.error("Lỗi đọc dữ liệu result_json:", e);
  }

  // 3. Trích xuất giá trị để hiển thị
  const gross = resultData.grossSalary || 0;
  const net = resultData.netSalary || 0;
  const regionVal = item.region || '-'; // Cột 'region' trong DB
  const typeLabel = item.type === 'grossToNet' ? 'GROSS → NET' : 'NET → GROSS';
  const created = item.created_at; // Cột 'created_at' trong DB

  return (
    <tr key={key} className="border-t">
      <td className="px-4 py-2">
        {created ? new Date(created).toLocaleString('vi-VN') : '-'}
      </td>
      <td className="px-4 py-2">{typeLabel}</td>
      <td className="px-4 py-2">{regionVal}</td>
      <td className="px-4 py-2 text-right">{fmtVND(gross)}</td>
      <td className="px-4 py-2 text-right">{fmtVND(net)}</td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={() => handleDeleteHistoryItem(item)}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Xoá
        </button>
      </td>
    </tr>
  );
})}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Chưa có lịch sử tính toán nào.
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Tham khảo */}
        {tab === 'ref' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Bảng thuế TNCN (tham khảo)
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>Đến 5 triệu: 5%</li>
                <li>Trên 5 – 10 triệu: 10%</li>
                <li>Trên 10 – 18 triệu: 15%</li>
                <li>Trên 18 – 32 triệu: 20%</li>
                <li>Trên 32 – 52 triệu: 25%</li>
                <li>Trên 52 – 80 triệu: 30%</li>
                <li>Trên 80 triệu: 35%</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Tỷ lệ bảo hiểm (người lao động)
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>BHXH: 8%</li>
                <li>BHYT: 1.5%</li>
                <li>BHTN: 1%</li>
                <li>Giảm trừ bản thân: 11.000.000 đ/tháng</li>
                <li>Giảm trừ người phụ thuộc: 4.400.000 đ/tháng/người</li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

