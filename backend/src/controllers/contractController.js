import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; 
import axios from 'axios';
import FormData from 'form-data';
import { contractModel } from '../models/contract.js';
import { contractOcrModel } from '../models/contractOcr.js';
import responseHandler from "../utils/response.js";
import dotenvFlow from "dotenv-flow";


dotenvFlow.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'contracts'); // Thư mục lưu trữ file tạm

// Đảm bảo thư mục upload tồn tại
const ensureUploadDirExists = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ensured: ${UPLOAD_DIR}`);
  } catch (err) {
    console.error('Error creating upload directory:', err);
  }
};
// Gọi ngay để tạo thư mục khi khởi động
ensureUploadDirExists(); 

// Sử dụng lại diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR); // Lưu vào thư mục uploads/contracts
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: userId_timestamp_originalname
    const userId = req.user?.user_id || 'guest';
    const uniqueSuffix = `${userId}_${Date.now()}`;
    const extension = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, extension)}_${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận file pdf và docx
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file .pdf hoặc .docx'), false);
  }
};

const upload = multer({
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
}).single('contractFile'); 

export const contractController = {
 
  async uploadContract(req, res) {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return responseHandler.badRequest(res, `Lỗi upload: ${err.message}`);
      } else if (err) {
        console.error("Upload error:", err);
        return responseHandler.badRequest(res, err.message || "Lỗi không xác định khi upload.");
      }

      if (!req.file) {
        return responseHandler.badRequest(res, 'Vui lòng chọn file hợp đồng để upload.');
      }

      const userId = req.user?.user_id;
      if (!userId) {
        // Xóa file đã tải lên nếu user không hợp lệ
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error deleting file after auth error:", e); }
        return responseHandler.unauthorized(res, "Yêu cầu đăng nhập để upload.");
      }

      try {
        // Lưu thông tin vào DB với đường dẫn file cục bộ
        const result = await contractModel.createContract(userId, req.file.path, req.file.originalname);
        console.log(`Contract uploaded for user ${userId}: ${req.file.originalname} -> ${req.file.path}`);
        return responseHandler.created(res, "Upload hợp đồng thành công.", {
          contract_id: result.contract_id,
          fileName: req.file.originalname,
          status: 'PENDING'
        });
      } catch (dbError) {
        console.error("Database error after upload:", dbError);
        // Xóa file đã tải lên nếu lưu DB lỗi
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error deleting file after db error:", e); }
        return responseHandler.internalServerError(res, "Lỗi khi lưu thông tin hợp đồng.");
      }
    });
  },

  /**
   * Lấy danh sách hợp đồng của người dùng
   */
  async listContracts(req, res) {
    const userId = req.user?.user_id;
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    try {
      const contracts = await contractModel.getContractsByUserId(userId);
      return responseHandler.success(res, "Lấy danh sách hợp đồng thành công.", contracts);
    } catch (error) {
       console.error("Error listing contracts:", error);
      return responseHandler.internalServerError(res, "Lỗi khi lấy danh sách hợp đồng.");
    }
  },

  /**
   * Lấy chi tiết hợp đồng và kết quả phân tích (nếu có)
   */
   async getContractDetails(req, res) {
     const userId = req.user?.user_id;
     const { id: contractId } = req.params;
     if (!userId) {
       return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
     }
     try {
       const contract = await contractModel.getContractById(contractId, userId);
       if (!contract) {
         return responseHandler.notFound(res, "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập.");
       }

       const ocrResult = await contractOcrModel.getOcrResultByContractId(contractId);
       return responseHandler.success(res, "Lấy chi tiết hợp đồng thành công.", {
         ...contract,
         analysis: ocrResult
       });
     } catch (error) {
        console.error("Error getting contract details:", error);
       return responseHandler.internalServerError(res, "Lỗi khi lấy chi tiết hợp đồng.");
     }
   },


  /**
   * Kích hoạt phân tích hợp đồng (đọc file cục bộ)
   */
  async analyzeContract(req, res) {
    const userId = req.user?.user_id;
    const { id: contractId } = req.params;

    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }

    let contract; // Khai báo ở ngoài để có thể dùng trong finally
    try {
      // 1. Lấy thông tin hợp đồng từ DB
      contract = await contractModel.getContractById(contractId, userId);
      if (!contract) {
        return responseHandler.notFound(res, "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập.");
      }
      if (contract.status === 'ANALYZING') {
         return responseHandler.badRequest(res, "Hợp đồng đang được phân tích.");
      }
      if (!contract.file_path) {
         await contractModel.updateContractStatus(contractId, 'ERROR_FILE');
         return responseHandler.internalServerError(res, "Không tìm thấy đường dẫn file hợp đồng.");
      }

      // 2. Đọc file từ đường dẫn cục bộ
      let fileBuffer;
      try {
        console.log(`Reading local file: ${contract.file_path}`);
        fileBuffer = await fs.readFile(contract.file_path);
        console.log(`Read ${fileBuffer.length} bytes from local file.`);
      } catch (readError) {
        console.error(`Local file not found or unreadable: ${contract.file_path}`, readError);
        await contractModel.updateContractStatus(contractId, 'ERROR_FILE'); // Cập nhật trạng thái lỗi file
        return responseHandler.internalServerError(res, "Không thể đọc file hợp đồng đã upload.");
      }

      // 3. Cập nhật trạng thái sang ANALYZING
      await contractModel.updateContractStatus(contractId, 'ANALYZING');

      // 4. Chuẩn bị dữ liệu và gọi AI Service
      const formData = new FormData();
      const safeOriginalName = contract.original_name.replace(/[^\w\.\-\s]/g, '_');
      formData.append('file', fileBuffer, {
          filename: safeOriginalName, // Quan trọng để AI service biết loại file
          contentType: path.extname(contract.original_name).toLowerCase() === '.pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });


      console.log(`Sending file buffer to AI service for analysis: ${contract.original_name}`);
      // Gọi AI service bằng axios
      let aiResponse;
      try {
          aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze_contract`, formData, {
              headers: {
                  ...formData.getHeaders()
              },
              timeout: 180000 // 3 phút
          });
          console.log(`AI service response received for: ${contract.original_name}`);
      } catch (aiError) {
          console.error("Error calling AI service:", aiError?.response?.data || aiError.message);
          await contractModel.updateContractStatus(contractId, 'ERROR_AI');
          const aiErrorMessage = aiError?.response?.data?.detail || "Lỗi từ dịch vụ AI.";
          return responseHandler.internalServerError(res, aiErrorMessage);
      }

      // 5. Lưu kết quả và cập nhật trạng thái
      const analysisResult = aiResponse.data?.summary || "";
      await contractOcrModel.saveOcrResult(contractId, "" /* extractedText */, analysisResult);
      await contractModel.updateContractStatus(contractId, 'ANALYZED');

      // 6. Trả kết quả về client
      return responseHandler.success(res, "Phân tích hợp đồng thành công.", {
        contract_id: contractId,
        summary: analysisResult
      });

    } catch (error) {
      console.error("Error during analysis trigger:", error);
      // Cập nhật trạng thái lỗi chung nếu các bước trên bị lỗi
      if (contractId) { // Chỉ cập nhật nếu đã lấy được contractId
         try { await contractModel.updateContractStatus(contractId, 'ERROR'); } catch(e){ console.error("Failed to update status to ERROR:", e); }
      }
      return responseHandler.internalServerError(res, "Đã có lỗi xảy ra trong quá trình phân tích.");
    }
  },
};

