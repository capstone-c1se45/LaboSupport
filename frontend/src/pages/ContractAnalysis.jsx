import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api-client.js';
import { useNavigate } from 'react-router-dom';

const UploadIcon = () => <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ExclamationIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ProcessingIcon = () => <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function ContractAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoadingContracts(true);
      setError(null);
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await api.get('/contracts');
        setContracts(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching contracts:", err);
        if (err.response?.status === 401) {
          navigate('/login'); // Redirect if unauthorized
        } else {
          setError("Không thể tải danh sách hợp đồng.");
        }
      } finally {
        setIsLoadingContracts(false);
      }
    };
    fetchContracts();
  }, [navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File quá lớn (tối đa 10MB).");
        setSelectedFile(null);
      } else if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError("Chỉ chấp nhận file .pdf hoặc .docx.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    const formData = new FormData();
    formData.append('contractFile', selectedFile);

    try {
      const response = await api.post('/contracts/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      setContracts([response.data.data, ...contracts]);
      setSelectedFile(null); 
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      setError(null); 
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.message || "Upload thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchContractDetails = async (contractId) => {
      setSelectedContract({ id: contractId, loading: true });
      try {
          const response = await api.get(`/contracts/${contractId}`);
          setSelectedContract({ id: contractId, data: response.data.data, loading: false });
      } catch (err) {
          console.error("Error fetching contract details:", err);
          setSelectedContract({ id: contractId, loading: false }); // Stop loading
          setError("Không thể tải chi tiết hợp đồng.");
          if (err.response?.status === 401) navigate('/login');
      }
  };


  const handleAnalyze = async (contractId) => {
    setIsLoadingAnalysis(contractId); 
    setError(null);
    try {
      const response = await api.post(`/contracts/${contractId}/analyze`);
      setContracts(prevContracts =>
        prevContracts.map(c => c.contract_id === contractId ? { ...c, status: 'ANALYZED' } : c)
      );
       if (selectedContract?.id === contractId) {
            setSelectedContract(prev => ({
                ...prev,
                data: {
                    ...(prev.data || {}),
                    status: 'ANALYZED',
                    analysis: { 
                        summary: response.data.data.summary,
                         processed_at: new Date().toISOString()
                    }
                }
            }));
       }


    } catch (err) {
      console.error("Analysis failed:", err);
       setError(err.response?.data?.message || "Phân tích thất bại. Vui lòng thử lại.");
       setContracts(prevContracts =>
         prevContracts.map(c => c.contract_id === contractId ? { ...c, status: 'ERROR' } : c)
       );
       if (selectedContract?.id === contractId) {
           setSelectedContract(prev => ({
               ...prev,
               data: { ...(prev.data || {}), status: 'ERROR' } 
           }));
       }
        if (err.response?.status === 401) navigate('/login');
    } finally {
      setIsLoadingAnalysis(null); 
    }
  };

  const getStatusComponent = (status) => {
      switch (status) {
          case 'PENDING': return <span className="text-xs inline-flex items-center gap-1 text-gray-500"><ClockIcon /> Chờ xử lý</span>;
          case 'ANALYZING': return <span className="text-xs inline-flex items-center gap-1 text-blue-500"><ProcessingIcon /> Đang phân tích</span>;
          case 'ANALYZED': return <span className="text-xs inline-flex items-center gap-1 text-green-500"><CheckCircleIcon /> Đã phân tích</span>;
          case 'ERROR':
          case 'ERROR_AI':
          case 'ERROR_FILE': return <span className="text-xs inline-flex items-center gap-1 text-red-500"><ExclamationIcon /> Lỗi</span>;
          default: return <span className="text-xs text-gray-400">{status}</span>;
      }
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <aside className='fixed h-full w-64 bg-white border-r border-gray-200 flex flex-col'>
          <nav className='flex-1 p-3 text-sm'>
             <a href='/home' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'> Trang Chính</a>
              <a href='/user-chat' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'>🤖 Trợ lý AI</a>
              <a href='/contract-analysis' className='flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium mt-1'><DocIcon/> Phân tích HĐ</a>
              <a href='/profile' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'>👤 Hồ sơ cá nhân</a>
         </nav>
          <div className='border-t p-3'>
            <a href='/logout' className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50'>Đăng xuất</a>
          </div>
      </aside>

      <main className='ml-64 p-6 w-full overflow-y-auto'>
        <h1 className='text-2xl font-extrabold text-gray-900'>Phân tích Hợp đồng</h1>
        <p className='text-sm text-gray-600 mb-5'>Tải lên hợp đồng lao động (.pdf, .docx) để AI phân tích.</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">{error}</div>}

        <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6'>
          <label htmlFor="contract-upload" className="block text-sm font-medium text-gray-700 mb-2">Chọn file hợp đồng (tối đa 10MB):</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              id="contract-upload"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              disabled={isUploading}
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <UploadIcon /> {isUploading ? `Đang tải... ${uploadProgress}%` : 'Tải lên'}
            </button>
          </div>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit'>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Hợp đồng của bạn</h2>
            {isLoadingContracts ? (
              <p className="text-sm text-gray-500">Đang tải danh sách...</p>
            ) : contracts.length === 0 ? (
              <p className="text-sm text-gray-500">Bạn chưa tải lên hợp đồng nào.</p>
            ) : (
              <ul className='space-y-3'>
                {contracts.map(contract => (
                  <li key={contract.contract_id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedContract?.id === contract.contract_id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}
                      onClick={() => fetchContractDetails(contract.contract_id)}>
                    <div className="flex items-center justify-between gap-2">
                         <span className='text-sm font-medium text-gray-800 truncate' title={contract.original_name}><DocIcon className="inline w-4 h-4 mr-1 text-gray-400"/>{contract.original_name}</span>
                         {/* Nút Phân tích chỉ hiện khi status là PENDING hoặc ERROR */}
                         {(contract.status === 'PENDING' || contract.status.startsWith('ERROR')) && (
                             <button
                                 onClick={(e) => { e.stopPropagation(); handleAnalyze(contract.contract_id); }}
                                 disabled={isLoadingAnalysis === contract.contract_id}
                                 className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 whitespace-nowrap"
                             >
                                 {isLoadingAnalysis === contract.contract_id ? '...' : 'Phân tích'}
                             </button>
                         )}
                    </div>
                     <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                             {new Date(contract.uploaded_at).toLocaleDateString('vi-VN')}
                        </span>
                        {getStatusComponent(contract.status)}
                    </div>

                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className='md:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết & Kết quả Phân tích</h2>
            {selectedContract?.loading ? (
              <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
            ) : selectedContract?.data ? (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-1">{selectedContract.data.original_name}</h3>
                 <div className="text-xs text-gray-500 mb-3">Tải lên: {new Date(selectedContract.data.uploaded_at).toLocaleString('vi-VN')} | Trạng thái: {getStatusComponent(selectedContract.data.status)}</div>

                {(selectedContract.data.status === 'PENDING' || selectedContract.data.status.startsWith('ERROR')) && (
                     <button
                        onClick={() => handleAnalyze(selectedContract.id)}
                        disabled={isLoadingAnalysis === selectedContract.id}
                        className="mb-4 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 disabled:opacity-50"
                     >
                        {isLoadingAnalysis === selectedContract.id ? 'Đang phân tích...' : 'Phân tích hợp đồng này'}
                     </button>
                )}

                {isLoadingAnalysis === selectedContract.id && <p className="text-sm text-blue-500 my-4">AI đang phân tích, vui lòng chờ...</p> }

                 {selectedContract.data.analysis ? (
                   <div className="mt-4 prose prose-sm max-w-none">
                       <h4>Tóm tắt và Đánh giá từ AI:</h4>
                       <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">{selectedContract.data.analysis.summary || "Chưa có tóm tắt."}</pre>
                   </div>
                 ) : selectedContract.data.status === 'ANALYZED' ? (
                    <p className="text-sm text-gray-500 mt-4">Không tìm thấy kết quả phân tích đã lưu.</p>
                 ): selectedContract.data.status === 'PENDING' ? (
                     <p className="text-sm text-gray-500 mt-4">Hợp đồng này chưa được phân tích. Nhấn nút "Phân tích" để bắt đầu.</p>
                 ) : selectedContract.data.status.startsWith('ERROR') ? (
                      <p className="text-sm text-red-500 mt-4">Quá trình phân tích trước đó đã gặp lỗi. Vui lòng thử phân tích lại.</p>
                 ) : null }
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn một hợp đồng từ danh sách bên trái để xem chi tiết.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
