from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import requests, os
from untils.text_extract import (
    extract_text_from_pdf_bytes,
    extract_text_from_docx,
)
from vector_store import query_law

app = FastAPI()

# ✅ Cấu hình LM Studio + Phi-3 Mini
LM_STUDIO_API = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "microsoft/phi-3-mini-4k-instruct"


@app.get("/")
def read_root():
    return {"message": "AI Legal Contract & Law Chatbot is running 🚀"}


# 📄 PHÂN TÍCH HỢP ĐỒNG
@app.post("/analyze_contract")
async def analyze_contract(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    if file.filename.endswith(".pdf"):
       with open(file_path, "rb") as f:
         file_bytes = f.read()
       contract_text = extract_text_from_pdf_bytes(file_bytes)
    elif file.filename.endswith(".docx"):
        contract_text = extract_text_from_docx(file_path)
    else:
        return {"error": "Chỉ hỗ trợ file PDF hoặc DOCX."}

    # 🔍 Lấy điều luật liên quan
    related_laws = query_law(contract_text[:300])
    law_context = "\n\n".join(
        [f"Điều {l['article_number']}: {l['article_title']}\n{l['content']}" for l in related_laws]
    )

    prompt = f"""
Bạn là chuyên gia pháp lý Việt Nam.

--- Nội dung hợp đồng ---
{contract_text[:1000]}

--- Điều luật liên quan ---
{law_context}

Hãy:
1. Tóm tắt hợp đồng.
2. Đánh giá quyền lợi & nghĩa vụ người lao động.
3. Phát hiện vi phạm Bộ luật Lao động 2019 (nếu có).
4. Gợi ý điều chỉnh hợp lý.
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "Bạn là chuyên gia pháp lý Việt Nam, chuyên về luật lao động."},
            {"role": "user", "content": prompt},
        ],
    }

    res = requests.post(LM_STUDIO_API, json=payload, timeout=180)
    result = res.json()
    answer = result["choices"][0]["message"]["content"]

    return {"summary": answer, "related_articles": related_laws}


# 💬 CHATBOX PHÁP LÝ
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat_with_ai(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"error": "Tin nhắn không được để trống."}

    related_laws = query_law(message, top_k=3)
    law_context = "\n\n".join(
    [f"Điều {l['article_number']}: {l['article_title']}\n{l['content']}" for l in related_laws])


    prompt = f"""
Bạn là AI pháp lý Việt Nam, tư vấn theo Bộ luật Lao động 2019.

--- Câu hỏi ---
{message}

--- Điều luật liên quan ---
{law_context}

Yêu cầu:
- Trả lời chính xác dựa trên luật.
- Nếu không có điều luật phù hợp, hãy nói "Không có quy định cụ thể trong Bộ luật Lao động 2019".
- Giải thích ngắn gọn, dễ hiểu, đúng pháp lý.
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "Bạn là chuyên gia pháp lý Việt Nam, am hiểu Bộ luật Lao động 2019."},
            {"role": "user", "content": prompt},
        ],
    }

    try:
        res = requests.post(LM_STUDIO_API, json=payload, timeout=60)
        result = res.json()
        answer = result["choices"][0]["message"]["content"]
    except Exception as e:
        return {"error": f"Lỗi khi gọi LM Studio API: {e}"}

    return {
        "user_message": message,
        "ai_reply": answer,
        "related_articles": related_laws
    }
