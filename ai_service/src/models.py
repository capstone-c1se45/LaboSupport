from pydantic import BaseModel
from typing import List, Optional, Dict

class LawReference(BaseModel):
    law_id: str
    section_id: str
    title: str
    content: str
    relevance_score: float

class AIResponse(BaseModel):
    answer: str
    references: List[LawReference]
    compliance_check: Optional[dict] = None

class ContractChatRequest(BaseModel):
    prompt: str
    context: str
    chat_history: Optional[List[Dict[str, str]]] = []