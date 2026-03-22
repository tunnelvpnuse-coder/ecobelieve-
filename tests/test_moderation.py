from app.services.moderation import moderate_message


def test_business_message_is_allowed():
    result = moderate_message("Need quotation for 200 units, confirm shipping timeline.")
    assert result.action == "allow"
    assert result.score < 0.45


def test_suspicious_message_is_warned_or_blocked():
    result = moderate_message("Let's move to WhatsApp and do bank transfer outside platform.")
    assert result.action in {"warn", "block"}
    assert result.score >= 0.45


def test_high_risk_message_is_blocked():
    result = moderate_message(
        "Send OTP now, we will provide fake receipt and complete outside platform via telegram."
    )
    assert result.action == "block"
    assert result.score >= 0.8
