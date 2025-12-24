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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl shadow-lg text-white">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
          Lương NET ước tính
        </p>
        <div className="text-4xl font-black">
          {fmtVND(data?.netSalary)} <span className="text-xl font-light">VNĐ</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Lương GROSS</p>
          <p className="text-lg font-bold text-gray-800">{fmtVND(data?.grossSalary)} VNĐ</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bảo hiểm (tổng)</p>
          <p className="text-lg font-bold text-blue-600">{fmtVND(data?.totalInsurance)} VNĐ</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Thuế TNCN</p>
          <p className="text-lg font-bold text-gray-800">{fmtVND(data?.incomeTax)} VNĐ</p>
        </div>
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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <NavbarLogged />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            CÔNG CỤ TÍNH LƯƠNG GROSS ↔ NET
          </h1>
          <p className="text-gray-500 text-sm">
            Tính lương GROSS/NET, bảo hiểm, thuế TNCN theo quy định mới nhất.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border w-fit">
          <button
            onClick={() => setTab('calc')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'calc' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Tính lương
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'history' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Lịch sử
          </button>
          <button
            onClick={() => setTab('ref')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'ref' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Tham khảo
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-shake">
            {error}
          </div>
        )}

        {/* Tab tính lương */}
        {tab === 'calc' && (
          <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
              <h3 className="font-bold text-gray-800">Thông tin tính lương</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lương & phụ thuộc */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mức lương</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="flex-1 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: 25,000,000"
                        value={salaryText}
                        onChange={(e) => {
                          const raw = parseVND(e.target.value);
                          setSalaryText(raw ? fmtVND(raw) : '');
                        }}
                      />
                      <span className="inline-flex items-center px-3 rounded-md bg-gray-100 text-xs text-gray-600">
                        VND
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Số người phụ thuộc</label>
                    <input
                      type="number"
                      min="0"
                      className="w-32 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      value={dependentsText}
                      onChange={(e) => setDependentsText(e.target.value)}
                    />
                  </div>
                </div>
                {/* Bảo hiểm & vùng */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mức lương đóng bảo hiểm</label>
                    <div className="flex flex-col gap-2">
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
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Vùng</label>
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
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-between items-center border-t border-gray-50">
                <p className="text-[11px] text-gray-400 italic italic">
                  * Kết quả chỉ mang tính chất tham khảo.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleCalculate('grossToNet')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading && mode === 'grossToNet' ? 'Đang tính…' : 'GROSS → NET'}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleCalculate('netToGross')}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading && mode === 'netToGross' ? 'Đang tính…' : 'NET → GROSS'}
                  </button>
                </div>
              </div>
              {/* Kết quả */}
              {result && (
                <div id="result-section" className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <SummaryTable data={result} />
                  <DetailTable data={{ ...result, dependents: dependentsNumber }} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab lịch sử */}
        {tab === 'history' && (
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 font-black text-gray-800 text-lg uppercase">
              Lịch sử tính lương của bạn
            </div>
            <div className="flex gap-2 p-4">
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
              <div className="p-20 text-center text-gray-400">Đang tải dữ liệu...</div>
            ) : history.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-400 font-black">
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Kiểu</th>
                      <th className="px-6 py-4">Vùng</th>
                      <th className="px-6 py-4 text-right">GROSS</th>
                      <th className="px-6 py-4 text-right">NET</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((item, idx) => {
                      const key = item.history_id || idx;
                      let resultData = {};
                      try {
                        resultData = typeof item.result_json === 'string'
                          ? JSON.parse(item.result_json)
                          : (item.result_json || {});
                      } catch (e) {
                        console.error("Lỗi đọc dữ liệu result_json:", e);
                      }
                      const gross = resultData.grossSalary || 0;
                      const net = resultData.netSalary || 0;
                      const regionVal = item.region || '-';
                      const typeLabel = item.type === 'grossToNet' ? 'GROSS → NET' : 'NET → GROSS';
                      const created = item.created_at;
                      return (
                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {created ? new Date(created).toLocaleString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">{typeLabel}</td>
                          <td className="px-6 py-4 text-sm">{regionVal}</td>
                          <td className="px-6 py-4 text-sm text-right">{fmtVND(gross)}</td>
                          <td className="px-6 py-4 text-sm text-right">{fmtVND(net)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(item)}
                              className="text-xs text-red-600 hover:underline font-bold"
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
              <div className="p-20 text-center text-gray-400">Bạn chưa có lịch sử tính toán nào.</div>
            )}
          </section>
        )}

        {/* Tab tham khảo */}
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

