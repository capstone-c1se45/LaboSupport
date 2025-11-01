from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import io
import os

pytesseract.pytesseract.tesseract_cmd = r"E:\OCR\tesseract.exe"

def process_images(files):
    gray_images = []
    texts = []

    for file in files:
        # Đọc ảnh từ bytes
        img = Image.open(io.BytesIO(file))

        img = img.convert("L")

        img = img.filter(ImageFilter.MedianFilter())

        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.8)

        gray_images.append(img)

        text = pytesseract.image_to_string(img, lang='vie+eng', config='--oem 3 --psm 6')
        texts.append(text.strip())

    output_dir = "ai_service/src/uploads"
    os.makedirs(output_dir, exist_ok=True)
    output_pdf = os.path.join(output_dir, "hopdong_full.pdf")

    if len(gray_images) > 1:
        gray_images[0].save(output_pdf, save_all=True, append_images=gray_images[1:])
    else:
        gray_images[0].save(output_pdf)

    return {
        "text": "\n\n".join(texts),
        "pdf_path": output_pdf
    }
