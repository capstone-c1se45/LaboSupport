import re
from typing import Dict, List



# Định nghĩa các mẫu thực thể pháp lý (Mô phỏng)
LEGAL_ENTITY_PATTERNS = {
    "LUAT": r"(bộ\s*luật|luật|nghị\s*định|thông\s*tư|hiến\s*pháp)\s*[a-zA-Z0-9\s]*",
    "DIEU_KHOAN": r"(điều\s*\d+|khoản\s*\d+|mục\s*\d+)",
    "LOAI_HOP_DONG": r"(hợp\s*đồng\s*không\s*xác\s*định\s*thời\s*hạn|hợp\s*đồng\s*xác\s*định\s*thời\s*hạn|hợp\s*đồng\s*lao\s*động|thử\s*việc)", # CHỨC NĂNG MỚI
    "CHAM_DUT": r"(chấm\s*dứt\s*hợp\s*đồng|đơn\s*phương\s*chấm\s*dứt|thôi\s*việc)", # CHỨC NĂNG MỚI
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

if __name__ == '__main__':
    test_query = "Theo Bộ luật Lao động 2019, tôi có bao nhiêu ngày nghỉ phép hằng năm? Và điều khoản nào quy định về mức lương tối thiểu? Tôi muốn chấm dứt hợp đồng lao động có xác định thời hạn."
    report = generate_internal_report(test_query)
    print(report)
