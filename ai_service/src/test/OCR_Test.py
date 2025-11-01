from PIL import Image
import pytesseract
import os

# Đường dẫn tới folder chứa ảnh hợp đồng
pytesseract.pytesseract.tesseract_cmd = r"E:\OCR\tesseract.exe"
image_folder = "ai_service/src/images"
output_pdf = "ai_service/src/uploads/hopdong_full.pdf"

# Lấy danh sách file ảnh (sắp xếp theo tên)
images = sorted([
    os.path.join(image_folder, f)
    for f in os.listdir(image_folder)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
])

# Chuyển ảnh sang grayscale
gray_images = [Image.open(img).convert("L") for img in images]

# Ghép thành 1 file PDF duy nhất
gray_images[0].save(
    output_pdf,
    save_all=True,
    append_images=gray_images[1:]
)

for img in gray_images:
    text = pytesseract.image_to_string(img, lang='vie+eng',config='--oem 3 --psm 6')
    print(text)

print(f"✅ Đã ghép {len(images)} ảnh thành PDF: {output_pdf}")
