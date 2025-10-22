from fastapi import FastAPI, UploadFile, File,Form
from pydantic import BaseModel
import requests, os
from untils.text_extract import extract_text_from_pdf_bytes, extract_text_from_docx
from vector_store import query_law
from typing import List, Dict

app = FastAPI()

LM_STUDIO_API = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "openai/gpt-oss-20b"  


chat_sessions: Dict[str, List[Dict[str, str]]] = {}


@app.get("/")
def read_root():
    return {"message": "AI Legal Contract & Law Chatbot is running 🚀"}

def ask_model(messages):
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
    }
    res = requests.post(LM_STUDIO_API, json=payload, timeout=120)
    res.raise_for_status()
    result = res.json()
    return result.get("choices", [{}])[0].get("message", {}).get("content", "")

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

    if not contract_text.strip():
        return {"error": "Không thể đọc nội dung hợp đồng."}

    related_laws = query_law(contract_text[:300])
    law_context = "\n\n".join(
        [f"Điều {l['article_number']}: {l['article_title']}\n{l['content']}" for l in related_laws]
    )

    contract_excerpt = contract_text[:1200].rsplit('.', 1)[0] + '.'
    prompt = f"""
Bạn là chuyên gia pháp lý Việt Nam.

--- Nội dung hợp đồng ---
{contract_excerpt}

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
            {"role": "system", "content": "Bạn là chuyên gia pháp lý Việt Nam, am hiểu Bộ luật Lao động 2019."},
            {"role": "user", "content": prompt},
        ],
    }

    try:
        res = requests.post(LM_STUDIO_API, json=payload, timeout=180)
        res.raise_for_status()
        result = res.json()
        answer = res
    except Exception as e:
        return {"error": f"Error calling LM Studio API: {str(e)}"}
    return {"summary": answer, "related_articles": related_laws}

# 💬 API chat (hỏi đáp luật)
@app.post("/chat")
async def chat_with_ai(message: str = Form(...), session_id: str = Form("default")):
    message = message.strip()
    if not message:
        return {"error": "Tin nhắn không được để trống."}

    # --- Khởi tạo lịch sử chat nếu chưa có ---
    if session_id not in chat_sessions:
        chat_sessions[session_id] = [
            {"role": "system", "content": "Bạn là chuyên gia pháp lý Việt Nam, am hiểu Bộ luật Lao động 2019."}
        ]

    # --- Tìm điều luật liên quan ---
    related_laws = query_law(message, top_k=3)
    law_context = "\n\n".join(
        [f"Điều {l['article_number']}: {l['article_title']}\n{l['content']}" for l in related_laws]
    )

    # --- Tạo prompt hợp nhất ---
    prompt = f"""
Câu hỏi: {message}

--- Điều luật liên quan ---
{law_context}

Yêu cầu:
- Trả lời bằng tiếng Việt dễ hiểu.
- Dẫn điều luật nếu có.
- Nếu không có quy định phù hợp, trả lời: "Không có quy định cụ thể trong Bộ luật Lao động 2019".
"""

    # --- Thêm vào lịch sử ---
    chat_sessions[session_id].append({"role": "user", "content": prompt})

    # --- Gọi model ---
    try:
        answer = ask_model(chat_sessions[session_id])
    except Exception as e:
        return {"error": f"Lỗi khi gọi LM Studio API: {e}"}

    # --- Lưu phản hồi vào lịch sử ---
    chat_sessions[session_id].append({"role": "assistant", "content": answer})

    return {
        "session_id": session_id,
        "user_message": message,
        "ai_reply": answer,
        "related_articles": related_laws,
        "history_count": len(chat_sessions[session_id])
    }

# 🔄 API reset chat (xóa lịch sử phiên)
@app.post("/reset_chat")
def reset_chat(session_id: str = Form("default")):
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        return {"message": f"Đã xóa lịch sử chat của phiên {session_id}."}
    return {"message": "Không có phiên nào để xóa."}
