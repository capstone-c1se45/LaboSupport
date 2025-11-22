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
dotenvFlow.config();
const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;

try {
  const connection = await pool.getConnection();
  console.log("✅ Đã kết nối MySQL thành công!");
  connection.release(); // Trả lại pool
} catch (error) {
  console.error("❌ Lỗi kết nối MySQL:", error.message);
}

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

app.use("/api", router);

// Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

initializeSocket(io);


app.get("/", async (req, res) => {
  res.send("Hello World! this is backend server c1se45");
});

// //test other account
// const username = "admindz";
// const password = "admin123";
// const full_name = "Administrator";
// const email = "labo_admin@gmail.com";
// const phone = "0764078204";
// const role_id = "2"; 
// const hashedPassword = await bcrypt.hash(password, 10);

// const newUser = {
//       user_id: nanoidNumbersOnly(10),
//       username,
//       password: hashedPassword,
//       full_name,
//       email,
//       phone,
//       role_id: role_id, // mặc định role user
//     };

//     const created = await userModel.createUser(newUser);



swaggerDocs(app, PORT);

server.listen(PORT,()=>{
     logger.info(`Express server running on port http://localhost:${PORT}/`);
}
)