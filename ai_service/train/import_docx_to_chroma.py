import os
import re
import json
import docx 
import chromadb
from sentence_transformers import SentenceTransformer

DOCX_FILE = "45_2019_QH14_333670.docx"  
LAW_ID = "45/2019/QH14"             
LAW_NAME = "Bộ luật Lao động 2019"     
CHAPTER_DEFAULT = "Quy định chung"     

JSON_OUTPUT_PATH = "luatlaodong_chunk.json" 
CHROMA_DB_PATH = "../chroma_db" 
COLLECTION_NAME = "luatlaodong_chunks"


def parse_docx_to_sections(docx_path):
    """
    Đọc DOCX và tách thành các điều luật bằng cách duyệt từng đoạn văn.
    Hỗ trợ tự động nhận diện Chương.
    """
    if not os.path.exists(docx_path):
        print(f"❌ Lỗi: Không tìm thấy file {docx_path}")
        return []

    doc = docx.Document(docx_path)
    sections = []
    
    current_chapter = CHAPTER_DEFAULT
    current_section = None
    
    # Regex bắt dòng "Điều X." hoặc "Điều X " (không phân biệt hoa thường)
    # Group 1 sẽ là số điều
    article_pattern = re.compile(r'^Điều\s+(\d+)[\.\s]', re.IGNORECASE)
    
    # Regex bắt dòng "Chương I", "Chương II"...
    chapter_pattern = re.compile(r'^Chương\s+[IVX0-9]+', re.IGNORECASE)

    print("🔄 Đang phân tích file Word...")

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue # Bỏ qua dòng trống

        # 1. Kiểm tra xem có phải tiêu đề CHƯƠNG không
        if chapter_pattern.match(text):
            current_chapter = text # Cập nhật chương hiện tại
            # Nếu đang gom dở một điều luật thì đóng lại (chương mới thì điều cũ kết thúc)
            if current_section:
                sections.append(current_section)
                current_section = None
            continue

        # 2. Kiểm tra xem có phải bắt đầu ĐIỀU luật mới không
        match = article_pattern.match(text)
        if match:
            # Lưu điều luật trước đó (nếu có)
            if current_section:
                sections.append(current_section)
            
            # Khởi tạo điều luật mới
            article_number = match.group(1)
            
            # Tạo ID chuẩn: 45-2019-QH14_dieu_1
            clean_law_id = LAW_ID.replace("/", "-").replace(" ", "")
            section_id = f"{clean_law_id}_dieu_{article_number}"
            
            current_section = {
                "section_id": section_id,
                "law_id": LAW_ID,
                "law_name": LAW_NAME,
                "chapter": current_chapter,
                "law_reference": f"Điều {article_number} - {LAW_NAME}",
                "article_title": text, # Dòng đầu tiên là tiêu đề (VD: Điều 1. Phạm vi...)
                "chunk_index": 1,
                "content": text,       # Bắt đầu nội dung
                "category": "Lao động"
            }
        else:
            # 3. Nếu không phải Điều mới, thì là nội dung của Điều đang gom
            if current_section:
                current_section["content"] += "\n" + text
    
    # Lưu điều luật cuối cùng sau khi hết vòng lặp
    if current_section:
        sections.append(current_section)

    print(f"✅ Đã tìm thấy {len(sections)} điều luật.")
    return sections

def update_chromadb(sections):
    """
    Cập nhật ChromaDB với dữ liệu mới
    - An toàn khi collection chưa tồn tại
    - Có thể chạy lại nhiều lần
    """

    print(f"🔄 Kết nối ChromaDB tại: {CHROMA_DB_PATH}")
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    # --- 1. Kiểm tra collection tồn tại hay chưa ---
    existing_collections = [c.name for c in client.list_collections()]

    if COLLECTION_NAME in existing_collections:
        print(f"🗑️  Collection '{COLLECTION_NAME}' đã tồn tại → xóa để import lại")
        client.delete_collection(name=COLLECTION_NAME)
    else:
        print(f"📂 Collection '{COLLECTION_NAME}' chưa tồn tại → tạo mới")

    # --- 2. Tạo collection mới ---
    embedding_func = SentenceTransformer(
        "paraphrase-multilingual-MiniLM-L12-v2"
    )

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={
            "description": "Các điều luật Bộ luật Lao động 2019",
            "law_id": LAW_ID
        }
    )

    # --- 3. Chuẩn bị dữ liệu ---
    ids = [s["section_id"] for s in sections]
    documents = [s["content"] for s in sections]

    metadatas = [{
        "law_id": s["law_id"],
        "section_id": s["section_id"],
        "law_name": s["law_name"],
        "article_title": s["article_title"],
        "law_reference": s["law_reference"],
        "category": s["category"]
    } for s in sections]

    # --- 4. Import theo batch ---
    batch_size = 50
    total = len(ids)

    print(f"📥 Đang nạp {total} điều luật vào ChromaDB...")

    for i in range(0, total, batch_size):
        end = min(i + batch_size, total)

        embeddings = embedding_func.encode(
            documents[i:end],
            normalize_embeddings=True
        ).tolist()

        collection.add(
            ids=ids[i:end],
            documents=documents[i:end],
            metadatas=metadatas[i:end],
            embeddings=embeddings
        )

        print(f"   ✅ Batch {i} → {end}/{total}")

    print("🎉 Hoàn tất cập nhật ChromaDB!")


def save_json_for_admin_seed(sections):
    with open(JSON_OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)
    print(f"💾 Đã lưu JSON: {JSON_OUTPUT_PATH}")

if __name__ == "__main__":
    # 1. Xử lý File Word
    sections = parse_docx_to_sections(DOCX_FILE)
    
    if sections:
        # Kiểm tra nhanh kết quả đầu tiên
        print("\n--- Kiểm tra thử Điều 1 ---")
        print(f"Tiêu đề: {sections[0]['article_title']}")
        print(f"Nội dung (Preview): {sections[0]['content'][:100]}...") 
        print("---------------------------\n")

        # 2. Update ChromaDB
        update_chromadb(sections)
        
        # 3. Lưu JSON
        save_json_for_admin_seed(sections)
        
        print("\n🚀 BƯỚC TIẾP THEO:")
        print(f"1. Copy '{JSON_OUTPUT_PATH}' sang backend/src/")
        print("2. Chạy 'npm run seed' ở Backend để đồng bộ MySQL.")
    else:
        print("⚠️ Không lấy được dữ liệu. Hãy kiểm tra lại file Word.")