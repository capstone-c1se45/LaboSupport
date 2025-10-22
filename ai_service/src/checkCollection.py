from chromadb import PersistentClient

PERSIST_DIR = "ai_service/AI/chroma_db"   
COLLECTION_NAME = "luatlaodong_chunks"

client = PersistentClient(path=PERSIST_DIR)

collections = client.list_collections()

print("Các collection hiện có trong DB:")
for c in collections:
    print("-", c.name)

exists = any(c.name == COLLECTION_NAME for c in collections)

if exists:
    print(f"✅ Collection '{COLLECTION_NAME}' đã tồn tại.")
else:
    print(f"❌ Collection '{COLLECTION_NAME}' chưa có.")
