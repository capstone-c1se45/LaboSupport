from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_path = r"ai_service/model/Phi-3-mini-4k-instruct"  # Thay đúng đường dẫn bạn clone

print("🔄 Đang load model...")
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float32,   # Dùng CPU thì float32 ổn định hơn
)

print("✅ Model đã load xong!")

# Prompt test
prompt = "Viết một đoạn chào buổi sáng vui vẻ bằng tiếng Việt."

# Tokenize và generate
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    temperature=0.7,
)

# Giải mã kết quả
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print("\n🧠 Kết quả model:")
print(response)
