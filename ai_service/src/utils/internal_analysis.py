from google import genai
import os
from src.db.chroma_client import chroma_db
from src.db.mysql_client import mysql_db
from src.models import AIResponse, LawReference
from src.utils.compliance import ComplianceAnalyzer
from typing import List, Dict
import re
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '..', '.env')
load_dotenv(env_path)

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

class RAGEngine:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ Warning: GEMINI_API_KEY is missing in .env")
        
        # Khởi tạo Client theo SDK mới
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.0-flash-exp'

    async def process_query(self, query_text: str) -> AIResponse:
        # 1. Search ChromaDB
        search_results = chroma_db.query_similar_chunks(query_text)
        
        if not search_results:
            return AIResponse(
                answer="Xin lỗi, tôi không tìm thấy văn bản luật nào liên quan trong cơ sở dữ liệu.",
                references=[]
            )

        # 2. Get full content from MySQL
        chunk_ids = [hit['chunk_id'] for hit in search_results]
        db_records = mysql_db.get_law_content(chunk_ids)

        if not db_records:
            return AIResponse(
                answer="Có lỗi khi truy xuất dữ liệu chi tiết từ hệ thống.",
                references=[]
            )

        # 3. Create Context
        context_str = ""
        references_list = []
        
        for i, record in enumerate(db_records):
            score = next((x['score'] for x in search_results if x['chunk_id'] == record['section_id']), 0)
            
            full_title = f"{record.get('law_reference', '')} - {record.get('article_title', '')}"
            
            ref_obj = LawReference(
                law_id=str(record.get('law_id', '')),
                section_id=str(record.get('section_id', '')),
                title=full_title,
                content=record.get('content', '')[:200] + "...",
                relevance_score=score
            )
            references_list.append(ref_obj)
            
            context_str += (
                f"--- Nguồn {i+1} ---\n"
                f"Văn bản: {record.get('law_name')}\n"
                f"Điều: {record.get('law_reference')}\n"
                f"Nội dung: {record.get('content')}\n\n"
            )

        # 4. Generate Answer
        system_prompt = (
            "Bạn là trợ lý pháp lý ảo. Nhiệm vụ: Trả lời câu hỏi dựa CHÍNH XÁC vào thông tin được cung cấp bên dưới. "
            "Tuyệt đối không bịa đặt luật. Nếu không có thông tin, hãy nói không biết. "
            "Trích dẫn điều luật cụ thể khi trả lời."
        )
        
        full_prompt = f"{system_prompt}\n\nTHÔNG TIN PHÁP LÝ:\n{context_str}\n\nCÂU HỎI:\n{query_text}"
        
        try:
            # Gọi API theo cú pháp mới (client.models.generate_content)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            generated_text = response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            generated_text = "Hệ thống AI đang bận hoặc gặp lỗi kết nối, vui lòng thử lại sau."

        # 5. Compliance Check
        compliance_result = ComplianceAnalyzer.validate_response(generated_text, db_records)

        return AIResponse(
            answer=generated_text,
            references=references_list,
            compliance_check=compliance_result
        )

# Singleton
rag_engine = RAGEngine()