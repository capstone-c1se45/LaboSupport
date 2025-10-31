import React, { useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../lib/api-client';

const fmtVND = (n) =>
  (isNaN(n) ? 0 : Math.round(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseVND = (s) => {
  if (typeof s === 'number') return s;
  const digits = (s || '').toString().replace(/[^\d.]/g, '');
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
  const [bhBaseType, setBhBaseType] = useState('official'); // official | custom
  const [bhBaseText, setBhBaseText] = useState('');
  const [region, setRegion] = useState('I');
  const [dependents, setDependents] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('salary_history') || '[]');
      setHistory(saved);
    } catch {}
  }, []);

  const onSalaryChange = (e) => {
    const raw = parseVND(e.target.value);
    setSalaryText(fmtVND(raw));
  };
  const onBhBaseChange = (e) => {
    const raw = parseVND(e.target.value);
    setBhBaseText(fmtVND(raw));
  };

  const salaryNumber = useMemo(() => parseVND(salaryText), [salaryText]);
  const bhBaseNumber = useMemo(() => parseVND(bhBaseText), [bhBaseText]);
  const dependentsNumber = useMemo(() => Number(dependents || 0), [dependents]);

  function validate() {
    if (!salaryNumber || salaryNumber <= 0) return 'Thu nhập phải lớn hơn 0';
    if (!['I', 'II', 'III', 'IV'].includes(region)) return 'Vui lòng chọn đúng Vùng';
    if (!Number.isFinite(dependentsNumber) || dependentsNumber < 0 || !Number.isInteger(dependentsNumber))
      return 'Số người phụ thuộc phải là số nguyên không âm';
    if (bhBaseType === 'custom' && (!bhBaseNumber || bhBaseNumber <= 0))
      return 'Lương đóng bảo hiểm (Khác) phải lớn hơn 0';
    return null;
  }

  async function calculate(nextMode) {
    const err = validate();
    if (err) {
      setError(err);
      setResult(null);
      return;
    }
    setError('');
    setMode(nextMode);
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        type: nextMode,
        salary: salaryNumber,
        dependents: dependentsNumber,
        region,
      };
      const res = await api.post('/salary', payload);
      setResult(res.data);
      // Save history
      const item = {
        at: new Date().toISOString(),
        inputs: { ...payload },
        outputs: { gross: res.data?.grossSalary, net: res.data?.netSalary },
      };
      const next = [item, ...(history || [])].slice(0, 10);
      setHistory(next);
      localStorage.setItem('salary_history', JSON.stringify(next));
    } catch (e) {
      setError(getErrorMessage(e));
    }
    setLoading(false);
  }

  const SummaryTable = ({ data }) => (
    <div className='mt-8'>
      <div className='text-sm text-gray-500 mb-2'>Đơn vị tính: VND</div>
      <div className='overflow-hidden rounded-xl border border-gray-200'>
        <table className='w-full text-sm'>
          <tbody>
            <tr className='bg-blue-50/60'>
              <td className='px-4 py-3 text-gray-700'>Lương GROSS</td>
              <td className='px-4 py-3 text-right text-gray-900'>{fmtVND(data.grossSalary)} (đ)</td>
            </tr>
            <tr>
              <td className='px-4 py-3 text-gray-700'>Bảo hiểm</td>
              <td className='px-4 py-3 text-right text-gray-900'>- {fmtVND(data.totalInsurance)} (đ)</td>
            </tr>
            <tr>
              <td className='px-4 py-3 text-gray-700'>Thuế TNCN</td>
              <td className='px-4 py-3 text-right text-gray-900'>- {fmtVND(data.incomeTax)} (đ)</td>
            </tr>
            <tr className='bg-blue-50/60'>
              <td className='px-4 py-3 font-semibold text-gray-800'>Lương NET</td>
              <td className='px-4 py-3 text-right font-semibold text-red-600'>{fmtVND(data.netSalary)} (đ)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const DetailTable = ({ data }) => (
    <div className='mt-8'>
      <div className='text-sm text-gray-500 mb-2'>Đơn vị tính: VND</div>
      <div className='overflow-hidden rounded-xl border border-gray-200'>
        <table className='w-full text-sm'>
          <tbody>
            <tr className='bg-blue-50/60'><td className='px-4 py-3'>Lương GROSS</td><td className='px-4 py-3 text-right'>{fmtVND(data.grossSalary)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Bảo hiểm xã hội (8%)</td><td className='px-4 py-3 text-right'>- {fmtVND(data.insurances?.BHXH)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Bảo hiểm y tế (1.5%)</td><td className='px-4 py-3 text-right'>- {fmtVND(data.insurances?.BHYT)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Bảo hiểm thất nghiệp (1%)</td><td className='px-4 py-3 text-right'>- {fmtVND(data.insurances?.BHTN)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Thu nhập trước thuế</td><td className='px-4 py-3 text-right'>{fmtVND(data.taxableIncomeBeforeDeduction)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Giảm trừ gia cảnh bản thân</td><td className='px-4 py-3 text-right'>- {fmtVND(data.info?.personalDeduction)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Giảm trừ người phụ thuộc</td><td className='px-4 py-3 text-right'>- {fmtVND((data.inputs?.dependents || 0) * (data.info?.dependentDeduction || 0))} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Thu nhập chịu thuế</td><td className='px-4 py-3 text-right'>{fmtVND(data.taxableIncome)} (đ)</td></tr>
            <tr><td className='px-4 py-3'>Thuế thu nhập cá nhân</td><td className='px-4 py-3 text-right'>- {fmtVND(data.incomeTax)} (đ)</td></tr>
            <tr className='bg-blue-50/60'><td className='px-4 py-3 font-semibold'>Lương NET</td><td className='px-4 py-3 text-right font-semibold text-red-600'>{fmtVND(data.netSalary)} (đ)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='border-b bg-white'>
        <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-2 select-none'>
            <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
            <span className='font-semibold text-gray-800'>LaboSupport</span>
          </div>
          <nav className='hidden sm:flex items-center gap-6 text-sm text-gray-600'>
            <a href='/' className='hover:text-gray-900'>Trang chủ</a>
            <a href='/guest-chat' className='hover:text-gray-900'>AI Chat (Khách)</a>
            <a href='/home' className='hover:text-gray-900'>Bảng điều khiển</a>
          </nav>
          <div className='flex items-center gap-3 text-sm'>
            <a href='/login' className='px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700'>Đăng nhập</a>
            <a href='/register' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5'>Đăng ký ngay</a>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-10'>
        <h1 className='text-[28px] md:text-[32px] font-extrabold text-gray-900 mb-1'>Công cụ tính lương Gross sang Net</h1>
        <p className='text-gray-600 mb-5'>Tính lương, thuế và bảo hiểm theo quy định hiện hành</p>

        {/* Tabs */}
        <div className='mb-5 flex gap-2 text-sm'>
          {[
            { id: 'calc', label: 'Tính toán' },
            { id: 'history', label: 'Lịch sử' },
            { id: 'ref', label: 'Tham khảo' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-full border ${tab === t.id ? 'bg-white text-blue-700 border-blue-200 shadow-sm' : 'text-gray-600 border-transparent hover:bg-white'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'calc' && (
          <section className='bg-white rounded-2xl border border-gray-200 p-5 shadow-sm'>
            {error && (
              <div className='mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2'>{error}</div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='text-sm text-gray-700'>Thu nhập của bạn</label>
                <input value={salaryText} onChange={onSalaryChange} placeholder='VD: 10,000,000' className='mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500' />
              </div>

              <div>
                <label className='text-sm text-gray-700'>Số người phụ thuộc</label>
                <input value={dependents} onChange={(e)=> setDependents(e.target.value.replace(/[^\d]/g,''))} placeholder='0' className='mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500' />
              </div>

              <div className='md:col-span-2'>
                <label className='text-sm text-gray-700'>Lương đóng bảo hiểm</label>
                <div className='mt-2 flex flex-wrap items-center gap-5'>
                  <label className='inline-flex items-center gap-2 text-sm'>
                    <input type='radio' name='bhbase' checked={bhBaseType==='official'} onChange={()=> setBhBaseType('official')} /> Trên lương chính thức
                  </label>
                  <label className='inline-flex items-center gap-2 text-sm'>
                    <input type='radio' name='bhbase' checked={bhBaseType==='custom'} onChange={()=> setBhBaseType('custom')} /> Khác
                    <input disabled={bhBaseType!=='custom'} value={bhBaseText} onChange={onBhBaseChange} placeholder='VD: 5,000,000' className='border border-gray-300 rounded px-3 py-1.5 focus:outline-blue-500 disabled:bg-gray-100' />
                  </label>
                </div>
              </div>

              <div className='md:col-span-2'>
                <label className='text-sm text-gray-700 mr-3'>Lương đóng bảo hiểm theo vùng</label>
                <div className='mt-2 flex flex-wrap items-center gap-5'>
                  {regions.map((r) => (
                    <label key={r.code} className='inline-flex items-center gap-2 text-sm'>
                      <input type='radio' name='region' checked={region===r.code} onChange={()=> setRegion(r.code)} /> {r.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='mt-6 flex gap-4'>
              <button disabled={loading} onClick={()=> calculate('grossToNet')} className='bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md px-5 py-2 font-semibold'>
                {loading && mode==='grossToNet' ? 'Đang tính…' : 'GROSS SANG NET'}
              </button>
              <button disabled={loading} onClick={()=> calculate('netToGross')} className='bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md px-5 py-2 font-semibold'>
                {loading && mode==='netToGross' ? 'Đang tính…' : 'NET SANG GROSS'}
              </button>
            </div>

            {result && (
              <>
                <SummaryTable data={{...result, inputs: {dependents: dependentsNumber}}} />
                <DetailTable data={{...result, inputs: {dependents: dependentsNumber}}} />
              </>
            )}
          </section>
        )}

        {tab === 'history' && (
          <section className='bg-white rounded-2xl border border-gray-200 p-5 shadow-sm'>
            <div className='text-sm text-gray-600 mb-3'>Lịch sử tính toán (10 lần gần nhất)</div>
            {history?.length ? (
              <div className='overflow-hidden rounded-xl border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='text-left px-4 py-2'>Thời gian</th>
                      <th className='text-left px-4 py-2'>Kiểu</th>
                      <th className='text-left px-4 py-2'>Vùng</th>
                      <th className='text-right px-4 py-2'>GROSS</th>
                      <th className='text-right px-4 py-2'>NET</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} className='border-t'>
                        <td className='px-4 py-2'>{new Date(h.at).toLocaleString()}</td>
                        <td className='px-4 py-2'>{h.inputs.type || h.inputs?.type}</td>
                        <td className='px-4 py-2'>{h.inputs.region}</td>
                        <td className='px-4 py-2 text-right'>{fmtVND(h.outputs.gross || 0)}</td>
                        <td className='px-4 py-2 text-right'>{fmtVND(h.outputs.net || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='text-gray-500 text-sm'>Chưa có lịch sử tính toán nào</div>
            )}
          </section>
        )}

        {tab === 'ref' && (
          <section className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='bg-white rounded-2xl border border-gray-200 p-5 shadow-sm'>
              <div className='font-semibold text-gray-800 mb-3'>Bảng thuế TNCN năm hiện hành</div>
              <ul className='text-sm text-gray-700 space-y-2'>
                <li>Đến 5 triệu: 5%</li>
                <li>Trên 5 - 10 triệu: 10%</li>
                <li>Trên 10 - 18 triệu: 15%</li>
                <li>Trên 18 - 32 triệu: 20%</li>
                <li>Trên 32 - 52 triệu: 25%</li>
                <li>Trên 52 - 80 triệu: 30%</li>
                <li>Trên 80 triệu: 35%</li>
              </ul>
            </div>
            <div className='bg-white rounded-2xl border border-gray-200 p-5 shadow-sm'>
              <div className='font-semibold text-gray-800 mb-3'>Tỷ lệ bảo hiểm (người lao động)</div>
              <ul className='text-sm text-gray-700 space-y-2'>
                <li>BHXH: 8%</li>
                <li>BHYT: 1.5%</li>
                <li>BHTN: 1%</li>
                <li>Giảm trừ bản thân: 11,000,000 đ/tháng</li>
                <li>Giảm trừ người phụ thuộc: 4,400,000 đ/tháng/người</li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


