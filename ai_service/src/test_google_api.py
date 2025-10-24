import google.genai as genai
import os

# 1. Lấy API Key từ biến môi trường (cách bảo mật)
# Đảm bảo bạn đã đặt biến môi trường GEMINI_API_KEY
GEMINI_API_KEY = "AIzaSyB0GGFyJLAytwEUGQk8ztw4nXjQQeAwEFU"
client = genai.Client(api_key=GEMINI_API_KEY)

# 2. Gửi yêu cầu
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Giải thích trí tuệ nhân tạo bằng các từ đơn giản."
)

# 3. Xử lý phản hồi
print(response.text)