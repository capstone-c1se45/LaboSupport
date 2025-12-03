import pytesseract
from PIL import Image
import cv2
import numpy as np
import io

pytesseract.pytesseract.tesseract_cmd = r"D:\TesseractOCRNew\tesseract.exe"

def ocr_image(file_bytes, enhance=False):
    
    if not enhance:
        # Đọc ảnh bằng Pillow 
        img = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(img, lang='vie+eng', config='--psm 6').strip()
    else:
        # Xử lý nâng cao (cho ảnh mờ)
        np_img = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        pil_img = Image.fromarray(thresh)
        return pytesseract.image_to_string(pil_img, lang='vie+eng', config='--psm 6').strip()

# with open("ai_service/src/ocr/HopDongLaoDong_Bank2.png", "rb") as f:
#     file_bytes = f.read()

# text = ocr_image(file_bytes, enhance=False)  # Thường dùng False
# print(text)
