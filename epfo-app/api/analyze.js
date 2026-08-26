import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an EPFO (Employee Provident Fund Organisation) assistant that classifies user requests.
Given a user message in any Indian language or English, classify it into one of these workflow types.

Workflow types:
- withdraw_pf: PF withdrawal, advance, claim, medical/education/marriage withdrawal
- transfer_pf: Transfer PF from old employer to new, merge accounts, consolidate UAN
- life_certificate: Jeevan Pramaan, life certificate for pensioners, annual pension proof
- mark_exit: Mark date of exit, leaving job, resignation, employer exit, EPF exit date
- grievance: Complaint, claim rejected, delay, employer not depositing
- kyc_mismatch: Name mismatch, DOB mismatch, Aadhaar details wrong, update KYC, joint declaration
- passbook: Check PF balance, passbook, statement, contributions, how much PF do I have
- uan_activation: Activate UAN, new UAN, first time registration
- general_inquiry: Any other EPFO question

Respond ONLY with valid JSON:
{
  "taskType": "<workflow type>",
  "confidence": <0.0 to 1.0>,
  "intent_summary": "<one sentence in English>",
  "detected_language": "<language name>",
  "urgency": "low" | "medium" | "high",
  "key_entities": { "amount": "<or null>", "reason": "<or null>", "employer": "<or null>" }
}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: message }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 300,
    });
    const result = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json({ ...result, usage: completion.usage });
  } catch (error) {
    console.error("OpenAI error:", error);
    const lower = message.toLowerCase();
    let taskType = "general_inquiry";
    if (lower.includes("withdraw") || lower.includes("advance") || lower.includes("claim")) taskType = "withdraw_pf";
    else if (lower.includes("transfer") || lower.includes("merge")) taskType = "transfer_pf";
    else if (lower.includes("life") || lower.includes("certificate") || lower.includes("pramaan")) taskType = "life_certificate";
    else if (lower.includes("exit") || lower.includes("leaving") || lower.includes("resign")) taskType = "mark_exit";
    else if (lower.includes("mismatch") || lower.includes("name wrong") || lower.includes("dob wrong") || lower.includes("kyc")) taskType = "kyc_mismatch";
    else if (lower.includes("grievance") || lower.includes("complaint") || lower.includes("reject")) taskType = "grievance";
    else if (lower.includes("balance") || lower.includes("passbook") || lower.includes("statement")) taskType = "passbook";
    return res.status(200).json({ taskType, confidence: 0.5, intent_summary: message, detected_language: "English", urgency: "medium", key_entities: { amount: null, reason: null, employer: null }, _fallback: true });
  }
}
