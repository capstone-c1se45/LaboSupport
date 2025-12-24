import chromadb
import os

# Sửa lại đường dẫn cho giống hệt cái bạn vừa fix ở trên
# Nếu folder data của bạn tên là 'chroma_db', hãy sửa lại
DB_PATH = os.path.abspath("chroma_db") 
COLLECTION_NAME = "luatlaodong_chunks"

print(f"Kiểm tra tại: {DB_PATH}")

if os.path.exists(DB_PATH):
    try:
        client = chromadb.PersistentClient(path=DB_PATH)
        print("Collections:", [c.name for c in client.list_collections()])
        
        col = client.get_collection(COLLECTION_NAME)
        print(f"👉 Số lượng vector: {col.count()}")
        
        if col.count() > 0:
            print("✅ OK! Database có dữ liệu.")
        else:
            print("❌ Database RỖNG! Hãy chạy lại script nạp dữ liệu (extract_traindata.py).")
            
    except Exception as e:
        print(f"Lỗi: {e}")
else:
    print("❌ Thư mục không tồn tại.")