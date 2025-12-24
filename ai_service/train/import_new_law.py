import os
import re
import json
import docx
import chromadb
from sentence_transformers import SentenceTransformer


DOCX_FILE = "219_2025_ND-CP_668418.docx" 

LAW_ID = "219/2025/NĐ-CP" 
LAW_NAME = "Nghị định 219/2025/NĐ-CP về lao động nước ngoài"
CHAPTER_DEFAULT = "Quy định chung"

JSON_OUTPUT_PATH = "nghidinh219_chunk.json"
current_dir = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_PATH = os.path.join(current_dir, 'chroma_db') 
COLLECTION_NAME = "luatlaodong_chunks"

def parse_docx_to_sections(docx_path):
    """
    Hàm đọc file Word (Dùng logic cũ, hoạt động tốt với format Điều/Chương)
    """
    if not os.path.exists(docx_path):
        print(f"❌ Lỗi: Không tìm thấy file {docx_path}")
        return []

    doc = docx.Document(docx_path)
    sections = []
    
    current_chapter = CHAPTER_DEFAULT
    current_section = None
    
    # Regex bắt dòng "Điều X."
    article_pattern = re.compile(r'^Điều\s+(\d+)[\.\s]', re.IGNORECASE)
    # Regex bắt dòng "Chương I"
    chapter_pattern = re.compile(r'^Chương\s+[IVX0-9]+', re.IGNORECASE)

    print(f"📖 Đang đọc file: {docx_path}...")

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text: continue 

        # Bắt chương
        if chapter_pattern.match(text):
            current_chapter = text
            if current_section:
                sections.append(current_section)
                current_section = None
            continue

        # Bắt điều
        match = article_pattern.match(text)
        if match:
            if current_section:
                sections.append(current_section)
            
            article_number = match.group(1)
            
            # Tạo ID Unique: 219-2025-ND-CP_dieu_1
            # ID này KHÁC với ID của BLLĐ 2019 nên sẽ không bị đè
            clean_law_id = LAW_ID.replace("/", "-").replace(" ", "").replace("Đ", "D") # Clean kỹ hơn
            section_id = f"{clean_law_id}_dieu_{article_number}"
            
            current_section = {
                "section_id": section_id,
                "law_id": LAW_ID,
                "law_name": LAW_NAME,
                "chapter": current_chapter,
                "law_reference": f"Điều {article_number} - {LAW_NAME}",
                "article_title": text,
                "chunk_index": 1,
                "content": text,
                "category": "Lao động nước ngoài" # Category mới
            }
        else:
            if current_section:
                current_section["content"] += "\n" + text
    
    if current_section:
        sections.append(current_section)

    print(f"✅ Đã tách được {len(sections)} điều luật từ Nghị định mới.")
    return sections

def append_to_chromadb(sections):
    """
    Hàm thêm dữ liệu vào ChromaDB (APPEND MODE)
    """
    print(f"🔄 Đang kết nối ChromaDB tại: {CHROMA_DB_PATH}")
    
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    
    # --- QUAN TRỌNG: Dùng get_or_create, KHÔNG delete ---
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    print(f"📊 Số lượng vector hiện tại trước khi thêm: {collection.count()}")

    embedding_func = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    ids = [s['section_id'] for s in sections]
    documents = [s['content'] for s in sections]
    metadatas = [{
        "law_id": s['law_id'],
        "section_id": s['section_id'],
        "law_name": s['law_name'],
        "article_title": s['article_title'],
        "law_reference": s['law_reference']
    } for s in sections]
    
    batch_size = 50
    total = len(ids)
    print(f"📥 Đang THÊM {total} điều luật mới vào DB...")
    
    for i in range(0, total, batch_size):
        end = min(i + batch_size, total)
        print(f"   - Processing batch {i}-{end}/{total}")
        
        # Nhớ dùng normalize_embeddings=True cho đồng bộ
        embeddings = embedding_func.encode(documents[i:end], normalize_embeddings=True).tolist()
        
        # --- QUAN TRỌNG: Dùng UPSERT thay vì ADD ---
        # upsert: Nếu ID chưa có -> Thêm mới. Nếu ID có rồi -> Cập nhật.
        collection.upsert(
            ids=ids[i:end],
            documents=documents[i:end],
            metadatas=metadatas[i:end],
            embeddings=embeddings
        )

    print(f"🎉 Hoàn tất! Tổng số vector trong DB bây giờ: {collection.count()}")

def save_json_for_mysql(sections):
    with open(JSON_OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)
    print(f"💾 Đã lưu JSON cho MySQL: {JSON_OUTPUT_PATH}")

if __name__ == "__main__":
    # 1. Parse File mới
    sections = parse_docx_to_sections(DOCX_FILE)
    
    if sections:
        # 2. Append vào Chroma
        append_to_chromadb(sections)
        
        # 3. Xuất JSON
        save_json_for_mysql(sections)
        