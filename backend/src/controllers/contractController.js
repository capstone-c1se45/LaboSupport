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


const extractSection = (text, titleStart) => {
  const regex = new RegExp(
    `###\\s*\\d+\\.\\s*${titleStart}[\\s\\S]*?(?=###\\s*\\d+\\.\\s*|$)`,
    "i"
  );
  const match = text.match(regex);
  return match ? match[0].trim() : "";
};

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
  // Chấp nhận file pdf, docx và các định dạng ảnh
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file .pdf, .docx hoặc ảnh (jpg, png, gif)'), false);
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

 // Dán code này vào file backend/src/controllers/contractController.js
// Hãy XÓA hàm uploadMultiContracts cũ và thay bằng hàm này

async uploadMultiContracts(req, res) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập để upload.");
    }

    // 1. Dùng memoryStorage để xử lý file sau khi có contractId
    const multiUpload = multer({
      storage: multer.memoryStorage(), // <-- Giữ file trong RAM
      fileFilter, // (Giữ nguyên fileFilter của bạn)
      limits: { fileSize: 10 * 1024 * 1024, files: 20 },
    }).array("contractFiles", 20);

    multiUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return responseHandler.badRequest(res, `Lỗi upload: ${err.message}`);
      } else if (err) {
        console.error("Upload error:", err);
        return responseHandler.badRequest(res, err.message || "Lỗi không xác định khi upload.");
      }

      if (!req.files || req.files.length === 0) {
        return responseHandler.badRequest(res, "Không có file nào được upload.");
      }

      let contractId;
      try {
        // 2. TẠO CONTRACT TẠM ĐỂ LẤY ID
        const placeholderName = `Nhóm hợp đồng tạm - ${Date.now()}`;
        const tempRecord = await contractModel.createContract(userId, "", placeholderName);
        contractId = tempRecord.contract_id;

        // 3. TẠO THƯ MỤC RIÊNG CHO CONTRACT NÀY
        const contractDir = path.join(UPLOAD_DIR, contractId.toString());
        await fs.mkdir(contractDir, { recursive: true });

        // 4. LƯU TỪNG FILE VÀO THƯ MỤC RIÊNG
        const savedPaths = [];
        for (const file of req.files) {
          const safeName = `${Date.now()}_${Math.round(Math.random() * 1E6)}_${Buffer.from(file.originalname, 'latin1').toString('utf8')}`;
          const dest = path.join(contractDir, safeName);
          
          await fs.writeFile(dest, file.buffer);
          savedPaths.push(dest);
        }

        // 5. CẬP NHẬT LẠI CONTRACT VỚI THÔNG TIN ĐÚNG
        const filePathJson = JSON.stringify(savedPaths); // Lưu dạng JSON
        const groupName = `Nhóm hợp đồng: ${req.files[0].originalname} (+${req.files.length - 1} files)`;

        // --- ĐÂY LÀ PHẦN THAY ĐỔI ---
        // Gọi hàm mới mà bạn vừa thêm vào model
        await contractModel.updateContractDetails(contractId, {
          filePath: filePathJson,
          originalName: groupName,
          status: 'PENDING' // Đặt trạng thái PENDING
        });
        // --- KẾT THÚC THAY ĐỔI ---

        return responseHandler.created(res, "Upload nhóm hợp đồng thành công.", {
          contract_id: contractId,
          file_count: req.files.length,
          file_names: req.files.map(f => f.originalname),
        });

      } catch (dbError) {
        console.error("Error processing files after upload:", dbError);
        if (contractId) {
          // (Tùy chọn: Xóa contract tạm nếu lỗi)
          // await contractModel.deleteContract(contractId).catch(delErr => console.error("Failed to delete temp contract", delErr));
        }
        return responseHandler.internalServerError(res, "Lỗi khi xử lý file sau khi upload.");
      }
    });

  } catch (error) {
    console.error("Error in uploadMultiContracts setup:", error);
    return responseHandler.internalServerError(res, "Lỗi khi upload nhóm hợp đồng.");
  }
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

    // 2a. Chuyển file thành text UTF-8 (tiếng Việt)
    // Nếu file PDF/DOCX, bạn cần dùng thư viện parse text (ví dụ pdf-parse, mammoth) 
    // Dưới đây ví dụ file text thuần:

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
    const fileText = aiResponse.data?.content || "";

    const tomTat = extractSection(fullSummary, "Tóm tắt nội dung");
    const danhGia = extractSection(fullSummary, "Đánh giá Quyền lợi");
    const phanTich = extractSection(fullSummary, "Phân tích các điều khoản");
    const deXuat = extractSection(fullSummary, "Đề xuất chỉnh sửa");

    console.log("Extracted Sections:", { tomTat, danhGia, phanTich, deXuat });

    // 6. Lưu kết quả: lưu trực tiếp text tiếng Việt vào file_content
    await contractOcrModel.saveOcrResult(
      contractId, 
      fileText,
      fullSummary,
      tomTat,
      danhGia,
      phanTich,
      deXuat
    );
    await contractModel.updateContractStatus(contractId, "ANALYZED");

    // 7. Trả kết quả chi tiết cho client
    return responseHandler.success(res, "Phân tích hợp đồng thành công.", {
      contract_id: contractId,
      extracted_text: fileText,
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
    const userId = req.user?.user_id;
    const { id: contractId } = req.params;

    if (!userId) return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");

    let contract;
    try {
      // 1. LẤY HỢP ĐỒNG
      contract = await contractModel.getContractById(contractId, userId);
      if (!contract) return responseHandler.notFound(res, "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập.");
      if (contract.status === "ANALYZING") {
        return responseHandler.badRequest(res, "Hợp đồng đang được phân tích.");
      }

      // 2. ĐỌC VÀ PARSE FILE_PATH TỪ JSON
      let imagePaths = [];
      if (!contract.file_path) {
        await contractModel.updateContractStatus(contractId, "ERROR_FILE");
        return responseHandler.badRequest(res, "Không có file lưu trữ cho hợp đồng này.");
      }

      try {
        imagePaths = JSON.parse(contract.file_path);
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
          throw new Error("File path is not a valid list.");
        }
      } catch (e) {
        console.error("Error parsing file_path JSON:", e);
        // Có thể kiểm tra nếu nó là file đơn lẻ (logic cũ)
        if (typeof contract.file_path === 'string' && /\.(png|jpg|jpeg)$/i.test(contract.file_path)) {
            imagePaths = [contract.file_path];
        } else {
            await contractModel.updateContractStatus(contractId, "ERROR_FILE");
            return responseHandler.badRequest(res, "Đường dẫn file hợp đồng không hợp lệ (không phải JSON list).");
        }
      }
      
      console.log(`Found ${imagePaths.length} image(s) for contract ${contractId}:`, imagePaths);
      
      // 3. CẬP NHẬT TRẠNG THÁI
      await contractModel.updateContractStatus(contractId, "ANALYZING");

      // 4. TẠO FORMDATA (CHỈ TỪ CÁC FILE TRONG JSON)
      const formData = new FormData();
      for (const imgPath of imagePaths) {
        let imgBuffer;
        try {
          // Đọc từng file từ đường dẫn chính xác
          imgBuffer = await fs.readFile(imgPath);
          formData.append("files", imgBuffer, { filename: path.basename(imgPath) });
        } catch (readError) {
          console.warn(`Could not read file: ${imgPath}. Skipping...`, readError);
          // (Tùy chọn: bỏ qua file này hoặc báo lỗi)
        }
      }

      // 5. GỌI AI SERVICE
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ocr`, formData, {
        headers: formData.getHeaders(),
        timeout: 300000, // 5 phút
      });

      const { ocr_text, analysis } = aiResponse.data;
      if (!ocr_text || !analysis) {
        await contractModel.updateContractStatus(contractId, "ERROR_AI");
        return responseHandler.internalServerError(res, "Không nhận được kết quả từ AI Service.");
      }

      // 6. TÁCH NỘI DUNG VÀ LƯU DB
      const tomTat = extractSection(analysis, "Tóm tắt nội dung");
      const danhGia = extractSection(analysis, "Đánh giá Quyền lợi");
      const phanTich = extractSection(analysis, "Phân tích các điều khoản");
      const deXuat = extractSection(analysis, "Đề xuất chỉnh sửa");

      await contractOcrModel.saveOcrResult(contractId, ocr_text, analysis, tomTat, danhGia, phanTich, deXuat);
      await contractModel.updateContractStatus(contractId, "ANALYZED");

      // 7. TRẢ KẾT QUẢ VỀ CLIENT
      return responseHandler.success(res, "Phân tích ảnh thành công.", {
        contract_id: contractId,
        extracted_text: ocr_text,
        summary: analysis,
        tomtat: tomTat,
        danhgia: danhGia,
        phantich: phanTich,
        dexuat: deXuat,
      });

    } catch (error) {
      console.error("Error in analyzeContractImages:", error?.response?.data || error.message);
      if (contractId) {
        try {
          await contractModel.updateContractStatus(contractId, "ERROR");
        } catch (e) {
          console.error("Failed to update status to ERROR:", e);
        }
      }
      const msg = error?.response?.data?.detail || "Lỗi trong quá trình phân tích ảnh.";
      return responseHandler.internalServerError(res, msg);
    }
  }
};

  // // 5. Xử lý dữ liệu phân tích
  //   const fullSummary = aiResponse.data?.summary || "";
  //   const fileText = aiResponse.data?.content || "";

  //   const tomTat = extractSection(fullSummary, "Tóm tắt nội dung");
  //   const danhGia = extractSection(fullSummary, "Đánh giá Quyền lợi");
  //   const phanTich = extractSection(fullSummary, "Phân tích các điều khoản");
  //   const deXuat = extractSection(fullSummary, "Đề xuất chỉnh sửa");

  //   console.log("Extracted Sections:", { tomTat, danhGia, phanTich, deXuat });

  //   // 6. Lưu kết quả: lưu trực tiếp text tiếng Việt vào file_content
  //   await contractOcrModel.saveOcrResult(
  //     contractId, 
  //     fileText,
  //     fullSummary,
  //     tomTat,
  //     danhGia,
  //     phanTich,
  //     deXuat
  //   );
  //   await contractModel.updateContractStatus(contractId, "ANALYZED");

  //   // 7. Trả kết quả chi tiết cho client
  //   return responseHandler.success(res, "Phân tích hợp đồng thành công.", {
  //     contract_id: contractId,
  //     extracted_text: fileText,
  //     summary: fullSummary,
  //     tomtat: tomTat,
  //     danhgia: danhGia,
  //     phantich: phanTich,
  //     dexuat: deXuat,
  //   });