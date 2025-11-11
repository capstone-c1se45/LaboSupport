import pytesseract
from PIL import Image

# 🧭 Đặt đúng đường dẫn đến tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r"E:\TesseractOCRNew\tesseract.exe"
#E:\TesseractOCRNew

# 📸 Đường dẫn đến ảnh bạn muốn đọc (ví dụ ảnh test.png trong cùng thư mục)
image_path = "ai_service/src/ocr/HopDongLaoDong_Bank2.png"

# Mở ảnh và xử lý OCR
img = Image.open(image_path)
text = pytesseract.image_to_string(img, lang="vie")  # 'vie' = tiếng Việt, có thể đổi thành 'eng' nếu là tiếng Anh

# In kết quả
print("📄 Kết quả OCR:")
print(text)
