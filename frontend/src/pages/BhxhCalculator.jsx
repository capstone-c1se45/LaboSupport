import React, { useState, useEffect } from 'react';
import NavbarLogged from '../components/NavbarLogged';
import { api, getErrorMessage } from '../lib/api-client';

// --- HELPER FUNCTIONS ---
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

// Tạo một giai đoạn mới với ID duy nhất
const createGiaiDoan = (isThaiSan = false) => ({
  id: Math.random().toString(36).substr(2, 9),
  startYear: currentYear,
  startMonth: 1,
  endYear: currentYear,
  endMonth: 12,
  luong: '',
  thaiSan: isThaiSan,
  doiTuong: 'Khác',
});

function fmtVND(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('vi-VN');
}

// Kiểm tra hợp lệ giai đoạn
function isValidGiaiDoan(gd) {
  const start = Number(gd.startYear) * 100 + Number(gd.startMonth);
  const end = Number(gd.endYear) * 100 + Number(gd.endMonth);
  return start <= end;
}

// --- COMPONENT HIỂN THỊ KẾT QUẢ ---
function BhxhResultTable({ result }) {
  if (!result) return null;

  const {
    chiTietGiaiDoan = [],
    tongTien = 0,
    tongThang = 0,
    mbqtl = 0,
    thoiGianTruoc2014 = 0,
    thoiGianSau2014 = 0,
    bhxh1Lan = 0,
    govSupport
  } = result;

  const namHưởng = Math.floor(tongThang / 12);
  const thangLe = tongThang % 12;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Thẻ tiền tổng */}
      <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl shadow-lg text-white">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
          Số tiền BHXH một lần ước tính
        </p>
        <div className="text-4xl font-black">
          {fmtVND(bhxh1Lan)} <span className="text-xl font-light">VNĐ</span>
        </div>
      </div>

      {/* Thông số tóm tắt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tổng thời gian đóng</p>
          <p className="text-lg font-bold text-gray-800">{tongThang} tháng</p>
          <p className="text-xs text-gray-500 italic">({namHưởng} năm {thangLe} tháng)</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bình quân tiền lương (Mbq)</p>
          <p className="text-lg font-bold text-blue-600">{fmtVND(mbqtl)} VNĐ</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tổng lương đã đóng</p>
          <p className="text-lg font-bold text-gray-800">{fmtVND(tongTien)} VNĐ</p>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
          <h4 className="text-sm font-bold text-gray-700 font-sans">Chi tiết diễn giải cách tính</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-sans">
            <thead className="bg-white text-gray-400 text-[10px] uppercase font-black">
              <tr>
                <th className="px-4 py-3">Giai đoạn</th>
                <th className="px-4 py-3 text-center">Tháng</th>
                <th className="px-4 py-3 text-right">Mức lương</th>
                <th className="px-4 py-3 text-right">Tổng cộng (CPI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chiTietGiaiDoan.map((gd, idx) => (
                <tr key={idx} className={gd.thaiSan ? "bg-pink-50/30" : ""}>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {gd.startMonth}/{gd.startYear} - {gd.endMonth}/{gd.endYear}
                    {gd.thaiSan && <span className="ml-2 text-[9px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold uppercase">Thai sản</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 font-bold">{gd.totalMonths}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtVND(gd.luong)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">{fmtVND(gd.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diễn giải hệ số */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
        <div className="text-sm">
          <span className="text-gray-500 font-sans">Hệ số trước 2014 (x1.5): </span>
          <span className="font-bold text-gray-800">{thoiGianTruoc2014} năm</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500 font-sans">Hệ số từ 2014 (x2.0): </span>
          <span className="font-bold text-gray-800">{thoiGianSau2014} năm</span>
        </div>
      </div>

      {/* Hỗ trợ nhà nước (Nếu có) */}
      {govSupport && govSupport.total > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <h4 className="text-amber-800 font-bold text-xs uppercase mb-2">Hỗ trợ Nhà nước (BHXH Tự nguyện)</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            {govSupport.details?.map((d, i) => <li key={i}>• {d}</li>)}
          </ul>
          <div className="mt-2 text-right font-bold text-amber-900 border-t border-amber-200 pt-2">
            Tổng cộng hỗ trợ: - {fmtVND(govSupport.total)} VNĐ
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function BhxhCalculator() {
  const [tab, setTab] = useState('bat-buoc');
  const [giaiDoans, setGiaiDoans] = useState([createGiaiDoan()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Lịch sử
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyType, setHistoryType] = useState('bat-buoc'); // 'bat-buoc' hoặc 'tu-nguyen'

  const isTuNguyen = tab === 'tu-nguyen';

  // Reset kết quả khi đổi tab
  useEffect(() => {
    setResult(null);
    setError('');
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab, historyType]);

  // Lấy lịch sử
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const url =
        historyType === 'tu-nguyen'
          ? '/bhxh/tu-nguyen/history'
          : '/bhxh/mot-lan/history';
      const res = await api.get(url);
      setHistory(res.data?.success ? res.data.data : []);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Xoá lịch sử
  const handleDeleteHistory = async (id) => {
    const url =
      historyType === 'tu-nguyen'
        ? `/bhxh/tu-nguyen/history/${id}`
        : `/bhxh/mot-lan/history/${id}`;
    if (!window.confirm("Bạn có chắc chắn muốn xoá bản ghi này?")) return;
    try {
      await api.delete(url);
      fetchHistory();
    } catch (e) {
      alert("Xoá thất bại: " + getErrorMessage(e));
    }
  };

  // Xem lại lịch sử
  const handleViewDetail = (item) => {
    setGiaiDoans(item.inputData || []);
    setResult(item.resultData || null);
    // Chuyển về đúng tab
    if (historyType === 'tu-nguyen' || item.inputData?.[0]?.doiTuong) {
      setTab('tu-nguyen');
    } else {
      setTab('bat-buoc');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function updateGiaiDoan(id, field, value) {
    setGiaiDoans((prev) =>
      prev.map((gd) => (gd.id === id ? { ...gd, [field]: value } : gd))
    );
  }

  function addGiaiDoan(isThaiSan = false) {
    setGiaiDoans((prev) => [...prev, createGiaiDoan(isThaiSan)]);
  }

  function removeGiaiDoan(id) {
    if (giaiDoans.length === 1) return;
    setGiaiDoans((prev) => prev.filter((gd) => gd.id !== id));
  }

  async function handleCalc() {
    setError('');
    // Kiểm tra hợp lệ các giai đoạn
    for (const gd of giaiDoans) {
      if (!isValidGiaiDoan(gd)) {
        setError('Thời gian bắt đầu không được lớn hơn thời gian kết thúc ở một giai đoạn!');
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        giaiDoans: giaiDoans.map((gd) => ({
          startYear: Number(gd.startYear),
          startMonth: Number(gd.startMonth),
          endYear: Number(gd.endYear),
          endMonth: Number(gd.endMonth),
          luong: Number(gd.luong) || 0,
          ...(isTuNguyen
            ? { doiTuong: gd.doiTuong }
            : { thaiSan: Boolean(gd.thaiSan) }),
        })),
      };

      const url = isTuNguyen ? '/bhxh/tu-nguyen' : '/bhxh/mot-lan';
      const res = await api.post(url, payload);

      setResult(res.data?.data || res.data);

      // Lưu lịch sử cho BHXH tự nguyện
      if (isTuNguyen) {
        try {
          await api.post('/bhxh/tu-nguyen/history', {
            inputData: payload.giaiDoans,
            resultData: res.data?.data || res.data,
          });
        } catch (e) {
          // Có thể log lỗi hoặc bỏ qua nếu không cần thiết
        }
      } else {
        // Lưu lịch sử cho BHXH bắt buộc (nếu cần, nếu backend chưa tự lưu)
        try {
          await api.post('/bhxh/mot-lan/history', {
            inputData: payload.giaiDoans,
            resultData: res.data?.data || res.data,
          });
        } catch (e) {}
      }

      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(getErrorMessage(err, 'Lỗi hệ thống. Vui lòng kiểm tra lại dữ liệu.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <NavbarLogged />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            TÍNH BẢO HIỂM XÃ HỘI MỘT LẦN
          </h1>
          <p className="text-gray-500 text-sm">
            Hỗ trợ tính toán mức hưởng BHXH bắt buộc và tự nguyện theo quy định mới nhất năm 2024.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border w-fit">
          <button
            onClick={() => setTab('bat-buoc')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'bat-buoc' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            BHXH Bắt buộc
          </button>
          <button
            onClick={() => setTab('tu-nguyen')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'tu-nguyen' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            BHXH Tự nguyện
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === 'history' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Lịch sử tính
          </button>
        </div>

        {/* Form và kết quả chỉ hiện khi KHÔNG phải tab lịch sử */}
        {tab !== 'history' && (
          <>
            {/* Form Input */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
                <h3 className="font-bold text-gray-800">Quá trình tham gia</h3>
                <div className="flex gap-2">
                  {!isTuNguyen && (
                    <button
                      type="button"
                      onClick={() => addGiaiDoan(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-pink-100 text-pink-600 hover:bg-pink-50 transition"
                    >
                      + Nghỉ Thai sản
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => addGiaiDoan(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    + Thêm giai đoạn
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {giaiDoans.map((gd) => (
                  <div
                    key={gd.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-5 rounded-2xl border transition-all ${
                      gd.thaiSan ? 'bg-pink-50/40 border-pink-100' : 'bg-white border-gray-100'
                    }`}
                  >
                    {/* Từ tháng/năm */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Bắt đầu</label>
                        <div className="flex gap-1">
                          <select
                            className="w-full bg-gray-50 border-0 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={gd.startMonth}
                            onChange={(e) => updateGiaiDoan(gd.id, 'startMonth', e.target.value)}
                          >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select
                            className="w-full bg-gray-50 border-0 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={gd.startYear}
                            onChange={(e) => updateGiaiDoan(gd.id, 'startYear', e.target.value)}
                          >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kết thúc</label>
                        <div className="flex gap-1">
                          <select
                            className="w-full bg-gray-50 border-0 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={gd.endMonth}
                            onChange={(e) => updateGiaiDoan(gd.id, 'endMonth', e.target.value)}
                          >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select
                            className="w-full bg-gray-50 border-0 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={gd.endYear}
                            onChange={(e) => updateGiaiDoan(gd.id, 'endYear', e.target.value)}
                          >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mức lương */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mức lương đóng BHXH</label>
                      <input
                        type="number"
                        className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                        value={gd.luong}
                        onChange={(e) => updateGiaiDoan(gd.id, 'luong', e.target.value)}
                        placeholder="VD: 6000000"
                      />
                    </div>

                    {/* Tùy chọn */}
                    <div className="md:col-span-3">
                      {isTuNguyen ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Đối tượng</label>
                          <select
                            className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={gd.doiTuong}
                            onChange={(e) => updateGiaiDoan(gd.id, 'doiTuong', e.target.value)}
                          >
                            <option value="Hộ nghèo">Hộ nghèo</option>
                            <option value="Hộ cận nghèo">Hộ cận nghèo</option>
                            <option value="Khác">Đối tượng khác</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center h-10 gap-2">
                          <input
                            id={`ts-${gd.id}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={gd.thaiSan}
                            onChange={(e) => updateGiaiDoan(gd.id, 'thaiSan', e.target.checked)}
                          />
                          <label htmlFor={`ts-${gd.id}`} className="text-xs font-bold text-gray-500 cursor-pointer">
                            Thai sản
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Nút xóa */}
                    <div className="md:col-span-1 flex justify-end">
                      {giaiDoans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGiaiDoan(gd.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-6 flex justify-between items-center border-t border-gray-50">
                  <p className="text-[11px] text-gray-400 italic italic">
                    * Lưu ý: Kết quả mang tính chất tham khảo.
                  </p>
                  <button
                    type="button"
                    onClick={handleCalc}
                    disabled={loading}
                    className="px-10 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'ĐANG XỬ LÝ...' : 'TÍNH KẾT QUẢ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            {/* Hiển thị kết quả */}
            {result && (
              <div id="result-section" className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <BhxhResultTable result={result} />
              </div>
            )}
          </>
        )}

        {/* Tab lịch sử */}
        {tab === 'history' && (
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 font-black text-gray-800 text-lg uppercase">
              Lịch sử tính toán của bạn
            </div>
            <div className="flex gap-2 p-4">
              <button
                onClick={() => setHistoryType('bat-buoc')}
                className={`px-4 py-2 rounded ${historyType === 'bat-buoc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                BHXH Bắt buộc
              </button>
              <button
                onClick={() => setHistoryType('tu-nguyen')}
                className={`px-4 py-2 rounded ${historyType === 'tu-nguyen' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                BHXH Tự nguyện
              </button>
            </div>
            {historyLoading ? (
              <div className="p-20 text-center text-gray-400">Đang tải dữ liệu...</div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-400 font-black">
                      <th className="px-6 py-4">Ngày tính</th>
                      <th className="px-6 py-4">Tổng tiền nhận</th>
                      <th className="px-6 py-4">Tổng tháng đóng</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((item) => (
                      <tr key={item.history_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-amber-600">
                          {fmtVND(item.resultData?.tongTien)} ₫
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.resultData?.tongThang} tháng
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => handleViewDetail(item)} className="text-blue-500 hover:underline text-xs font-bold">XEM LẠI</button>
                          <button onClick={() => handleDeleteHistory(item.history_id)} className="text-red-400 hover:underline text-xs font-bold">XOÁ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center text-gray-400">Bạn chưa có lịch sử tính toán nào.</div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}