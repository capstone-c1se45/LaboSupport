import express from "express";
import cors from "cors";
import dotenvFlow from "dotenv-flow"; 
import logger from "./config/logger.js";
import router from "./routes/index.js";
import swaggerDocs from "./swagger.js";
import { createServer } from "http";
import cookieParser from "cookie-parser"
import { pool } from "./config/mysql.js";
import main from "./utils/init_handbook.js";
import { Server } from 'socket.io';
import { initializeSocket } from './socket/chatHandler.js';
import { userModel } from "./models/user.js";
import { nanoidNumbersOnly } from "./utils/nanoid.js";
import bcrypt from "bcryptjs";
import { redisClient } from "./config/redis.js";
dotenvFlow.config();
const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;
const connection = await pool.getConnection();
// try {
//   
//   console.log("✅ Đã kết nối MySQL thành công!");
//   connection.release(); // Trả lại pool
// } catch (error) {
//   console.error("❌ Lỗi kết nối MySQL:", error.message);
// }

// 1. Import pool từ file mysql.js của bạn

const connectDB = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`⏳ Đang thử kết nối MySQL (Lần ${retries + 1})...`);
      
      console.log('✅ Kết nối MySQL thành công!');
      
      connection.release(); 
      
      break;
    } catch (error) {
      retries += 1;
      console.log(`Lỗi kết nối MySQL: ${error.message}`);
      console.log(`...Đang chờ 5s trước khi thử lại...`);
      
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  
  if (retries === maxRetries) {
     console.error('🚨 Không thể kết nối tới MySQL sau nhiều lần thử. Dừng ứng dụng.');
     process.exit(1);
  }
};

// Gọi hàm
connectDB();

// chèn luật
// (async () => {
//   await main();
// })();


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);


// check khởi động redis
redisClient.ping().then(() => {
  console.log("✅ Redis is running");
}).catch((err) => {
  console.error("❌ Redis connection error:", err);
}
);


// Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

initializeSocket(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use("/api", router);

app.get("/", async (req, res) => {
  res.send("Hello World! this is backend server c1se45");
});





const userName = "user"
const roleId = "1" // role user
const decription = "Nguời dùng thường"

const adminName = "admin"
const roleAdminId = "2" // role admin
const decriptionAdmin = "Quản trị viên"

const roleUser = {
  role_id: roleId,
  role_name: userName,
  description: decription
}
const roleAdmin = {
  role_id: roleAdminId,
  role_name: adminName,
  description: decriptionAdmin
}
// tạo 2 role user và admin nếu chưa có
const createRolesIfNotExist = async () => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM Role WHERE role_id IN (?, ?)', [roleId, roleAdminId]);
    const existingCount = rows[0].count;
    if (existingCount < 2) {
      const insertValues = [];
      if (existingCount === 0) {
        insertValues.push([roleUser.role_id, roleUser.role_name, roleUser.description]);
        insertValues.push([roleAdmin.role_id, roleAdmin.role_name, roleAdmin.description]);
      } else if (existingCount === 1) {
        const [existingRows] = await pool.query('SELECT role_id FROM Role WHERE role_id IN (?, ?)', [roleId, roleAdminId]);
        const existingRoleId = existingRows[0].role_id; 
        if (existingRoleId === roleId) {
          insertValues.push([roleAdmin.role_id, roleAdmin.role_name, roleAdmin.description]);
        } else {
          insertValues.push([roleUser.role_id, roleUser.role_name, roleUser.description]);
        }
      }
      await pool.query('INSERT INTO Role (role_id, role_name, description) VALUES ?', [insertValues]);
      console.log('✅ Đã tạo các vai trò mặc định trong bảng Role.');
    } else {
      console.log('✅ Vai trò mặc định đã tồn tại trong bảng Role.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo vai trò mặc định:', error.message);
  }
};

await createRolesIfNotExist();
// //test other account
const username = "admindz";
const password = "admin123";
const full_name = "Administrator";
const email = "labo_admin@gmail.com";
const phone = "0764078204";
const role_id = "2"; 
const hashedPassword = await bcrypt.hash(password, 10);
const adminID = nanoidNumbersOnly(10);


const newUser = {
      user_id: adminID,
      username,
      password: hashedPassword,
      full_name,
      email,
      phone,
      role_id: role_id, // mặc định role user
    };
// khi tạo lại user thì bỏ comment đoạn này
const created = await userModel.createUser(newUser);

const seedFAQs = async () => {
    const CREATED_BY_USER_ID = adminID; // Thay bằng user_id thực tế của bạn

    const faqData = [
        {
            q: "Lương thử việc tối thiểu là bao nhiêu?",
            a: "Theo Điều 26 Bộ luật Lao động 2019, tiền lương thử việc do hai bên thỏa thuận nhưng ít nhất phải bằng 85% mức lương của công việc đó."
        },
        {
            q: "Thời gian thử việc tối đa là bao lâu?",
            a: "Tối đa 180 ngày với quản lý doanh nghiệp; 60 ngày với trình độ cao đẳng trở lên; 30 ngày với trình độ trung cấp; 6 ngày với công việc khác."
        },
        {
            q: "Người lao động nghỉ việc cần báo trước bao nhiêu ngày?",
            a: "HĐLĐ không xác định thời hạn: báo trước 45 ngày. HĐLĐ 12-36 tháng: báo trước 30 ngày. HĐLĐ dưới 12 tháng: báo trước 3 ngày."
        },
        {
            q: "Cách tính lương làm thêm giờ (OT) như thế nào?",
            a: "Ngày thường: ít nhất 150%. Ngày nghỉ hằng tuần: ít nhất 200%. Ngày lễ, tết, ngày nghỉ có hưởng lương: ít nhất 300%."
        },
        {
            q: "Người lao động có bao nhiêu ngày nghỉ phép năm?",
            a: "Người lao động làm việc đủ 12 tháng được nghỉ 12 ngày phép năm hưởng nguyên lương (điều kiện bình thường). Cứ 5 năm làm việc được tăng thêm 1 ngày."
        },
        {
            q: "Chế độ thai sản được nghỉ bao nhiêu tháng?",
            a: "Lao động nữ được nghỉ thai sản trước và sau khi sinh con là 06 tháng. Trường hợp sinh đôi trở lên thì từ con thứ 2 trở đi, mỗi con được nghỉ thêm 01 tháng."
        }
    ];

    try {
        console.log("⏳ Đang bắt đầu thêm dữ liệu mẫu FAQ...");

        const [users] = await pool.query('SELECT user_id FROM User WHERE user_id = ?', [CREATED_BY_USER_ID]);
        if (users.length === 0) {
            console.log(`⚠️ CẢNH BÁO: Không tìm thấy user_id = "${CREATED_BY_USER_ID}" trong bảng User. Không thể thêm FAQ.`);
            return;
        }

        const query = 'INSERT INTO FAQ (faq_id, question, answer, created_by) VALUES ?';
        
        const values = faqData.map(item => [nanoidNumbersOnly(10), item.q, item.a, CREATED_BY_USER_ID]);

        await pool.query(query, [values]);
        
        console.log(`✅ Đã thêm thành công ${values.length} câu hỏi FAQ vào database!`);

    } catch (error) {
        console.error("❌ Lỗi khi thêm FAQ:", error.message);
    }
};


seedFAQs();

swaggerDocs(app, PORT);

server.listen(PORT,()=>{
     logger.info(`Express server running on port http://localhost:${PORT}/`);
}
)