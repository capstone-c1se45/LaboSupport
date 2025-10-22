import re
import fitz  # PyMuPDF
import pdfplumber
from docx import Document


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Trích xuất văn bản từ PDF (đọc trực tiếp từ bytes).
    Dùng PyMuPDF để chính xác hơn pdfplumber với file scan hoặc layout phức tạp.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return clean_text(text.strip())


def extract_text_from_pdf_path(file_path: str) -> str:
    """
    Trích xuất văn bản từ PDF theo đường dẫn file (dùng pdfplumber).
    """
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return clean_text(text)


def extract_text_from_docx(file_path: str) -> str:
    """
    Trích xuất văn bản từ file DOCX.
    """
    doc = Document(file_path)
    full_text = "\n".join([p.text for p in doc.paragraphs])
    return clean_text(full_text)


def clean_text(text: str) -> str:
    """
    Loại bỏ watermark, link, nội dung rác.
    """
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"Downloaded by.*", "", text)
    text = re.sub(r"Studocu.*", "", text)
    text = re.sub(r"lOMoARcPSD.*", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
