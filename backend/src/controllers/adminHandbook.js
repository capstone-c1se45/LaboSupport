import { handbookModel } from "../models/handbook.js";
import { nanoidNumbersOnly } from "../utils/nanoid.js";
import { redisClient } from "../config/redis.js";
import { parseLaborLawDocx } from "../utils/docxParser.js";
import { lawModel } from "../models/law.js";
import { auditLogModel } from "../models/auditLog.js";

const REDIS_CACHE_KEY = "handbook_list";
const CACHE_TIME = 3600;

const clearHandbookCache = async () => {
  try {
    const keys = await redisClient.keys(`${REDIS_CACHE_KEY}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Deleted handbook cache keys:", keys);
    }
  } catch (error) {
    console.error("Error clearing handbook cache:", error);
  }
};

export const adminHandbookController = {
  // 
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || ""; // Lấy từ khóa tìm kiếm
      const offset = (page - 1) * limit;

      // Tạo key cache bao gồm cả từ khóa tìm kiếm
      const cacheKey = `${REDIS_CACHE_KEY}:page:${page}:limit:${limit}:search:${search}`;    
      // 1. Thử lấy từ Redis
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // 2. Query DB
      const total = await handbookModel.countAll(search);
      const items = await handbookModel.getPaginated(limit, offset, search);

      const responseData = {
        data: items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      // 3. Lưu vào Redis (30 phút)
      await redisClient.setEx(cacheKey, CACHE_TIME, JSON.stringify(responseData));

      res.json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  async create(req, res) {
    res.status(400).json({ message: "Vui lòng sử dụng chức năng Import File để thêm văn bản luật mới." });
  },
  async update(req, res) {
    try {
      await handbookModel.update(req.params.id, req.body);
      if (req.user) {
          await auditLogModel.create({
              user_id: req.user.user_id, 
              action: "UPDATE_HANDBOOK",
              details: `Đã cập nhật điều khoản ID: ${req.params.id}`
          });
      }

      await clearHandbookCache(); // Xóa cache
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE
  async delete(req, res) {
    try {
      await handbookModel.delete(req.params.id);

      if (req.user) {
          await auditLogModel.create({
              user_id: req.user.user_id, // Lấy ID người đang thao tác
              action: "DELETE_HANDBOOK",
              details: `Đã xóa điều khoản ID: ${req.params.id}`
          });
      }

      await clearHandbookCache(); // Xóa cache
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAll(req, res) {
    try {
      await handbookModel.deleteAll();

      if (req.user) {
          await auditLogModel.create({
              user_id: req.user.user_id, 
              action: "DELETE_ALL_HANDBOOK",
              details: `Đã xóa toàn bộ dữ liệu luật.`
          });
      }


      await clearHandbookCache();
      res.json({ message: "Đã xóa toàn bộ dữ liệu luật thành công." });
    } catch (error) {
      console.error("Error deleteAll handbook:", error);
      res.status(500).json({ message: "Lỗi khi xóa toàn bộ dữ liệu." });
    }
  },

  // IMPORT TỪ FILE .DOCX
  async importDocx(req, res) {
    try {
        // 1. Kiểm tra File
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file .docx" });
        }

        // 2. Lấy thông tin Luật từ req.body
        const { law_code, law_summary, law_effective_date } = req.body;

        const created_by = req.user ? (req.user.user_id || req.user.id) : null;
        
        if (!law_code || !law_summary || !law_effective_date) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin Văn bản luật (Số hiệu, Trích yếu, Ngày hiệu lực)" });
        }

     //   console.log(`Processing Import: ${law_code} - ${req.file.originalname}`);

        // 3. Xử lý Luật: Tìm hoặc Tạo mới
        let law = await lawModel.findByCode(law_code);
      //  const law_id = nanoidNumbersOnly(10);
        if (!law) {
          console.log(`Creating new law record: ${law_code}`);
            law = await lawModel.create({
                code: law_code,
                summary: law_summary,
                effective_date: law_effective_date,
              //  created_by: created_by
            });
            console.log(`Created law with ID: ${law.law_id}`);
        } 

        // 4. Parse nội dung từ File Docx
        const rawDataList = await parseLaborLawDocx(req.file.buffer);
        if (!rawDataList || rawDataList.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy nội dung hợp lệ trong file." });
        }

        // 5. Gán law_id cho từng điều khoản và tạo ID mới
        const dataList = rawDataList.map((item) => ({
            section_id: nanoidNumbersOnly(10),
            article_title: item.article_title, 
            law_name: law_code,
            category: item.category || "luat lao dong",
            law_reference: item.law_reference,
            chapter: item.chapter || "",
            content: item.content,           
            law_id: law.law_id,                
            chunk_index: item.chunk_index
        }));

        // 6. Lưu vào DB
        await handbookModel.createMany(dataList);

        if (req.user) {
            await auditLogModel.create({
                user_id: req.user.user_id,
                action: "IMPORT_HANDBOOK_DOCX",
                details: `Đã import luật "${law_code}" với ${dataList.length} điều khoản từ file "${req.file.originalname}"`
            });
        }

        await clearHandbookCache();

        res.json({ 
            message: `Thêm thành công bộ luật "${law_code}" với ${dataList.length} điều khoản.`,
            count: dataList.length 
        });

    } catch (error) {
        console.error("Import Error:", error);
        res.status(500).json({ message: "Lỗi xử lý import: " + error.message });
    }
  },
};