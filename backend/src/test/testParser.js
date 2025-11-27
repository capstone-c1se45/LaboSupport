// backend/testParser.js
import fs from "fs";
import path from "path";
import { parseLaborLawDocx } from "../utils/docxParser.js";

// Đổi tên file này thành file .docx thực tế của bạn
const FILE_NAME = "./45_2019_QH14_333670.doc"; 

// check if file exists
if(!FILE_NAME.endsWith(".doc")) {
  console.error("❌ Vui lòng sử dụng file .docx để test parser.");
  process.exit(1);
}

async function runTest() {
  const filePath = path.join(process.cwd(), FILE_NAME);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Không tìm thấy file tại: ${filePath}`);
    console.log("👉 Vui lòng convert file .doc sang .docx và đặt vào thư mục backend/");
    return;
  }

  try {
    console.log("⏳ Đang đọc file...");
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log("⏳ Đang phân tích...");
    const data = await parseLaborLawDocx(fileBuffer);

    console.log(`✅ Phân tích thành công! Tổng số điều tìm thấy: ${data.length}`);
    
    if (data.length > 0) {
      console.log("\n--- MẪU 3 KẾT QUẢ ĐẦU TIÊN ---");
      console.log(JSON.stringify(data.slice(0, 3), null, 2));

      console.log("\n--- MẪU KẾT QUẢ CUỐI CÙNG ---");
      console.log(JSON.stringify(data.slice(-1), null, 2));
    } else {
      console.warn("⚠️ Không tìm thấy điều luật nào. Kiểm tra lại Regex hoặc format file.");
    }

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

runTest();