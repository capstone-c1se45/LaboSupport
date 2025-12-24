import chromadb
import os
from sentence_transformers import SentenceTransformer
import warnings

# Tắt cảnh báo của thư viện nếu cần
warnings.filterwarnings("ignore", category=FutureWarning)

class ChromaClient:
    def __init__(self):

        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.db_path = os.path.join(current_dir, '..', '..', 'chroma_db')
        self.db_path = os.path.abspath(self.db_path)

        print(f"📂 Đang kết nối ChromaDB tại: {self.db_path}")
        
        # Khởi tạo Client
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Sử dụng mô hình embedding đa ngôn ngữ
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        # Kết nối tới collection đã tạo từ trước
        self.collection_name = "luatlaodong_chunks"


        # Lấy hoặc tạo collection
        try:
            self._collection = self.client.get_collection(name=self.collection_name)
            print(f"✅ Đã kết nối thành công tới ChromaDB collection: {self.collection_name}")
        except Exception as e:
            print(f"⚠️ Cảnh báo: Không tìm thấy collection '{self.collection_name}'. Hãy chắc chắn bạn đã chạy script train/import dữ liệu.")
            self._collection = self.client.get_or_create_collection(name=self.collection_name)

    def query_similar_chunks(self, text: str, n_results: int = 15):
        """
        Tìm kiếm các chunk văn bản tương đồng với câu hỏi.
        """
        try:
            # Tạo embedding cho câu hỏi
            embedding = self.embedding_model.encode(text, normalize_embeddings=True).tolist()
            
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
                if distances[i] < 1.5:  # Hạ ngưỡng xuống để lọc bớt rác
                    hits.append({
                        "chunk_id": chunk_id,
                        "score": distances[i],
                        "metadata": metadatas[i] if i < len(metadatas) else {}
                    })
           
            hits.sort(key=lambda x: x['score'])        
            
            return hits
            
        except Exception as e:
            print(f"❌ Lỗi truy vấn ChromaDB: {e}")
            return []

# Singleton instance
chroma_db = ChromaClient()