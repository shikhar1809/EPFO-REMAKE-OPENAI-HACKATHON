import type { Phase } from '../store/useWorkflowStore';

export const PHASE_META: Record<string, { label: string; description: string }> = {
  kyc_mismatch: { label: 'Fix KYC Mismatch', description: 'Correct your name/DOB mismatch between EPFO and Aadhaar' },
  withdraw_pf: { label: 'Withdraw PF', description: 'File your PF withdrawal claim (Form 31/19/10C)' },
  merge_accounts: { label: 'Merge Accounts', description: 'Consolidate duplicate UAN accounts under one UAN' },
  transfer_pf: { label: 'Transfer PF', description: 'Transfer PF balance from old employer to current' },
  mark_exit: { label: 'Mark Exit Date', description: 'Self-declare your date of exit from employment' },
  life_certificate: { label: 'Life Certificate', description: 'Renew your digital life certificate for pension' },
  grievance: { label: 'File Grievance', description: 'Register and track an EPFO grievance' },
};

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

  for (const { pattern, flows } of COMPOUND_PATTERNS) {
    if (pattern.test(lower)) return flows;
  }

  if (hasConjunction(query)) {
    const intents = extractIntents(lower);
    if (intents.length >= 2) {
      const uniqueIntents = Array.from(new Set(intents));
      if (uniqueIntents.length >= 2) {
        return uniqueIntents.slice(0, 4);
      }
    }
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

export function generatePlan(taskType: string): { step: string; description: string; status: 'pending' | 'active' | 'completed' }[] {
  switch (taskType) {
    case 'withdraw_pf':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
        { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
        { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
        { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
      ];
    case 'transfer_pf':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' },
        { step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' },
        { step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' },
      ];
    case 'life_certificate':
      return [
        { step: 'verify_identity', description: 'Verify pensioner identity', status: 'active' },
        { step: 'fetch_pension_details', description: 'Retrieve PPO and bank details', status: 'pending' },
        { step: 'capture_face', description: 'Perform UIDAI face authentication', status: 'pending' },
        { step: 'submit_certificate', description: 'Generate & submit Jeevan Pramaan', status: 'pending' },
      ];
    case 'mark_exit':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_employment', description: 'Retrieve employment records', status: 'pending' },
        { step: 'select_exit_reason', description: 'Select establishment and reason for exit', status: 'pending' },
        { step: 'submit_exit', description: 'Aadhaar OTP sign & confirm exit', status: 'pending' },
      ];
    case 'grievance':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'analyze_issue', description: 'Analyze rejection reason or delay', status: 'pending' },
        { step: 'register_grievance', description: 'Register EPFiGMS ticket automatically', status: 'pending' },
        { step: 'generate_reference', description: 'Generate tracking reference number', status: 'pending' },
      ];
    case 'kyc_mismatch':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'analyze_mismatch', description: 'Compare EPFO vs Aadhaar records', status: 'pending' },
        { step: 'draft_declaration', description: 'Draft Joint Declaration for correction', status: 'pending' },
        { step: 'submit_declaration', description: 'Aadhaar OTP sign & submit to EPFO', status: 'pending' },
      ];
    case 'merge_accounts':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_linked_accounts', description: 'Discover duplicate UANs via Aadhaar', status: 'pending' },
        { step: 'select_accounts_to_merge', description: 'Select accounts to consolidate', status: 'pending' },
        { step: 'submit_merge_request', description: 'Aadhaar OTP sign & submit merge', status: 'pending' },
      ];
    default:
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'process_inquiry', description: 'Analyze your request & calculate rules', status: 'pending' },
        { step: 'resolve_inquiry', description: 'Provide accurate guidance or grievance path', status: 'pending' },
      ];
  }
}

export function buildMultiPhaseTask(detectedFlows: string[]): { phases: Phase[]; combinedPlan: { step: string; description: string; status: 'pending' | 'active' | 'completed' }[] } {
  const phases: Phase[] = detectedFlows.map((flowType, idx) => ({
    id: `phase-${idx + 1}`,
    label: PHASE_META[flowType]?.label || flowType,
    description: PHASE_META[flowType]?.description || '',
    taskType: flowType,
    plan: generatePlan(flowType),
    status: idx === 0 ? 'active' as const : 'pending' as const,
  }));

  const combinedPlan = phases.flatMap((phase, phaseIdx) =>
    phase.plan.map((step, stepIdx) => ({
      ...step,
      step: `phase${phaseIdx}_${step.step}`,
      status: (phaseIdx === 0 && stepIdx === 0) ? 'active' as const : 'pending' as const,
    }))
  );

  return { phases, combinedPlan };
}
