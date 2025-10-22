import json, time
from google import genai

# 🔑 Khởi tạo client với API key của bạn
client = genai.Client(api_key="AIzaSyCMNGlcftP1vAsc5Xop1BH-Jc1it_hdkkE")  # ⚠️ thay bằng API key thật của bạn

def summarise_text(text: str) -> str:
    prompt = f"""Hãy tóm tắt điều luật sau bằng tiếng Việt ngắn gọn, dễ hiểu, đúng ý chính:
{text}
Tóm tắt:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print("❌ Error:", e)
        return ""

# Đọc dữ liệu đầu vào
with open("ai_service/train/luatlaodong_chunk.json", "r", encoding="utf-8") as f:
    data = json.load(f)

train_data = []

# Lặp qua từng điều luật để tóm tắt
for item in data:
    content = item.get("content", "").strip()
    if not content:
        continue

    summary = summarise_text(content)
    time.sleep(1)  # nghỉ 1s để tránh rate limit

    train_data.append({
        "instruction": "Tóm tắt hoặc giải thích nội dung điều luật sau:",
        "input": content,
        "output": summary
    })

# Ghi ra file JSONL
output_path = "ai_service/train/train_data_with_summary.jsonl"
with open(output_path, "w", encoding="utf-8") as f:
    for d in train_data:
        f.write(json.dumps(d, ensure_ascii=False) + "\n")

print(f"✅ Hoàn thành: {len(train_data)} mẫu dữ liệu.")
