import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { api } from '../lib/api-client.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavbarLogged from '../components/NavbarLogged';

const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const FileIcon = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ExclamationIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ProcessingIcon = () => <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const BotIcon = () => <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M15 17h.01M6.343 15.343A8 8 0 1117.657 8.343 8 8 0 016.343 15.343z" /></svg>;
const UserIcon = () => <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SendIcon = () => <svg className='w-5 h-5' fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.172 15V4.602a1 1 0 00-1.144-.988l-2.002.572a.5.5 0 01-.63-.628l2.002-.572a3 3 0 013.431 2.964V15a1 1 0 00.828.995l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShieldCheckIcon = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarningIcon = () => <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const MinusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent; 
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8; 
  }
`;

const FloatingChatWidget = ({ chatMessages, onSend, isLoading, chatInput, setChatInput, isOpen, setIsOpen }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isLoading, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(chatInput);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 z-50 animate-bounce-in"
        title="Chat với AI về hợp đồng này"
      >
        <BotIcon />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[380px] bg-white rounded-t-2xl rounded-bl-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-slide-up transition-all duration-300" style={{ height: '550px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-2xl shadow-sm">
        <div className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           AI Chat - Hợp đồng
        </div>
        <div className="flex gap-1">
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Thu nhỏ">
                <MinusIcon />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatMessages.length === 0 && (
            <div className="text-center text-gray-400 text-xs mt-10">
                <BotIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Hãy hỏi tôi bất kỳ điều gì về hợp đồng này.<br/>
                Ví dụ: "Lương thử việc là bao nhiêu?"
            </div>
        )}
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                <BotIcon />
              </span>
            )}
            <div className={`prose prose-sm max-w-[85%] text-[13px] p-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><BotIcon /></span>
            <div className="p-2 bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t rounded-bl-2xl">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isLoading}
            placeholder="Hỏi, tìm kiếm về hợp đồng..."
            className="flex-1 pl-3 pr-10 py-2.5 text-sm bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
          >
             <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ContractAnalysis() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  function formatContractText(text) {
    if (!text) return "";
    return text.replace(/\n{2,}/g, "\n\n");
  }

  const handleTextHighlight = () => {
    const text = window.getSelection().toString().trim();
    if (text && text.length > 5 && text.length < 500) { 
      setChatInput(`Giải thích điều khoản: "${text}"`);
      setIsChatOpen(true);
    }
  };

  // Load contracts
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
        if (err.response?.status === 401) navigate('/login');
        else setError("Không thể tải danh sách hợp đồng.");
      } finally {
        setIsLoadingContracts(false);
      }
    };
    fetchContracts();
  }, [navigate]);

  // Load contract detail from URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && !selectedContract && contracts.length > 0) {
        fetchContractDetails(id);
    }
  }, [searchParams, contracts]);

  // --- Hàm xóa hợp đồng ---
  const handleDeleteContract = async (e, contractId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (gây chọn hợp đồng)
    if (!window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) return;

    try {
        await api.delete(`/contracts/${contractId}`);
        
        // Cập nhật danh sách local
        setContracts(prev => prev.filter(c => c.contract_id !== contractId));
        
        // Nếu đang xem hợp đồng bị xóa thì reset
        if (selectedContract?.id === contractId) {
            setSelectedContract(null);
            setChatMessages([]);
            setSearchParams({}); // Xóa query param trên URL
        }
    } catch (err) {
        console.error("Failed to delete contract:", err);
        alert(err.response?.data?.message || "Lỗi khi xóa hợp đồng.");
    }
  };
  // --------------------------------

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    let validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    
    if (groupMode) validTypes = ["image/png", "image/jpeg"];

    const validFiles = files.filter(
      (file) => file.size <= 10 * 1024 * 1024 && validTypes.includes(file.type)
    );

    if (validFiles.length === 0 && files.length > 0) {
      alert("File không hợp lệ. Vui lòng kiểm tra định dạng và dung lượng (max 10MB).");
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
    try {
      if (groupMode) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("contractFiles", file));
        
        const response = await api.post("/contracts/upload-multi", formData, {
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
        });
        
        const newContractData = { 
            ...response.data.data, 
            original_name: `Nhóm HĐ: ${selectedFiles[0].name} (+${selectedFiles.length - 1})`, 
            is_group: true,
            status: 'PENDING',
            uploaded_at: new Date().toISOString()
        };
        setContracts((prev) => [newContractData, ...prev]);
      } else {
        for (let i = 0; i < selectedFiles.length; i++) {
            const formData = new FormData();
            formData.append("contractFile", selectedFiles[i]);
            const response = await api.post("/contracts/upload", formData, {
               onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
            });
            const newContractData = { 
                ...response.data.data, 
                original_name: response.data.data.fileName, 
                is_group: false,
                status: 'PENDING',
                uploaded_at: new Date().toISOString()
            };
            setContracts((prev) => [newContractData, ...prev]);
        }
      }
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Tải lên thành công!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Upload thất bại.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchContractDetails = async (contractId) => {
    setSelectedContract({ id: contractId, loading: true });
    setError(null);
    setChatMessages([]);
    setChatInput("");
    setIsChatOpen(false);
    
    setSearchParams({ id: contractId });
    
    try {
      const response = await api.get(`/contracts/${contractId}`);
      const contractData = response.data.data;
      setSelectedContract({ id: contractId, data: contractData, loading: false });
      setChatMessages(contractData.analysis?.chat_history || []);
    } catch (err) {
      setSelectedContract({ id: contractId, loading: false });
      console.error("Fetch detail error", err);
    }
  };

  const handleAnalyze = async (contractId) => {
    setIsLoadingAnalysis(contractId);
    try {
      const currentContract = contracts.find(c => c.contract_id === contractId) || selectedContract?.data;
      const fileName = currentContract.original_name?.toLowerCase() || "";
      let endpoint = "";
      if (currentContract.is_group || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
        endpoint = `/contracts/${contractId}/analyze-images`;
      } else if (fileName.endsWith(".pdf") || fileName.endsWith(".docx")) {
        endpoint = `/contracts/${contractId}/analyze`;
      } else {
        throw new Error(`Định dạng file không được hỗ trợ (${fileName})`);
      }
      const response = await api.post(endpoint);
      const analysisResult = {
        ...response.data.data,
        processed_at: new Date().toISOString(),
      };
      setContracts(prev =>
        prev.map(c =>
          c.contract_id === contractId
            ? { ...c, status: "ANALYZED", analysis: analysisResult }
            : c
        )
      );
      if (selectedContract?.id === contractId) {
        setSelectedContract(prev => ({
          ...prev,
          data: { ...(prev.data || {}), status: "ANALYZED", analysis: analysisResult },
        }));
        setChatMessages([]);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.message || err.message || "Phân tích thất bại.");
      setContracts(prev => prev.map(c => c.contract_id === contractId ? { ...c, status: "ERROR" } : c));
      if (selectedContract?.id === contractId) {
        setSelectedContract(prev => ({ ...prev, data: { ...(prev.data || {}), status: "ERROR" } }));
      }
    } finally {
      setIsLoadingAnalysis(null);
    }
  };

  const handleSendContractChat = async (messageToSend) => {
    const trimmedInput = messageToSend.trim();
    if (!trimmedInput || isChatLoading || !selectedContract?.id) return;
    
    setIsChatLoading(true);
    const userMessage = { role: 'user', content: trimmedInput };
    const currentHistory = [...chatMessages]; 
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await api.post('/ai/contract-chat', {
        prompt: trimmedInput,
        contract_id: selectedContract.id,
        chat_history: currentHistory 
      });
      setChatMessages(prev => [...prev, { role: 'ai', content: response.data.data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Lỗi kết nối AI." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getStatusColor = (status) => {
     if (status === 'ANALYZED') return 'text-green-600 bg-green-50 border-green-200';
     if (status === 'ANALYZING') return 'text-blue-600 bg-blue-50 border-blue-200';
     if (status?.startsWith('ERROR')) return 'text-red-600 bg-red-50 border-red-200';
     return 'text-gray-600 bg-gray-50 border-gray-200';
  }

  return (
    /* --- FIX 1: Đổi min-h-screen thành h-screen để chặn scroll toàn trang --- */
    <div className="h-screen bg-[#F5F8FB] flex flex-col overflow-hidden">
      <style>{customScrollbarStyle}</style>
      <NavbarLogged />

      <div className='flex flex-1 overflow-hidden relative'>
        {/* Sidebar Trái */}
        <aside 
            className={`bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col z-20 absolute h-full md:relative shadow-xl md:shadow-none ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0 md:w-0 overflow-hidden'}`}
        >
            <div className="h-14 border-b flex items-center justify-between px-4 bg-gray-50/50 shrink-0">
                <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FileIcon /></span>
                    Hợp đồng của bạn
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:bg-gray-200 rounded p-1">
                    <CloseIcon />
                </button>
            </div>

            {/* Upload Area */}
            <div className="p-4 border-b bg-white shrink-0">
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                />
                <button 
                    onClick={() => fileInputRef.current.click()} 
                    disabled={isUploading}
                    className="w-full py-2.5 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                >
                    {isUploading ? <ProcessingIcon /> : <UploadIcon />}
                    {isUploading ? `Đang tải ${uploadProgress}%` : "Tải hợp đồng mới"}
                </button>
                
                <div className="flex items-center mt-2 gap-2 px-1 cursor-pointer" onClick={() => setGroupMode(!groupMode)}>
                    <input 
                        type="checkbox" 
                        id="groupMode" 
                        checked={groupMode} 
                        onChange={(e) => setGroupMode(e.target.checked)} 
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                    />
                    <label htmlFor="groupMode" className="text-xs text-gray-600 cursor-pointer select-none pointer-events-none">
                        Gộp nhiều file ảnh thành 1 HĐ
                    </label>
                </div>

                {selectedFiles.length > 0 && (
                    <button onClick={handleUpload} className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
                        Xác nhận tải lên ({selectedFiles.length})
                    </button>
                )}
            </div>

            {/* Danh sách hợp đồng */}
            {/* --- FIX 2: Thêm min-h-0 để overflow-y-auto hoạt động đúng trong flex --- */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0">
                {contracts.map(c => (
                    <div 
                        key={c.contract_id} 
                        onClick={() => fetchContractDetails(c.contract_id)}
                        className={`p-3 rounded-xl cursor-pointer border transition-all group relative ${selectedContract?.id === c.contract_id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                        <div className="font-medium text-sm text-gray-800 truncate mb-1 pr-6 group-hover:text-blue-700" title={c.original_name}>{c.original_name}</div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">{new Date(c.uploaded_at).toLocaleDateString('vi-VN')}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                                {c.status === 'PENDING' ? 'Chờ xử lý' : c.status === 'ANALYZED' ? 'Đã xong' : 'Đang chạy'}
                            </span>
                        </div>

                        {/* Nút Xóa (Hiện khi hover) */}
                        <button
                            onClick={(e) => handleDeleteContract(e, c.contract_id)}
                            className="absolute top-3 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-transparent hover:border-gray-200"
                            title="Xóa hợp đồng"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-gray-50">
            {/* Header ToolBar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    {!isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Hiện danh sách">
                            <MenuIcon />
                        </button>
                    )}
                    <h1 className="text-lg font-bold text-gray-800 truncate max-w-md hidden sm:block">
                        {selectedContract?.data?.original_name || "Chi tiết hợp đồng"}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    {selectedContract?.data?.status === 'ANALYZED' && (
                        <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                            Xuất dữ liệu
                        </button>
                    )}
                    {(selectedContract?.data?.status === 'PENDING' || selectedContract?.data?.status?.startsWith('ERROR')) && (
                        <button 
                            onClick={() => handleAnalyze(selectedContract.id)}
                            disabled={isLoadingAnalysis === selectedContract.id}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingAnalysis === selectedContract.id ? <ProcessingIcon /> : <ClockIcon />}
                            {isLoadingAnalysis === selectedContract.id ? 'Đang xử lý...' : 'Phân tích ngay'}
                        </button>
                    )}
                </div>
            </header>

            {/* Content Canvas */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 relative" onMouseUp={handleTextHighlight}>
                {selectedContract?.loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                        Đang tải dữ liệu...
                    </div>
                ) : !selectedContract?.data ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
                        <FileIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">Chưa chọn hợp đồng nào</p>
                        <p className="text-sm mt-1">Vui lòng chọn một hợp đồng từ danh sách bên trái để xem chi tiết.</p>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20"> 
                        {/* Left Column: Contract Content */}
                        <div className="xl:col-span-7 flex flex-col gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[800px] p-8 md:p-10 relative">
                                <div className="absolute top-4 left-8 flex items-center gap-2 text-gray-400 text-sm select-none font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Nội dung trích xuất
                                </div>
                                
                                <div className="mt-8 prose prose-slate max-w-none text-sm leading-relaxed text-gray-800 font-normal">
                                    {selectedContract.data.analysis?.extracted_text ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                            {formatContractText(selectedContract.data.analysis.extracted_text)}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="text-center py-20 text-gray-400 italic">
                                            Chưa có nội dung. Vui lòng nhấn "Phân tích ngay".
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Analysis Cards */}
                        <div className="xl:col-span-5 flex flex-col gap-5">
                            {/* Card 1: Tóm tắt */}
                            <div className="bg-cyan-50 rounded-xl border border-cyan-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-cyan-800 mb-3 text-base">
                                    <InfoIcon /> Tóm tắt hợp đồng
                                </div>
                                <div className="prose prose-sm max-w-none text-cyan-900/80 text-sm">
                                    {selectedContract.data.analysis?.tomtat ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedContract.data.analysis.tomtat}</ReactMarkdown>
                                    ) : "Chưa có dữ liệu."}
                                </div>
                            </div>

                            {/* Card 2: Quyền lợi & Nghĩa vụ */}
                            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-blue-800 mb-3 text-base">
                                    <ShieldCheckIcon /> Quyền lợi & Nghĩa vụ
                                </div>
                                <div className="prose prose-sm max-w-none text-blue-900/80 text-sm">
                                    {selectedContract.data.analysis?.danhgia ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedContract.data.analysis.danhgia}</ReactMarkdown>
                                    ) : "Chưa có dữ liệu."}
                                </div>
                            </div>

                            {/* Card 3: Cảnh báo rủi ro */}
                            <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-amber-800 mb-3 text-base">
                                    <WarningIcon /> Cảnh báo rủi ro
                                </div>
                                <div className="prose prose-sm max-w-none text-amber-900/80 text-sm">
                                    {selectedContract.data.analysis?.phantich ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedContract.data.analysis.phantich}</ReactMarkdown>
                                    ) : "Chưa có dữ liệu."}
                                </div>
                            </div>
                            
                            {/* Card 4: Đề xuất */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-gray-800 mb-3 text-base">
                                    💡 Đề xuất chỉnh sửa
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600 text-sm">
                                    {selectedContract.data.analysis?.dexuat ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedContract.data.analysis.dexuat}</ReactMarkdown>
                                    ) : "Chưa có dữ liệu."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Chat */}
            {selectedContract?.data && (
                <FloatingChatWidget
                    contractId={selectedContract.id}
                    chatMessages={chatMessages}
                    onSend={handleSendContractChat}
                    isLoading={isChatLoading}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    isOpen={isChatOpen}
                    setIsOpen={setIsChatOpen}
                />
            )}

        </div>
      </div>
    </div>
  );
}