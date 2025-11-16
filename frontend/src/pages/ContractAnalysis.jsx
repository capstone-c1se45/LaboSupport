import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { api } from '../lib/api-client.js'; 
import { useNavigate } from 'react-router-dom'; 
import NavbarLogged from '../components/NavbarLogged.jsx';


const UploadIcon = () => <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ExclamationIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ProcessingIcon = () => <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function ContractAnalysis() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Dùng useNavigate thật
  const fileInputRef = useRef(null);

  function formatContractText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")

    .replace(/HỢP ĐỒNG LAO ĐỘNG(.*?)\n/g, "🧾 **HỢP ĐỒNG LAO ĐỘNG$1**\n\n")

    .replace(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM(.*?)\n/g, "**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM$1**\n\n")

    .replace(/(Điều\s+\d+\..*?)\n/g, "\n\n### $1\n\n")

    .replace(/(^|\n)(\d+\.\d+\.\s+)/g, "$1• ")

    .replace(/●\s*/g, "• ")

    .replace(/(Ký tên|ĐẠI DIỆN.*?)\n/g, "_$1_\n");
}


  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoadingContracts(true);
      setError(null);
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) { // Bỏ điều kiện `!api`
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
  const files = Array.from(event.target.files);
  
  let validTypes;
  let errorMsg;

  // Tùy chỉnh loại file hợp lệ dựa trên groupMode
  if (groupMode) {
    validTypes = ["image/png", "image/jpeg"];
    errorMsg = "Chế độ gộp nhóm chỉ chấp nhận .png, .jpg (tối đa 10MB).";
  } else {
    validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    errorMsg = "Chỉ chấp nhận file .pdf, .docx, .png, .jpg (tối đa 10MB mỗi file).";
  }

  const validFiles = files.filter(
    (file) =>
      file.size <= 10 * 1024 * 1024 && validTypes.includes(file.type)
  );

  if (validFiles.length === 0 && files.length > 0) {
    setError(errorMsg);
    setSelectedFiles([]);
    return;
  }

  if (validFiles.length < files.length) {
    setError("Một số file bị loại vì định dạng hoặc dung lượng không hợp lệ.");
  } else {
    setError(null);
  }

  setSelectedFiles(validFiles);
};

 const handleUpload = async () => {
  if (!selectedFiles.length) return;

  setIsUploading(true);
  setUploadProgress(0);
  setError(null);

  try {
    // Nếu bật chế độ gộp nhóm
    if (groupMode) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("contractFiles", file); // backend dùng multer.array("contractFiles")
      });

      const response = await api.post("/contracts/upload-multi", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // --- PHẦN SỬA LỖI (BẮT ĐẦU) ---
      // Backend trả về: { contract_id, file_count, file_names }
      const newContractData = response.data.data;

      // Tạo một đối tượng đầy đủ cho state React
      // Tái tạo lại tên nhóm và thêm 'is_group'
      const newContractForState = {
        contract_id: newContractData.contract_id,
        original_name: `Nhóm hợp đồng: ${selectedFiles[0].name} (+${selectedFiles.length - 1} files)`,
        status: 'PENDING',
        is_group: true, // <-- Đây là trường bị thiếu!
        uploaded_at: new Date().toISOString()
      };

      setContracts((prev) => [newContractForState, ...prev]);
      // --- PHẦN SỬA LỖI (KẾT THÚC) ---

    } else {
      // Logic cũ: upload từng file riêng lẻ
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("contractFile", file);

        const response = await api.post("/contracts/upload", formData, {
          onUploadProgress: (progressEvent) => {
            // ... (giữ nguyên progress logic)
            if (progressEvent.lengthComputable) {
               const percentCompleted = Math.round(
                 (progressEvent.loaded * 100) / progressEvent.total
               );
               setUploadProgress(percentCompleted);
             }
          },
        });

        // --- PHẦN SỬA LỖI (BẮT ĐẦU) ---
        // Backend trả về: { contract_id, fileName, status }
        const newContractData = response.data.data;

        // Chuẩn hóa đối tượng để state nhất quán
        const newContractForState = {
            contract_id: newContractData.contract_id,
            original_name: newContractData.fileName, // Backend trả về 'fileName'
            status: newContractData.status,
            is_group: false, // <-- Thêm để cho rõ ràng
            uploaded_at: new Date().toISOString()
        };

        setContracts((prev) => [newContractForState, ...prev]);
        // --- PHẦN SỬA LỖI (KẾT THÚC) ---
      }
    }

    // Reset sau khi upload xong
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    setError(null);
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
    const currentContract = contracts.find(c => c.contract_id === contractId);
    if (!currentContract) throw new Error("Không tìm thấy hợp đồng để phân tích.");

    const fileName = currentContract.original_name?.toLowerCase() || "";
    console.log("🔍 Đang xác định endpoint cho file:", fileName);

    let endpoint = "";

    // Gọi API backend tự lấy file từ thư mục uploads
    if (
      currentContract.is_group ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      endpoint = `/contracts/${contractId}/analyze-images`;
      console.log("📸 Dùng endpoint phân tích hình ảnh:", endpoint);
    } 
    else if (fileName.endsWith(".pdf") || fileName.endsWith(".docx")) {
      endpoint = `/contracts/${contractId}/analyze`;
      console.log("📄 Dùng endpoint phân tích tài liệu:", endpoint);
    } 
    else {
      throw new Error(`Định dạng file không được hỗ trợ (${fileName})`);
    }

    //Gửi request (backend sẽ tự xử lý file)
    const response = await api.post(endpoint);

    //Tạo kết quả phân tích để lưu lại
    const analysisResult = {
      ...response.data.data,
      processed_at: new Date().toISOString(),
    };

    // Cập nhật danh sách hợp đồng
    setContracts(prev =>
      prev.map(c =>
        c.contract_id === contractId
          ? { ...c, status: "ANALYZED", analysis: analysisResult }
          : c
      )
    );

    // Nếu đang xem hợp đồng này thì cập nhật luôn
    if (selectedContract?.id === contractId) {
      setSelectedContract(prev => ({
        ...prev,
        data: {
          ...(prev.data || {}),
          status: "ANALYZED",
          analysis: analysisResult,
        },
      }));
    }

  } catch (err) {
    console.error("❌ Analysis failed:", err);
    setError(err.response?.data?.message || err.message || "Phân tích thất bại. Vui lòng thử lại.");

    setContracts(prev =>
      prev.map(c =>
        c.contract_id === contractId ? { ...c, status: "ERROR" } : c
      )
    );

    if (selectedContract?.id === contractId) {
      setSelectedContract(prev => ({
        ...prev,
        data: { ...(prev.data || {}), status: "ERROR" },
      }));
    }

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
    <div className='flex h-screen w-full flex-col bg-white'>
     <NavbarLogged />

      <main className='ml-64 p-6  overflow-y-auto'>
        <h1 className='text-2xl font-extrabold text-gray-900'>Phân tích Hợp đồng</h1>
        <p className='text-sm text-gray-600 mb-5'>Tải lên hợp đồng lao động (.pdf, .docx) để AI phân tích.</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">{error}</div>}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
  <label
    htmlFor="contract-upload"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Chọn file hợp đồng (tối đa 10MB):
  </label>

  <div className="flex items-center gap-3">
    <input
      ref={fileInputRef}
      type="file"
      id="contract-upload"
      multiple
      accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
      onChange={handleFileChange}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      disabled={isUploading}
    />

    <button
      onClick={handleUpload}
      disabled={!selectedFiles || isUploading}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      <UploadIcon />{" "}
      {isUploading ? `Đang tải... ${uploadProgress}%` : "Tải lên"}
    </button>
  </div>

  {/* Thêm checkbox gộp nhóm ngay dưới input */}
  <div className="flex items-center mt-3">
    <input
      type="checkbox"
      id="groupMode"
      checked={groupMode}
      onChange={(e) => setGroupMode(e.target.checked)}
      className="mr-2"
    />
    <label htmlFor="groupMode" className="text-sm text-gray-700">
      Gộp nhiều file thành 1 nhóm (1 hợp đồng duy nhất)
    </label>
  </div>

  {isUploading && (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
      <div
        className="bg-blue-600 h-1.5 rounded-full"
        style={{ width: `${uploadProgress}%` }}
      ></div>
    </div>
  )}
</div>

        {/* --- Main Content Grid (Giữ nguyên layout mới của bạn) --- */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          
          {/* Col 1: Contract List */}
          <div className='md:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit max-h-[70vh] overflow-y-auto'>
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
                      <span className='text-sm font-medium text-gray-800 truncate' title={contract.original_name}><DocIcon className="inline w-4 h-4 mr-1 text-gray-400" />{contract.original_name}</span>
                      {(contract.status === 'PENDING' || contract.status?.startsWith?.('ERROR')) && (
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

          {/* --- RIGHT PANE (Details) --- */}
          <div className='md:col-span-2'>
            {selectedContract?.loading ? (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
              </div>
            ) : selectedContract?.data ? (
              // New 2-Column layout for details
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Col 2a: Extracted Content */}
                <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-h-[80vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Nội dung trích xuất</h2>
                  <div className="text-xs text-gray-500 mb-3">Tệp: {selectedContract.data.original_name} | {getStatusComponent(selectedContract.data.status)}</div>

                  {(selectedContract.data.status === 'PENDING' || selectedContract.data.status?.startsWith?.('ERROR')) && (
                    <button
                      onClick={() => handleAnalyze(selectedContract.id)}
                      disabled={isLoadingAnalysis === selectedContract.id}
                      className="mb-4 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {isLoadingAnalysis === selectedContract.id ? 'Đang phân tích...' : 'Phân tích hợp đồng này'}
                    </button>
                  )}
                  {isLoadingAnalysis === selectedContract.id && <p className="text-sm text-blue-500 my-4">AI đang phân tích, vui lòng chờ...</p>}

                  {selectedContract.data.analysis?.extracted_text ? (
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {formatContractText(selectedContract.data.analysis.extracted_text)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-4">
                      {selectedContract.data.status === 'ANALYZED' ? 'Không tìm thấy nội dung trích xuất.' : 'Nội dung sẽ xuất hiện ở đây sau khi phân tích.'}
                    </p>
                  )}
                </div>

                {/* Col 2b: Analysis Boxes */}
                <div className="lg:col-span-1 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                  
                  {/* Box 1: Main Info */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Tóm tắt hợp đồng</h2>
                    {selectedContract.data.analysis?.tomtat ? (
                      <div className="prose prose-slate max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {selectedContract.data.analysis.tomtat}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{selectedContract.data.status === 'ANALYZED' ? 'Không có dữ liệu.' : '... '}</p>
                    )}
                  </div>

                  {/* Box 2: Summary */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Đánh giá quyền lợi và nghĩa vụ của người lao động</h2>
                    {selectedContract.data.analysis?.danhgia ? (
                      <div className="prose prose-slate max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {selectedContract.data.analysis.danhgia}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{selectedContract.data.status === 'ANALYZED' ? 'Không có dữ liệu.' : '... '}</p>
                    )}
                  </div>

                  {/* Box 3: Risks */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Phân Tích Cảnh báo & Rủi ro</h2>
                    {selectedContract.data.analysis?.phantich ? (
                      <div className="prose prose-slate max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {selectedContract.data.analysis.phantich}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{selectedContract.data.status === 'ANALYZED' ? 'Không có dữ liệu.' : '... '}</p>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Đề xuất chỉnh sửa</h2>
                    {selectedContract.data.analysis?.dexuat ? (
                      <div className="prose prose-slate max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {selectedContract.data.analysis.dexuat}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{selectedContract.data.status === 'ANALYZED' ? 'Không có dữ liệu.' : '... '}</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Chọn một hợp đồng từ danh sách bên trái để xem chi tiết.</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}