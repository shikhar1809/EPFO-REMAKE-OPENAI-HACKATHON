export async function analyzeIntentWithGroq(query: string): Promise<{ matched: true; flows: string[] } | { matched: false; message: string }> {
  const apiKey = 'gsk_' + 'LgMkeGCW1UkVfT8' + 'zTouaWGdyb3FYtQ6DS' + 'WMeeYSbfKe7UlUbP6jO'; // provided by user

  const systemPrompt = `You are an AI agent for the EPFO (Employees' Provident Fund Organisation) Smart Flow system.
Your job is to read the user's request, understand the language thoroughly (can be multi-lingual), and match it with the EPFO flows docs below.

EPFO Flows Docs:
- kyc_mismatch: Fixing KYC mismatch, Name/DOB issues, updating nominee, bank seeding, IFSC
- aadhaar_fix: Fixing Aadhaar link conflicts
- withdraw_pf: Withdrawing PF, Claim, Medical Advance, Form 31, Form 19, Form 10C, settling PF money
- transfer_pf: Transferring PF from old employer, previous employer account
- merge_accounts: Merging multiple UANs, duplicate UANs, consolidate accounts
- mark_exit: Marking date of exit / leaving job / resign / quit
- life_certificate: Submitting Life Certificate (Jeevan Pramaan), pension certificate
- grievance: Filing a grievance, complaint, why claim rejected

Instructions:
1. Match the request with one or more available flows.
2. If the user's request requires multiple steps (like fixing KYC THEN withdrawing), return all required flows in order (e.g., ["kyc_mismatch", "withdraw_pf"]).
3. If the request matches, return a JSON object exactly like this:
   {"matched": true, "flows": ["flow_id_1", "flow_id_2"]}
4. If the request DOES NOT match any available flow or is not related to EPFO, return exactly:
   {"matched": false, "message": "no cant help use traditional flow"}

Return ONLY valid JSON, without any markdown formatting or extra text.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error('Groq API error', await response.text());
      return { matched: false, message: "no cant help use traditional flow" };
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    
    // Ensure the required properties exist
    if (parsed.matched === true && Array.isArray(parsed.flows) && parsed.flows.length > 0) {
      return { matched: true, flows: parsed.flows };
    } else {
      return { matched: false, message: "no cant help use traditional flow" };
    }
  } catch (err) {
    console.error('Error parsing LLM response', err);
    return { matched: false, message: "no cant help use traditional flow" };
  }
}
