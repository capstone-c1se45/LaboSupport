from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import requests, os
from typing import List, Dict
import asyncio
from concurrent.futures import ThreadPoolExecutor
import json
from untils.internal_analysis import generate_internal_report
from untils.compliance import run_compliance_check 
from untils.text_extract import extract_text_from_pdf_bytes, extract_text_from_docx 
from vector_store import query_law 
from ocr.ocr_utils import process_images

GEMINI_API_KEY = "AIzaSyB0GGFyJLAytwEUGQk8ztw4nXjQQeAwEFU" 

MODEL_NAME_COMPLEX = "gemini-2.5-pro"
MODEL_NAME_CHAT = "gemini-2.5-flash" 
# GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME_COMPLEX}:generateContent?key={GEMINI_API_KEY}"
# GEMINI_CHAT_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME_CHAT}:generateContent?key={GEMINI_API_KEY}"


app = FastAPI()
executor = ThreadPoolExecutor()
chat_sessions: Dict[str, List[Dict[str, str]]] = {}

@app.get("/")
def read_root():
    return {"message": "AI Legal Contract & Law Chatbot is running 🚀"}

def call_gemini_api(messages: List[Dict[str, str]], model_url: str):
    
    gemini_contents = []
    system_instruction = None
    
    for msg in messages:
        # Tách System message ra khỏi contents
        if msg['role'] == 'system':
            system_instruction = msg['content']
            continue
            
        role = 'model' if msg['role'] == 'assistant' else 'user'
        gemini_contents.append({
            "role": role,
            "parts": [{"text": msg['content']}]
        })

    payload = {
        "contents": gemini_contents,
    }
    
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    headers = {
        "Content-Type": "application/json"
    }
    
    res = requests.post(model_url, headers=headers, json=payload, timeout=180)
    res.raise_for_status()
    
    result = res.json()
    
    answer = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    return answer

#PHÂN TÍCH HỢP ĐỒNG
#api phân tích
@app.post("/analyze_contract")
async def analyze_contract(file: UploadFile = File(...)):
    
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)

    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {e}")

    contract_text = ""
    if file.filename.endswith(".pdf"):
        try:
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            contract_text = extract_text_from_pdf_bytes(file_bytes)
        except Exception:
            raise HTTPException(status_code=400, detail="Lỗi trích xuất văn bản từ file PDF.")
            
    elif file.filename.endswith(".docx"):
        try:
            contract_text = extract_text_from_docx(file_path)
        except Exception:
            raise HTTPException(status_code=400, detail="Lỗi trích xuất văn bản từ file DOCX.")
    else:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF hoặc DOCX.")

    if not contract_text.strip():
        raise HTTPException(status_code=400, detail="Không thể đọc nội dung hợp đồng (file rỗng).")

    contract_excerpt = contract_text[:8000].rsplit('.', 1)[0] + '.' if len(contract_text) > 8000 else contract_text

    system_prompt = "Bạn là chuyên gia pháp lý Việt Nam, am hiểu Bộ luật Lao động 2019."
    user_prompt = f"""
    Dưới đây là nội dung hợp đồng lao động:

    --- HỢP ĐỒNG ---
    {contract_excerpt}

    Hãy thực hiện các yêu cầu sau:
    1. Tóm tắt nội dung hợp đồng ngắn gọn, dễ hiểu.
    2. Đánh giá quyền lợi và nghĩa vụ của người lao động trong hợp đồng này.
    3. Phân tích xem có điều khoản nào có dấu hiệu vi phạm Bộ luật Lao động 2019 không.
    4. Đề xuất cách chỉnh sửa để hợp đồng phù hợp pháp luật hơn.
    Trình bày bằng tiếng Việt dễ hiểu và sử dụng format Markdown.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        loop = asyncio.get_event_loop()
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME_COMPLEX}:generateContent?key={GEMINI_API_KEY}"
        answer = await loop.run_in_executor(executor, call_gemini_api, messages, api_url)
    except requests.exceptions.HTTPError as http_err:
        error_detail = f"Lỗi HTTP khi gọi Gemini API: {http_err}. Kiểm tra API Key và URL."
        raise HTTPException(status_code=http_err.response.status_code if http_err.response else 500, detail=error_detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi Gemini API: {e}")

    return {"summary": answer}


def call_gemini_api_sync(messages: List[Dict[str, str]]):
    
    model_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME_CHAT}:generateContent?key={GEMINI_API_KEY}"
    
    return call_gemini_api(messages, model_url)

# 💬 API chat (hỏi đáp luật)
@app.post("/chat")
async def chat_with_ai(message: str = Form(...), session_id: str = Form("default")):

    message = message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống.")

    if session_id not in chat_sessions:
        chat_sessions[session_id] = [
            {
                "role": "system",
                "content": (
                    "Bạn là chuyên gia pháp lý Việt Nam, am hiểu **duy nhất về Bộ luật Lao động 2019**. "
                    "Nhiệm vụ của bạn chỉ là trả lời các câu hỏi liên quan đến Luật Lao động. "
                    "Nếu người dùng hỏi về bất kỳ chủ đề nào khác (ví dụ: công thức nấu ăn, tin tức, lịch sử, toán học, luật dân sự, luật hình sự, v.v.), "
                    "bạn phải trả lời **chính xác** câu sau: 'Xin lỗi, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến Bộ luật Lao động 2019. Vui lòng hỏi tôi về luật lao động.' " # THAY ĐỔI LỚN
                    
                    "Hãy chú ý phân tích các thông tin được cung cấp trong phần 'PHÂN TÍCH NỘI BỘ' và 'Điều luật liên quan' để trả lời. "
                    "Khi trả lời, hãy trình bày NGẮN GỌN, XÚC TÍCH, dễ hiểu với người dân. "
                    "Chỉ dẫn điều luật khi thật sự cần thiết."
                )
            }
        ]

    # Phân tích Nội bộ: Nhận dạng các thực thể pháp lý trong câu hỏi người dùng
    internal_report = generate_internal_report(message)



    rag_prompt = f"""
    Câu hỏi người dùng: {message}

    {internal_report}
    
 

    Yêu cầu:
    - Dựa vào các điều luật và thông tin phân tích nội bộ để trả lời câu hỏi người dùng.
    - Trả lời bằng tiếng Việt dễ hiểu, không lặp lại nguyên văn luật, và không cần lặp lại "Điều luật liên quan" hay "PHÂN TÍCH NỘI BỘ".
    """
    
    chat_sessions[session_id].append({"role": "user", "content": rag_prompt})

    try:
        loop = asyncio.get_event_loop()
        answer = await loop.run_in_executor(executor, call_gemini_api_sync, chat_sessions[session_id])
    except requests.exceptions.HTTPError as http_err:
        error_detail = f"Lỗi HTTP khi gọi Gemini API (Chat): {http_err}. Kiểm tra API Key và URL."
        raise HTTPException(
            status_code=http_err.response.status_code if http_err.response else 500,
            detail=error_detail,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi Gemini API (Chat): {e}")

    answer = answer.strip()
    # if len(answer) > 800:
    #     answer = answer[:800].rsplit('.', 1)[0] + "."

    chat_sessions[session_id].append({"role": "assistant", "content": answer})

    return {
        "session_id": session_id,
        "user_message": message,
        "ai_reply": answer,
        "internal_entities": internal_report.splitlines()[1:-1] if internal_report else [],
        "history_count": len(chat_sessions[session_id]),
    }

# API reset chat (xóa lịch sử phiên)
@app.post("/reset_chat")
def reset_chat(session_id: str = Form("default")):
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        return {"message": f"Đã xóa lịch sử chat của phiên {session_id}."}
    return {"message": "Không có phiên nào để xóa."}

@app.post("/ocr")
async def ocr_endpoint(files: List[UploadFile] = File(...)):
    """
    Nhận 1 hoặc nhiều ảnh từ Node.js, xử lý OCR và trả kết quả.
    """
    contents = [await f.read() for f in files]
    result = process_images(contents)

    return {
        "message": "OCR thành công!",
        "text": result["text"],
        "pdf_path": result["pdf_path"]
    }