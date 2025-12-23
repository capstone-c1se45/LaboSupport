from google import genai
import os
from src.db.chroma_client import chroma_db
from src.db.mysql_client import mysql_db
from src.models import AIResponse, LawReference
from src.utils.compliance import ComplianceAnalyzer
from typing import List, Dict
import re


LEGAL_ENTITY_PATTERNS = {
    "LUAT": r"(bộ\s*luật|luật|nghị\s*định|thông\s*tư|hiến\s*pháp)\s*[a-zA-Z0-9\s]*",
    "DIEU_KHOAN": r"(điều\s*\d+|khoản\s*\d+|mục\s*\d+)",
    "LOAI_HOP_DONG": r"(hợp\s*đồng\s*không\s*xác\s*định\s*thời\s*hạn|hợp\s*đồng\s*xác\s*định\s*thời\s*hạn|hợp\s*đồng\s*lao\s*động|thử\s*việc)",
    "CHAM_DUT": r"(chấm\s*dứt\s*hợp\s*đồng|đơn\s*phương\s*chấm\s*dứt|thôi\s*việc)",
    "THOI_HAN": r"(thời\s*hạn|ngày\s*hết\s*hạn|tháng\s*bao\s*lâu)",
    "QUYEN_LOI": r"(quyền\s*lợi|phụ\s*cấp|bảo\s*hiểm|nghỉ\s*phép|lương)",
    "NGHIA_VU": r"(nghĩa\s*vụ|trách\s*nhiệm|bồi\s*thường)",
}

def identify_legal_entities(text: str) -> List[Dict[str, str]]:
    """
    Phân tích văn bản để nhận dạng các thực thể pháp lý chính.
    
    Args:
        text: Câu hỏi hoặc văn bản đầu vào.
        
    Returns:
        List[Dict]: Danh sách các thực thể được tìm thấy (loại, giá trị).
    """
    
    found_entities = []
    text_lower = text.lower()
    
    for entity_type, pattern in LEGAL_ENTITY_PATTERNS.items():
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        
        for match in matches:
          
            search_result = re.search(pattern, text, re.IGNORECASE)
            if search_result:
                entity_value = search_result.group(0).strip()
            else:
                continue
            
            found_entities.append({
                "type": entity_type,
                "value": entity_value
            })
            
    unique_entities = list({v['value']: v for v in found_entities}.values())
    
    return unique_entities

def generate_internal_report(query: str) -> str:
    
    entities = identify_legal_entities(query)
    
    if not entities:
        return ""

    report_lines = ["--- PHÂN TÍCH NỘI BỘ (Internal Analysis) ---"]
    for entity in entities:
        report_lines.append(f"- [{entity['type']}] được nhắc đến: {entity['value']}")
        
    report_lines.append("--- Hết Phân tích Nội bộ ---")
    
    return "\n".join(report_lines)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class RAGEngine:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')

    async def process_query(self, query_text: str) -> AIResponse:
        # 1. Tim kiếm các đoạn luật tương tự trong Chroma
        search_results = chroma_db.query_similar_chunks(query_text)
        
        if not search_results:
            return AIResponse(
                answer="Hiện tại hệ thống không tìm thấy cơ sở pháp lý phù hợp.",
                references=[]
            )

        # 2. Lấy nội dung luật từ MySQL dựa trên chunk_ids
        chunk_ids = [hit['chunk_id'] for hit in search_results]
        db_records = mysql_db.get_law_content(chunk_ids)

        if not db_records:
            return AIResponse(
                answer="Hiện tại hệ thống không tìm thấy cơ sở pháp lý phù hợp trong cơ sở dữ liệu.",
                references=[]
            )

        # 3. Tạo ngữ cảnh cho LLM
        context_str = ""
        references_list = []
        
        for i, record in enumerate(db_records):
            # Nhận điểm tương đồng từ kết quả tìm kiếm
            score = next((x['score'] for x in search_results if x['chunk_id'] == record['section_id']), 0)
            
            # Tạo đối tượng tham chiếu luật
            full_title = f"{record.get('law_reference', '')} - {record.get('article_title', '')}"
            
            ref_obj = LawReference(
                law_id=str(record.get('law_id', 'Unknown')),
                article_id=str(record.get('section_id', 'Unknown')),
                title=full_title.strip(),
                content=record.get('content', '')[:300] + "...", # Snippet for preview
                relevance_score=score
            )
            references_list.append(ref_obj)
            
            # Tạo ngữ cảnh văn bản
            context_str += (
                f"Nguồn {i+1}:\n"
                f"- Văn bản: {record.get('law_name')}\n"
                f"- Điều khoản: {record.get('law_reference')}\n"
                f"- Tiêu đề: {record.get('article_title')}\n"
                f"- Nội dung: {record.get('content')}\n\n"
            )

        # 4. Tạo prompt cho LLM
        system_prompt = (
            "Bạn là trợ lý AI chuyên về Luật Lao động Việt Nam. "
            "Nhiệm vụ của bạn là trả lời câu hỏi dựa CHÍNH XÁC vào các văn bản pháp luật được cung cấp dưới đây. "
            "1. Tuyệt đối KHÔNG bịa đặt thông tin. "
            "2. Nếu thông tin không có trong ngữ cảnh, hãy trả lời là không tìm thấy quy định cụ thể. "
            "3. Trích dẫn cụ thể (VD: Theo Điều 14...) khi trả lời."
        )
        
        full_prompt = f"{system_prompt}\n\nTHÔNG TIN PHÁP LÝ ĐƯỢC CUNG CẤP:\n{context_str}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n{query_text}"
        
        try:
            response = self.model.generate_content(full_prompt)
            generated_text = response.text
        except Exception as e:
            generated_text = "Xin lỗi, đã xảy ra lỗi khi xử lý câu trả lời."

        # 5. Chạy kiểm tra tuân thủ
        compliance_result = ComplianceAnalyzer.validate_response(generated_text, db_records)

        return AIResponse(
            answer=generated_text,
            references=references_list,
            compliance_check=compliance_result
        )

# Khởi tạo RAG Engine toàn cục
rag_engine = RAGEngine()