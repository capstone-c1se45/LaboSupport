import mammoth from "mammoth";
import { nanoidNumbersOnly as nanoid } from "./nanoid.js";

export const parseLaborLawDocx = async (buffer) => {
  try {
    // 1. Chuyển đổi file .docx sang text thuần
    // mammoth.extractRawText sẽ nối các đoạn văn bằng 2 dấu xuống dòng (\n\n)
    const result = await mammoth.extractRawText({ buffer: buffer });
    const text = result.value;

    // Tách dòng, loại bỏ các dòng trắng thừa
    const lines = text.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
    
    const parsedData = [];
    
    let currentChapter = "";
    let currentArticleTitle = "";
    let currentContent = [];

    // Regex nhận diện
    const chapterRegex = /^CHƯƠNG\s+[IVXLCDM]+\b/i; // Bắt: Chương I, Chương II...
    const articleRegex = /^Điều\s+(\d+)[\.:]\s*(.*)/i; // Bắt: Điều 1. Tên..., Điều 2: Tên...
   // const lawNameRegex = 

    // 2. Duyệt qua từng dòng
    for (const line of lines) {
      // --- XỬ LÝ CHƯƠNG ---
      // Ví dụ: "Chương I NHỮNG QUY ĐỊNH CHUNG"
      if (chapterRegex.test(line)) {
        currentChapter = line;
        continue;
      }

      // --- XỬ LÝ ĐIỀU ---
      // Ví dụ: "Điều 1. Phạm vi điều chỉnh"
      const articleMatch = line.match(articleRegex);
      if (articleMatch) {
        // 1. Lưu điều luật trước đó (nếu đã gom đủ nội dung)
        if (currentArticleTitle) {
          parsedData.push({
            section_id: nanoid(10),
            law_name: "Bộ Luật Lao động 2019",
            chapter: currentChapter,
            law_reference: "45/2019/QH14", // Trích từ file của bạn
            category: "luat lao dong",
            article_title: currentArticleTitle,
            chunk_index: parsedData.length + 1,
            content: currentContent.join("\n")
          });
        }

        // 2. Bắt đầu điều luật mới
        // articleMatch[0] là cả dòng, articleMatch[1] là số điều, articleMatch[2] là tên điều
        currentArticleTitle = line; 
        currentContent = [];
      } 
      // --- XỬ LÝ NỘI DUNG ---
      else {
        // Chỉ lấy nội dung nếu đã quét qua ít nhất 1 "Điều"
        // Bỏ qua các dòng rác ở đầu file (Cộng hòa xã hội..., Quốc hội...)
        if (currentArticleTitle) {
          currentContent.push(line);
        }
      }
    }

    // 3. Lưu điều luật cuối cùng (do vòng lặp kết thúc)
    if (currentArticleTitle) {
      parsedData.push({
        section_id: nanoid(10),
        law_name: "Bộ Luật Lao động 2019",
        chapter: currentChapter,
        law_reference: "45/2019/QH14",
        category: "luat lao dong",
        article_title: currentArticleTitle,
        chunk_index: parsedData.length + 1,
        content: currentContent.join("\n")
      });
    }

    return parsedData;

  } catch (error) {
    console.error("Lỗi parse DOCX:", error);
    throw new Error("Không thể đọc file. Hãy đảm bảo file là định dạng .docx (không phải .doc).");
  }
};