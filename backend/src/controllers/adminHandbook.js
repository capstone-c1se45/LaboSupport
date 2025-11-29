import { handbookModel } from "../models/handbook.js";
import { nanoid } from "nanoid"; // Hoặc dùng crypto.randomUUID()
import { redisClient } from "../config/redis.js";
import { parseLaborLawDocx } from "../utils/docxParser.js";

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
      const cacheKey = `${REDIS_CACHE_KEY}:page:${page}:limit:${limit}`;      
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
    try {
      const newItem = {
        section_id: nanoid(10),
        ...req.body,
        chunk_index: Date.now() // Tạm thời dùng timestamp làm index
      };
      await handbookModel.create(newItem);
      await clearHandbookCache(); // Xóa cache để cập nhật mới
      res.json({ message: "Thêm thành công", data: newItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  async update(req, res) {
    try {
      await handbookModel.update(req.params.id, req.body);
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
      await clearHandbookCache(); // Xóa cache
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAll(req, res) {
    try {
      await handbookModel.deleteAll();

      await clearHandbookCache();

      res.json({ message: "Đã xóa toàn bộ dữ liệu luật thành công." });
    } catch (error) {
      console.error("Error deleteAll handbook:", error);
      res.status(500).json({ message: "Lỗi khi xóa toàn bộ dữ liệu." });
    }
  },

  // IMPORT (Giữ nguyên, nhớ thêm clearCache)
  async importDocx(req, res) {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng upload file .docx" });
        const dataList = await parseLaborLawDocx(req.file.buffer);
        if (dataList.length === 0) return res.status(400).json({ message: "Không tìm thấy nội dung hợp lệ trong file." });

        await handbookModel.createMany(dataList);
        await clearHandbookCache(); // Xóa cache
        res.json({ message: `Import thành công ${dataList.length} điều.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi xử lý file" });
    }
  }
};