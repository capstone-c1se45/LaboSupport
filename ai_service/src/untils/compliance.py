# utils/compliance.py (hoặc internal_analysis.py)
import re
from typing import Dict



# Danh sách các từ khóa đại diện cho các điều khoản bắt buộc
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