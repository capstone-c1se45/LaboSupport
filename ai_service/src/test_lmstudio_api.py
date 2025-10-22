from fastapi import FastAPI
import requests

app = FastAPI()

LMSTUDIO_URL = "http://localhost:1234/v1/chat/completions"

@app.get("/test-model")
def test_model():
    """Gửi prompt đơn giản để test model LM Studio."""
    payload = {
        "model": "liquid/lfm2-1.2b",
        "messages": [
            {"role": "system", "content": "Bạn là trợ lý AI thân thiện."},
            {"role": "user", "content": "Xin chào, bạn có hoạt động không?"}
        ],
        "temperature": 0.7
    }

    try:
        res = requests.post(LMSTUDIO_URL, json=payload, timeout=30)
        res.raise_for_status()  # ném lỗi nếu HTTP != 200
        data = res.json()

        # lấy phần text trả về
        content = data["choices"][0]["message"]["content"]
        return {"success": True, "response": content}

    except Exception as e:
        return {"success": False, "error": str(e)}
