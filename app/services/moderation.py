from dataclasses import dataclass
from typing import List


SUSPICIOUS_TERMS = {
    "whatsapp": 0.35,
    "telegram": 0.35,
    "outside platform": 0.4,
    "wire me": 0.35,
    "bank transfer": 0.3,
    "crypto only": 0.3,
    "send otp": 0.45,
    "fake receipt": 0.6,
    "scam": 0.5,
}

BUSINESS_TERMS = {
    "product",
    "price",
    "quotation",
    "bulk",
    "shipping",
    "delivery",
    "moq",
    "quality",
    "invoice",
    "order",
    "sample",
}


@dataclass
class ModerationResult:
    score: float
    action: str
    reason: str
    tags: List[str]


def moderate_message(content: str) -> ModerationResult:
    lowered = content.lower()
    score = 0.0
    tags: List[str] = []

    for term, term_score in SUSPICIOUS_TERMS.items():
        if term in lowered:
            score += term_score
            tags.append(f"suspicious:{term}")

    business_hits = sum(1 for term in BUSINESS_TERMS if term in lowered)
    if business_hits == 0:
        score += 0.25
        tags.append("low-business-context")
    else:
        score -= min(0.2, business_hits * 0.03)

    score = max(0.0, min(1.0, score))
    if score >= 0.8:
        return ModerationResult(
            score=score,
            action="block",
            reason="High-risk or potentially fraudulent content detected",
            tags=tags,
        )
    if score >= 0.45:
        return ModerationResult(
            score=score,
            action="warn",
            reason="Message contains risky patterns; monitor closely",
            tags=tags,
        )
    return ModerationResult(
        score=score,
        action="allow",
        reason="Business-safe content",
        tags=tags,
    )
