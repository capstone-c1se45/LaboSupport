import requests
import json

API_KEY = ""  

def call_gemini(model, text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

    payload = {
        "contents": [
            {
                "parts": [{"text": text}]
            }
        ]
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers)

    print(f"--- Model: {model} ---")
    print("Status:", response.status_code)
    try:
        print("Response:", json.dumps(response.json(), indent=4, ensure_ascii=False))
    except:
        print("Raw Response:", response.text)
    print("\n---------------------------------------------\n")


test_text = "Tóm tắt câu này trong 1 câu: Hợp đồng lao động là sự thỏa thuận giữa người lao động và người sử dụng lao động."


call_gemini("gemini-2.5-pro", test_text)
