import React, { useState } from 'react';
import NavbarLogged from '../components/NavbarLogged';
import { api, getErrorMessage } from '../lib/api-client';

const years = Array.from({ length: 50 }, (_, i) => 1980 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const blankGiaiDoan = {
  startYear: new Date().getFullYear(),
  startMonth: 1,
  endYear: new Date().getFullYear(),
  endMonth: 12,
  luong: 0,
  thaiSan: false,
  doiTuong: 'Khác', // chỉ dùng cho tự nguyện
};

export default function BhxhCalculator() {
  const [tab, setTab] = useState('bat-buoc'); // 'bat-buoc' | 'tu-nguyen'
  const [giaiDoans, setGiaiDoans] = useState([{ ...blankGiaiDoan }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const isTuNguyen = tab === 'tu-nguyen';

  function updateGiaiDoan(idx, field, value) {
    setGiaiDoans((prev) =>
      prev.map((gd, i) => (i === idx ? { ...gd, [field]: value } : gd))
    );
  }

  function addGiaiDoan() {
    setGiaiDoans((prev) => [...prev, { ...blankGiaiDoan }]);
  }

  function removeGiaiDoan(idx) {
    if (giaiDoans.length === 1) return;
    setGiaiDoans((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCalc() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Chuẩn hoá payload theo tab
      const payload = {
        giaiDoans: giaiDoans.map((gd) => ({
          startYear: Number(gd.startYear),
          startMonth: Number(gd.startMonth),
          endYear: Number(gd.endYear),
          endMonth: Number(gd.endMonth),
          luong: Number(gd.luong),
          ...(isTuNguyen
            ? { doiTuong: gd.doiTuong }
            : { thaiSan: Boolean(gd.thaiSan) }),
        })),
      };

      const url = isTuNguyen ? '/bhxh/tu-nguyen' : '/bhxh/mot-lan';
      const res = await api.post(url, payload);
      setResult(res.data?.data || res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Không tính được BHXH, vui lòng thử lại.'));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarLogged />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hệ thống tính bảo hiểm xã hội một lần
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Nhập các giai đoạn tham gia BHXH để ước tính số tiền hưởng BHXH một lần.
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-full bg-white border border-gray-200 shadow-sm text-sm">
          <button
            type="button"
            onClick={() => setTab('bat-buoc')}
            className={`px-4 py-1.5 rounded-full transition ${
              tab === 'bat-buoc'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            BHXH bắt buộc
          </button>
          <button
            type="button"
            onClick={() => setTab('tu-nguyen')}
            className={`px-4 py-1.5 rounded-full transition ${
              tab === 'tu-nguyen'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            BHXH tự nguyện
          </button>
        </div>

        {/* Form giai đoạn */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">
              Giai đoạn đóng BHXH
            </h3>
            <div className="flex gap-2">
              {!isTuNguyen && (
                <button
                  type="button"
                  onClick={() =>
                    setGiaiDoans((prev) =>
                      prev.map((gd) => ({ ...gd, thaiSan: true }))
                    )
                  }
                  className="px-3 py-1.5 text-xs rounded-full border text-gray-700 hover:bg-gray-50"
                >
                  + Giai đoạn thai sản
                </button>
              )}
              <button
                type="button"
                onClick={addGiaiDoan}
                className="px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                + Thêm giai đoạn
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {giaiDoans.map((gd, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <label className="text-xs text-gray-600">Từ tháng</label>
                  <select
                    className="w-full border rounded-md px-2 py-2 text-sm"
                    value={gd.startMonth}
                    onChange={(e) =>
                      updateGiaiDoan(idx, 'startMonth', e.target.value)
                    }
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Năm</label>
                  <select
                    className="w-full border rounded-md px-2 py-2 text-sm"
                    value={gd.startYear}
                    onChange={(e) =>
                      updateGiaiDoan(idx, 'startYear', e.target.value)
                    }
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Đến tháng</label>
                  <select
                    className="w-full border rounded-md px-2 py-2 text-sm"
                    value={gd.endMonth}
                    onChange={(e) =>
                      updateGiaiDoan(idx, 'endMonth', e.target.value)
                    }
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Năm</label>
                  <select
                    className="w-full border rounded-md px-2 py-2 text-sm"
                    value={gd.endYear}
                    onChange={(e) =>
                      updateGiaiDoan(idx, 'endYear', e.target.value)
                    }
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">
                    Mức lương đóng BHXH
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-2 py-2 text-sm"
                    value={gd.luong}
                    onChange={(e) =>
                      updateGiaiDoan(idx, 'luong', e.target.value)
                    }
                    placeholder="Ví dụ: 6000000"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {!isTuNguyen ? (
                    <>
                      <input
                        id={`thaiSan-${idx}`}
                        type="checkbox"
                        checked={gd.thaiSan}
                        onChange={(e) =>
                          updateGiaiDoan(idx, 'thaiSan', e.target.checked)
                        }
                      />
                      <label
                        htmlFor={`thaiSan-${idx}`}
                        className="text-xs text-gray-600"
                      >
                        Giai đoạn thai sản
                      </label>
                    </>
                  ) : (
                    <select
                      className="w-full border rounded-md px-2 py-2 text-sm"
                      value={gd.doiTuong}
                      onChange={(e) =>
                        updateGiaiDoan(idx, 'doiTuong', e.target.value)
                      }
                    >
                      <option value="Hộ nghèo">Hộ nghèo</option>
                      <option value="Hộ cận nghèo">Hộ cận nghèo</option>
                      <option value="Khác">Đối tượng khác</option>
                    </select>
                  )}
                  {giaiDoans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGiaiDoan(idx)}
                      className="ml-auto text-xs text-red-600 hover:underline"
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCalc}
              disabled={loading}
              className="px-5 py-2 rounded-md bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? 'Đang tính...' : 'Tính BHXH'}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Kết quả */}
        {result && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Kết quả tạm tính
            </h3>
            <pre className="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

