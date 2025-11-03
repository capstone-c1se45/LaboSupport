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
ensureUploadDirExists(); // Gọi hàm khi khởi động server

// Sử dụng lại diskStorage (cho PDF/DOCX)
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
  storage: storage, // Sử dụng diskStorage
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
}).single('contractFile'); // Tên field trong form data phải là 'contractFile'
// -----------------------

// --- Thêm Multer mới cho Images (dùng MemoryStorage) ---
const imageStorage = multer.memoryStorage(); // Dùng memory
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { // Chấp nhận bất kỳ loại ảnh nào
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, png, etc.)'), false);
  }
};

/**
 * Middleware Multer cho upload ảnh (lên đến 10 ảnh)
 */
const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 } // Tối đa 10MB/file, 10 files
}).array('contractImages', 10); // Tên field frontend gửi lên là 'contractImages'
// ---------------------------------------------------


export const contractController = {
  /**
   * Xử lý upload file hợp đồng (Lưu cục bộ)
   */
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

  let contract;
  try {
    // 1. Lấy hợp đồng
    contract = await contractModel.getContractById(contractId, userId);
    if (!contract) {
      return responseHandler.notFound(res, "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập.");
    }
    if (contract.status === "ANALYZING") {
      return responseHandler.badRequest(res, "Hợp đồng đang được phân tích.");
    }
    if (!contract.file_path) {
      await contractModel.updateContractStatus(contractId, "ERROR_FILE");
      return responseHandler.internalServerError(res, "Không tìm thấy đường dẫn file hợp đồng.");
    }

    // 2. Đọc file
    let fileBuffer;
    try {
      console.log(`Reading local file: ${contract.file_path}`);
      fileBuffer = await fs.readFile(contract.file_path);
    } catch (readError) {
      console.error("Local file not found:", readError);
      await contractModel.updateContractStatus(contractId, "ERROR_FILE");
      return responseHandler.internalServerError(res, "Không thể đọc file hợp đồng đã upload.");
    }

    // 3. Cập nhật trạng thái sang ANALYZING
    await contractModel.updateContractStatus(contractId, "ANALYZING");

    // 4. Gửi đến AI service
    const formData = new FormData();
    const safeOriginalName = contract.original_name.replace(/[^\w\.\-\s]/g, "_");
    formData.append("file", fileBuffer, {
      filename: safeOriginalName,
      contentType:
        path.extname(contract.original_name).toLowerCase() === ".pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    let aiResponse;
    try {
      aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze_contract`, formData, {
        headers: formData.getHeaders(),
        timeout: 180000,
      });
    } catch (aiError) {
      console.error("Error calling AI service:", aiError?.response?.data || aiError.message);
      await contractModel.updateContractStatus(contractId, "ERROR_AI");
      const msg = aiError?.response?.data?.detail || "Lỗi từ dịch vụ AI.";
      return responseHandler.internalServerError(res, msg);
    }

    // 5. Xử lý dữ liệu phân tích
    const fullSummary = aiResponse.data?.summary || "";

    // 🧩 Tách nội dung từng phần
    const extractSection = (text, titleStart) => {
  const regex = new RegExp(
    `###\\s*\\d+\\.\\s*${titleStart}[\\s\\S]*?(?=###\\s*\\d+\\.\\s*|$)`,
    "i"
  );
  const match = text.match(regex);
  return match ? match[0].trim() : "";
};

const tomTat = extractSection(fullSummary, "1. Tóm tắt nội dung");
const danhGia = extractSection(fullSummary, "Đánh giá Quyền lợi");
const phanTich = extractSection(fullSummary, "Phân tích các điều khoản ");
const deXuat = extractSection(fullSummary, "Đề xuất chỉnh sửa");

    // 6. Lưu kết quả
    await contractOcrModel.saveOcrResult(contractId, "", fullSummary, tomTat, danhGia, phanTich, deXuat);
    await contractModel.updateContractStatus(contractId, "ANALYZED");

    // 7. Trả kết quả chi tiết cho client
    return responseHandler.success(res, "Phân tích hợp đồng thành công.", {
      contract_id: contractId,
      summary: fullSummary,
      tomtat: tomTat,
      danhgia: danhGia,
      phantich: phanTich,
      dexuat: deXuat,
    });
  } catch (error) {
    console.error("Error during analysis trigger:", error);
    if (contractId) {
      try {
        await contractModel.updateContractStatus(contractId, "ERROR");
      } catch (e) {
        console.error("Failed to update status to ERROR:", e);
      }
    }
    return responseHandler.internalServerError(res, "Đã có lỗi xảy ra trong quá trình phân tích.");
  }
}
,

  /**
   * Xử lý upload ảnh, OCR và phân tích
   */
  async analyzeContractImages(req, res) {
    // 1. Dùng middleware 'uploadImages' để xử lý file
    uploadImages(req, res, async (err) => {
      // Xử lý lỗi Multer
      if (err instanceof multer.MulterError) {
        console.error("Multer (image) error:", err);
        return responseHandler.badRequest(res, `Lỗi upload ảnh: ${err.message}. Giới hạn 10 file, 10MB/file.`);
      } else if (err) {
        console.error("Image fileFilter error:", err);
        return responseHandler.badRequest(res, err.message || "Lỗi không xác định khi upload ảnh.");
      }
      
      // Kiểm tra có file không
      if (!req.files || req.files.length === 0) {
        return responseHandler.badRequest(res, 'Vui lòng chọn ít nhất một file ảnh.');
      }

      // 2. Kiểm tra xác thực user
      const userId = req.user?.user_id;
      if (!userId) {
        return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
      }

      let newContractId = null; // Biến để lưu ID hợp đồng mới

      try {
        // 3. Chuẩn bị FormData để gửi đến AI Service
        const formData = new FormData();
        for (const file of req.files) {
          formData.append('files', file.buffer, { // 'files' phải khớp với tên FastAPI mong đợi
            filename: file.originalname,
            contentType: file.mimetype
          });
        }

        // 4. Gọi AI Service (endpoint /ocr)
        console.log(`Sending ${req.files.length} images to AI service (/ocr) for user ${userId}...`);
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/ocr`, formData, {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 300000 // 5 phút (cho phép OCR nhiều ảnh)
        });

        // 5. Nhận kết quả từ AI Service
        const { ocr_text, analysis, pdf_path } = aiResponse.data;
        
        if (!analysis || !ocr_text) {
           return responseHandler.internalServerError(res, "Dịch vụ AI không trả về kết quả phân tích hoặc văn bản.");
        }

        // 6. Lưu kết quả vào DB
        // Tạo một bản ghi Contract mới cho lần phân tích ảnh này
        const originalName = `Phân tích từ ảnh: ${req.files[0].originalname}` + (req.files.length > 1 ? ` (+${req.files.length - 1} ảnh)` : '');
        
        // Sử dụng pdf_path (nếu AI service trả về) hoặc 1 placeholder
        // Giả sử pdf_path là đường dẫn file (cục bộ hoặc cloud) mà AI service tạo ra
        // Nếu không, ta lưu 1 đường dẫn giả lập vì cột file_path là NOT NULL
        const filePath = pdf_path || `ocr_generated/${userId}/${Date.now()}_ocr_result.pdf`; 

        const contractRecord = await contractModel.createContract(userId, filePath, originalName);
        newContractId = contractRecord.contract_id;

        // Cập nhật trạng thái là đã phân tích ngay lập tức
        await contractModel.updateContractStatus(newContractId, 'ANALYZED');

        // Lưu kết quả OCR/Analysis vào bảng riêng
        await contractOcrModel.saveOcrResult(newContractId, ocr_text, analysis);

        // 7. Trả kết quả về client
        return responseHandler.created(res, "Phân tích ảnh thành công.", {
          contract_id: newContractId,
          ocr_text: ocr_text,
          analysis: analysis,
          pdf_path: pdf_path // Trả về pdf_path (nếu có)
        });

      } catch (error) {
        console.error("Error in analyzeContractImages:", error?.response?.data || error.message);
        
        // Nếu đã tạo contract record nhưng bước sau lỗi (vd: lưu OCR), cập nhật status lỗi
        if (newContractId) {
           try {
              await contractModel.updateContractStatus(newContractId, 'ERROR_AI');
           } catch (e) { console.error("Failed to update status to ERROR after fail:", e); }
        }
        
        const aiErrorMessage = error?.response?.data?.detail || "Lỗi khi gọi dịch vụ AI (OCR).";
        return responseHandler.internalServerError(res, aiErrorMessage);
      }
    });
  }
};

