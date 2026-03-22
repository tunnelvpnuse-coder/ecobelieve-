import type { ModerationResult } from "../types.js";

const riskPatterns: Array<{ regex: RegExp; flag: string; score: number }> = [
  {
    regex:
      /\b(whatsapp|telegram|wechat|gmail|outlook|email me|direct contact)\b/i,
    flag: "OFF_PLATFORM_CONTACT_ATTEMPT",
    score: 40
  },
  {
    regex: /\b(pay outside|bank transfer only|crypto only|usdt|btc)\b/i,
    flag: "OFF_PLATFORM_PAYMENT_ATTEMPT",
    score: 55
  },
  {
    regex: /\b(fake|scam|stolen|counterfeit|phishing)\b/i,
    flag: "FRAUD_OR_ILLEGAL_KEYWORDS",
    score: 65
  },
  {
    regex: /\b(urgent secret deal|bypass platform|hide this)\b/i,
    flag: "SUSPICIOUS_NEGOTIATION",
    score: 35
  }
];

export const moderateBusinessMessage = (text: string): ModerationResult => {
  const normalized = text.trim();
  const flags: string[] = [];
  let score = 0;

  for (const pattern of riskPatterns) {
    if (pattern.regex.test(normalized)) {
      flags.push(pattern.flag);
      score += pattern.score;
    }
  }

  if (normalized.length < 3) {
    flags.push("LOW_SIGNAL_MESSAGE");
    score += 10;
  }

  const boundedScore = Math.min(score, 100);

  if (boundedScore >= 70) {
    return {
      riskScore: boundedScore,
      flags,
      action: "BLOCK"
    };
  }

  if (boundedScore >= 35) {
    return {
      riskScore: boundedScore,
      flags,
      action: "REVIEW"
    };
  }

  return {
    riskScore: boundedScore,
    flags,
    action: "ALLOW"
  };
};
