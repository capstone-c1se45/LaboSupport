import { handbookModel } from "../models/handbook.js";
import { nanoid } from "nanoid"; // Hoặc dùng crypto.randomUUID()
import { redisClient } from "../config/redis.js";
import { parseLaborLawDocx } from "../utils/docxParser.js";

const REDIS_CACHE_KEY = "handbook_list";
const CACHE_TIME = 3600;

export const adminHandbookController = {
  // 
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // 1. Kiểm tra Cache Redis
      const cacheKey = `${REDIS_CACHE_KEY}:page:${page}:limit:${limit}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // 2. Nếu không có Cache, gọi DB
      const total = await handbookModel.countAll();
      const items = await handbookModel.getPaginated(limit, offset);
      
      const responseData = {
        data: items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      // 3. Lưu vào Redis
      await redisClient.setEx(cacheKey, CACHE_TIME, JSON.stringify(responseData));

      res.json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  async create(req, res) {
    try {
      const section_id = nanoid(10); // Tạo ID ngắn gọn
      const newItem = { ...req.body, section_id };
      await handbookModel.create(newItem);
      res.status(201).json({ message: "Thêm thành công", data: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      await handbookModel.update(id, req.body);
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật" });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await handbookModel.delete(id);
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa" });
    }
  },
  async importDocx(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng upload file .docx" });
      }

      // 1. Parse file từ buffer (RAM)
      const dataList = await parseLaborLawDocx(req.file.buffer);

      if (dataList.length === 0) {
        return res.status(400).json({ message: "Không tìm thấy nội dung hợp lệ trong file." });
      }

      // 2. Lưu vào DB
      await handbookModel.createMany(dataList);

      // 3. Xóa Cache Redis (Invalidate) để user thấy dữ liệu mới ngay
      // Xóa tất cả các key liên quan đến handbook
      const keys = await redisClient.keys(`${REDIS_CACHE_KEY}:*`);
      if (keys.length > 0) await redisClient.del(keys);

      res.json({ message: `Đã import thành công ${dataList.length} điều luật.` });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi xử lý file." });
    }
  }
};