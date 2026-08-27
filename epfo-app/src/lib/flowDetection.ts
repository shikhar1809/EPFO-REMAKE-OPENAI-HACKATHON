const EPFO_KEYWORDS: { keyword: string; intent: string }[] = [
  { keyword: 'kyc', intent: 'kyc_mismatch' },
  { keyword: 'mismatch', intent: 'kyc_mismatch' },
  { keyword: 'aadhaar', intent: 'kyc_mismatch' },
  { keyword: 'name.*correct', intent: 'kyc_mismatch' },
  { keyword: 'dob', intent: 'kyc_mismatch' },
  { keyword: 'date of birth', intent: 'kyc_mismatch' },
  { keyword: 'withdraw', intent: 'withdraw_pf' },
  { keyword: 'claim', intent: 'withdraw_pf' },
  { keyword: 'advance', intent: 'withdraw_pf' },
  { keyword: 'pf.*money', intent: 'withdraw_pf' },
  { keyword: 'settle', intent: 'withdraw_pf' },
  { keyword: 'form 31', intent: 'withdraw_pf' },
  { keyword: 'form 19', intent: 'withdraw_pf' },
  { keyword: 'form 10c', intent: 'withdraw_pf' },
  { keyword: 'medical', intent: 'withdraw_pf' },
  { keyword: 'emergency', intent: 'withdraw_pf' },
  { keyword: 'transfer', intent: 'transfer_pf' },
  { keyword: 'old.*account', intent: 'transfer_pf' },
  { keyword: 'previous.*employer', intent: 'transfer_pf' },
  { keyword: 'merge', intent: 'merge_accounts' },
  { keyword: 'consolidat', intent: 'merge_accounts' },
  { keyword: 'duplicate.*uan', intent: 'merge_accounts' },
  { keyword: 'multiple.*uan', intent: 'merge_accounts' },
  { keyword: 'exit', intent: 'mark_exit' },
  { keyword: 'leaving', intent: 'mark_exit' },
  { keyword: 'resign', intent: 'mark_exit' },
  { keyword: 'quit', intent: 'mark_exit' },
  { keyword: 'left.*job', intent: 'mark_exit' },
  { keyword: 'life.*cert', intent: 'life_certificate' },
  { keyword: 'pramaan', intent: 'life_certificate' },
  { keyword: 'jeevan', intent: 'life_certificate' },
  { keyword: 'pension.*cert', intent: 'life_certificate' },
  { keyword: 'grievance', intent: 'grievance' },
  { keyword: 'complain', intent: 'grievance' },
  { keyword: 'complaint', intent: 'grievance' },
  { keyword: 'reject', intent: 'grievance' },
  { keyword: 'nominee', intent: 'kyc_mismatch' },
  { keyword: 'nomination', intent: 'kyc_mismatch' },
  { keyword: 'bank.*seed', intent: 'kyc_mismatch' },
  { keyword: 'ifsc', intent: 'kyc_mismatch' },
];

const COMPOUND_PATTERNS: { pattern: RegExp; flows: string[] }[] = [
  { pattern: /fix.*(kyc|mismatch|aadhaar).*(and|then|also|after).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /(kyc|mismatch|aadhaar).*(and|then|also).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /merge.*(and|then|also).*(transfer|claim)/i, flows: ['merge_accounts', 'transfer_pf'] },
  { pattern: /(mark|set).*exit.*(and|then|also).*(claim|withdraw|transfer)/i, flows: ['mark_exit', 'withdraw_pf'] },
  { pattern: /exit.*(and|then).*(claim|withdraw|transfer)/i, flows: ['mark_exit', 'withdraw_pf'] },
  { pattern: /life.*(certificate|pramaan).*(and|then|also).*(withdraw|pension)/i, flows: ['life_certificate', 'withdraw_pf'] },
  { pattern: /(grievance|complain).*(and|then|also).*(withdraw|claim)/i, flows: ['grievance', 'withdraw_pf'] },
  { pattern: /nomine.*(and|then|also).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /bank.*(and|then|also).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /fix.*(kyc|mismatch).*(and|then|also).*(exit|mark)/i, flows: ['kyc_mismatch', 'mark_exit'] },
  { pattern: /(exit|mark).*exit.*(and|then|also).*(transfer|merge)/i, flows: ['mark_exit', 'transfer_pf'] },
  { pattern: /merge.*(and|then|also).*(withdraw|claim)/i, flows: ['merge_accounts', 'withdraw_pf'] },
  { pattern: /(grievance|complain).*(and|then|also).*(transfer|merge)/i, flows: ['grievance', 'transfer_pf'] },
  { pattern: /life.*(cert|pramaan).*(and|then|also).*(grievance|complain)/i, flows: ['life_certificate', 'grievance'] },
  { pattern: /transfer.*(and|then|also).*(withdraw|claim)/i, flows: ['transfer_pf', 'withdraw_pf'] },
  { pattern: /fix.*(kyc|mismatch).*(and|then|also).*(nomine|bank|ifsc)/i, flows: ['kyc_mismatch', 'kyc_mismatch'] },
  { pattern: /aadhaar.*(and|then|also).*(kyc|mismatch|bank)/i, flows: ['kyc_mismatch', 'kyc_mismatch'] },
];

function extractIntents(query: string): string[] {
  const lower = query.toLowerCase();
  const found = new Set<string>();
  for (const { keyword, intent } of EPFO_KEYWORDS) {
    if (new RegExp(keyword, 'i').test(lower)) {
      found.add(intent);
    }
  }
  return Array.from(found);
}

function hasConjunction(query: string): boolean {
  return /\b(and|then|also|after|before|plus|with|while|once)\b/i.test(query);
}

export function detectCompoundIntent(query: string): string[] | null {
  const lower = query.toLowerCase();

  // Always extract all intents from the query
  const allIntents = hasConjunction(query) ? extractIntents(lower) : [];
  const uniqueAllIntents = Array.from(new Set(allIntents));

  // Check explicit compound patterns first
  for (const { pattern, flows } of COMPOUND_PATTERNS) {
    if (pattern.test(lower)) {
      // Merge pattern flows with any additional intents detected via keywords
      const merged = Array.from(new Set([...flows, ...uniqueAllIntents]));
      return merged.length >= 2 ? merged.slice(0, 4) : flows;
    }
  }

  // Flexible fallback: any 2+ EPFO keywords joined by conjunctions
  if (uniqueAllIntents.length >= 2) {
    return uniqueAllIntents.slice(0, 4);
  }

  return null;
}

export function classifyIntent(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('life') || lower.includes('certificate') || lower.includes('pramaan') || lower.includes('jeevan')) return 'life_certificate';
  if (lower.includes('exit') || lower.includes('leaving') || lower.includes('quit') || lower.includes('resign') || lower.includes('left my job')) return 'mark_exit';
  if (lower.includes('withdraw') || lower.includes('advance') || lower.includes('claim') || lower.includes('medical') || lower.includes('emergency') || lower.includes('form 31') || lower.includes('form 19')) return 'withdraw_pf';
  if (lower.includes('transfer') || lower.includes('old account') || lower.includes('previous employer')) return 'transfer_pf';
  if (lower.includes('merge') || lower.includes('consolidat') || lower.includes('duplicate') || lower.includes('multiple uan')) return 'merge_accounts';
  if (lower.includes('grievance') || lower.includes('complaint') || lower.includes('reject') || lower.includes('complain')) return 'grievance';
  if (lower.includes('kyc') || lower.includes('mismatch') || lower.includes('aadhaar') || lower.includes('nominee') || lower.includes('nomination') || lower.includes('bank') || lower.includes('ifsc') || lower.includes('dob') || lower.includes('date of birth')) return 'kyc_mismatch';
  return 'general_inquiry';
}
