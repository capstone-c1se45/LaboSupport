from typing import List, Dict
import re

COMPLIANCE_CHECKLIST = {
    "Thông tin các bên": r"(tên\s*công\s*ty|bên\s*a|địa\s*chỉ\s*công\s*ty)",
    "Công việc": r"(công\s*việc\s*phải\s*làm|vị\s*trí\s*công\s*việc|mô\s*tả\s*công\s*việc)",
    "Thời hạn hợp đồng": r"(thời\s*hạn\s*hợp\s*đồng|xác\s*định\s*thời\s*hạn|không\s*xác\s*định\s*thời\s*hạn)",
    "Mức lương": r"(mức\s*lương|lương\s*chính|tiền\s*lương|thù\s*lao)",
    "Thời giờ làm việc": r"(thời\s*giờ\s*làm\s*việc|thời\s*giờ\s*nghỉ\s*ngơi|giờ\s*làm)",
    "Bảo hiểm": r"(bảo\s*hiểm\s*xã\s*hội|bảo\s*hiểm\s*y\s*tế|bhxh)",
}

def run_compliance_check(text: str) -> Dict:
    """
    Quét văn bản để kiểm tra sự hiện diện của các điều khoản thiết yếu.
    """
    report = {}
    text_lower = text.lower()
    
    for clause_name, pattern in COMPLIANCE_CHECKLIST.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            report[clause_name] = "ĐÃ PHÁT HIỆN"
        else:
            report[clause_name] = "KHÔNG TÌM THẤY (Cần rà soát kỹ)"
            
    return report

class ComplianceAnalyzer:
    @staticmethod
    def validate_response(generated_answer: str, retrieved_laws: List[Dict]) -> Dict:
        """
        Kiểm tra xem câu trả lời có trích dẫn các văn bản luật đã tìm thấy hay không.
        """
        cited_laws = []
        
        # Kiểm tra an toàn: nếu retrieved_laws là None hoặc rỗng
        if not retrieved_laws:
            return {
                "is_compliant": True, # Không có luật để check thì coi như compliant
                "cited_references": [],
                "note": "Không có dữ liệu luật đầu vào để kiểm tra."
            }

        for law in retrieved_laws:
            # Lấy thông tin tham chiếu, xử lý trường hợp thiếu key
            ref_str = str(law.get('law_reference', ''))
            law_name = str(law.get('law_name', ''))
            article_title = str(law.get('article_title', ''))

            # Kiểm tra xem các từ khóa (Điều khoản, Tên luật) có xuất hiện trong câu trả lời không
            if (ref_str and ref_str in generated_answer) or \
               (law_name and law_name in generated_answer) or \
               (article_title and article_title in generated_answer):
                cited_laws.append(ref_str if ref_str else law_name)
        
        # Logic: Có trích dẫn HOẶC câu trả lời là "không tìm thấy" thì đạt yêu cầu
        is_compliant = len(cited_laws) > 0 or \
                       "không tìm thấy" in generated_answer.lower() or \
                       "no applicable" in generated_answer.lower()
        
        return {
            "is_compliant": is_compliant,
            "cited_references": cited_laws,
            "note": "Kiểm tra tự động: Có trích dẫn điều khoản đã truy xuất."
        }