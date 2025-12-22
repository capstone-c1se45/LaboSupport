import chromadb
import os
from sentence_transformers import SentenceTransformer
import warnings

# Tắt cảnh báo của thư viện nếu cần
warnings.filterwarnings("ignore", category=FutureWarning)

class ChromaClient:
    def __init__(self):
        # Đường dẫn lưu DB. 
        # Lưu ý: Cần đảm bảo đường dẫn này khớp với nơi bạn đã tạo/lưu ChromaDB trước đó.
        # Nếu bạn chạy docker, hãy mount volume vào path này.
        self.db_path = "../chroma_db" 
        
        # Khởi tạo Client
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Model embedding: Phải KHỚP CHÍNH XÁC với model bạn đã dùng để tạo dữ liệu training
        # Dựa vào requirements.txt, thường là 'paraphrase-multilingual-MiniLM-L12-v2' hoặc 'all-MiniLM-L6-v2'
        # Ở đây tôi dùng model hỗ trợ tiếng Việt tốt phổ biến:
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        # Tên Collection chính xác bạn vừa cung cấp
        self.collection_name = "luatlaodong_chunks"
        
        # Lấy collection (không tạo mới vì dữ liệu đã có sẵn)
        try:
            self._collection = self.client.get_collection(name=self.collection_name)
            print(f"✅ Đã kết nối thành công tới ChromaDB collection: {self.collection_name}")
        except Exception as e:
            print(f"⚠️ Cảnh báo: Không tìm thấy collection '{self.collection_name}'. Hãy chắc chắn bạn đã chạy script train/import dữ liệu.")
            # Fallback: Tạo mới nếu chưa có (để tránh lỗi crash app, nhưng sẽ không có dữ liệu)
            self._collection = self.client.get_or_create_collection(name=self.collection_name)

    def query_similar_chunks(self, text: str, n_results: int = 5):
        """
        Tìm kiếm các chunk văn bản tương đồng với câu hỏi.
        """
        try:
            # Tạo embedding cho câu hỏi
            embedding = self.embedding_model.encode(text).tolist()
            
            # Truy vấn
            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=n_results
            )
            
            # Kiểm tra kết quả
            if not results['ids'] or len(results['ids'][0]) == 0:
                return []

            hits = []
            ids = results['ids'][0]
            distances = results['distances'][0]
            metadatas = results['metadatas'][0] if results['metadatas'] else []
            
            for i, chunk_id in enumerate(ids):
                # Chroma trả về distance (L2), càng thấp càng giống.
                # Có thể lọc bớt nếu distance quá lớn (ví dụ > 1.5)
                hits.append({
                    "chunk_id": chunk_id,
                    "score": distances[i],
                    "metadata": metadatas[i] if i < len(metadatas) else {}
                })
            
            return hits
            
        except Exception as e:
            print(f"❌ Lỗi truy vấn ChromaDB: {e}")
            return []

# Singleton instance
chroma_db = ChromaClient()