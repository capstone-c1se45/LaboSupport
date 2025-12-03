import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import io

# 🧭 Đường dẫn đến tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r"D:\TesseractOCRNew\tesseract.exe"

def process_images(files):
    texts = []

    for file in files:
        # ---- 1. Đọc ảnh từ bytes bằng OpenCV ----
        np_img = np.frombuffer(file, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        # ---- 2. Chuyển sang grayscale ----
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # ---- 3. Lọc nhiễu bằng Gaussian blur ----
        gray = cv2.GaussianBlur(gray, (3, 3), 0)

        # ---- 4. Tăng tương phản bằng CLAHE ----
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        # ---- 5. Chuyển thành ảnh đen trắng (threshold) ----
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # ---- 6. Chuyển sang định dạng Pillow để OCR ----
        pil_img = Image.fromarray(thresh)
        pil_img = pil_img.filter(ImageFilter.MedianFilter())
        pil_img = ImageEnhance.Contrast(pil_img).enhance(1.5)

        # ---- 7. OCR ----
        text = pytesseract.image_to_string(
            pil_img,
            lang='vie+eng',
            config='--oem 3 --psm 6'
        )

        texts.append(text.strip())

    # Gộp kết quả từ tất cả ảnh
    return "\n\n".join(texts)

with open("ai_service/src/ocr/HopDongLaoDong_Bank1.png", "rb") as f1, open("ai_service/src/ocr/HopDongLaoDong_Bank2.png", "rb") as f2:
    files = [f1.read(), f2.read()]

text_result = process_images(files)
print(text_result)

