from chromadb import PersistentClient
import os


PERSIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../AI/chroma_db"))
COLLECTION_NAME = "luatlaodong_chunks"


client = PersistentClient(path=PERSIST_DIR)
collection = client.get_collection(name=COLLECTION_NAME)

def query_law(text: str, top_k: int = 3):
    res = collection.query(query_texts=[text], n_results=top_k)
    laws = []
    for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
        laws.append({
            "article_number": meta.get("article_number", "N/A"),
            "article_title": meta.get("article_title", "Không có tiêu đề"),
            "content": doc
        })
    return laws
