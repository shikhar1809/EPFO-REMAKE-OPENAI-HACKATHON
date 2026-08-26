export interface ComparisonEntry {
  old: string;
  improved: string;
}

export interface ScenarioFeatures {
  active: string[];
  highlighted: string[];
}

type RouteScenarioMap = Record<string, Record<string, ComparisonEntry>>;

/**
 * Nested comparison data: ROUTE → SCENARIO → { old, improved }
 * Falls back to '_default' if a scenario has no route-specific override.
 */
export const COMPARISONS: RouteScenarioMap = {
  '/': {
    _default: {
      old: 'Generic portal with 20+ undifferentiated links. No guidance on where to start.',
      improved: 'Smart Flow agent + scenario-driven dashboard. Problems surfaced proactively.',
    },
    no_kyc: {
      old: 'Dashboard shows all links equally. User starts a claim, fills everything, then gets rejected weeks later for missing KYC.',
      improved: 'Dashboard highlights the KYC block upfront. "Fix KYC" CTA is surfaced before the user wastes time on a doomed claim.',
    },
    claim_denied: {
      old: 'Rejected claim sits in "View Status" with a cryptic code. User has no idea what went wrong or how to fix it.',
      improved: 'Rejection banner on dashboard explains the reason in plain language. One-tap "Fix & Re-file" routes to the exact remediation flow.',
    },
    employer_hold: {
      old: 'Claim shows "Under Process" indefinitely. No SLA, no employer contact info, no escalation path.',
      improved: 'Live employer SLA countdown on dashboard. Escalation auto-triggers after 7 days. Regional Commissioner CC visible.',
    },
    no_exit: {
      old: "Transfer form fails silently. Error message doesn't explain the exit-date prerequisite.",
      improved: 'Dashboard shows "Exit Date Missing" blocker. Routes to Mark Exit self-declaration before transfer can proceed.',
    },
    multi_uan: {
      old: "Multiple UANs invisible. User doesn't know they have duplicate accounts until transfer fails.",
      improved: 'Dashboard surfaces duplicate UAN discovery card. "Merge Accounts" CTA with balance preview.',
    },
    bank_not_seeded: {
      old: 'Disbursement fails with generic error. No indication bank account is the issue.',
      improved: 'Dashboard shows "Bank Not Seeded" warning. Routes to Document Vault for bank document upload.',
    },
    aadhaar_conflict: {
      old: 'Wrong UAN linkage invisible until claim rejection. No proactive detection.',
      improved: 'Dashboard shows "Aadhaar Conflict" alert. Routes to UAN Merge flow for correction.',
    },
  },
  '/claim': {
    _default: {
      old: 'Form 31/19/10C dropdown with no explanation. Users pick wrong form, claim rejected.',
      improved: 'FlowInfoCard explains which form applies. Prerequisite gate blocks if KYC missing.',
    },
    claim_denied: {
      old: 'Previous rejection not shown. User re-files the same way, gets rejected again. No learning loop.',
      improved: 'Rejection banner explains why it failed. "Fix Bank Seeding" button routes to remediation. Smart agent suggests correct form.',
    },
    no_kyc: {
      old: 'User fills entire claim form (bank, address, amount), submits, gets rejected days later for missing Aadhaar KYC.',
      improved: 'Prerequisite gate blocks form entry. "Add Aadhaar to Vault" CTA saves user hours of wasted effort.',
    },
    bank_not_seeded: {
      old: 'Claim approved but disbursement fails because bank account is not seeded with UAN.',
      improved: 'Bank verification step catches this before submission. User prompted to fix in Document Vault first.',
    },
    advance_rejected: {
      old: 'Advance rejected for eligibility mismatch (service < 1 year, or advance already used). Error message is opaque.',
      improved: 'Eligibility check runs before form entry. Clear explanation of why advance is blocked with next-available date.',
    },
    employer_hold: {
      old: "Claim submitted but employer hasn't approved. No visibility into employer response timeline.",
      improved: 'Post-submission, employer SLA tracker shows days remaining. Auto-escalation if employer doesn\'t respond in 7 days.',
    },
  },
  '/kyc-mismatch': {
    _default: {
      old: 'PDF Joint Declaration download. User must figure out what\'s wrong themselves.',
      improved: 'Auto-detects EPFO vs Aadhaar diff. Side-by-side comparison with checkboxes.',
    },
    kyc_wrong: {
      old: 'User downloads PDF, fills by hand, gets it attested by employer, mails to regional office. 30+ day turnaround.',
      improved: 'Auto-diff table shows exact mismatches (Name, DOB, Father\'s Name). Select fields → Aadhaar OTP sign → digital submission.',
    },
    aadhaar_conflict: {
      old: 'Wrong UAN linkage requires separate process. User directed to multiple offices.',
      improved: 'Conflict detection integrated into KYC flow. Joint Declaration + UAN merge initiated in one session.',
    },
  },
  '/merge-accounts': {
    _default: {
      old: 'Hidden under "One Member One EPF". No discovery of duplicate accounts.',
      improved: 'Dashboard surfaces old UANs. Dedicated merge flow with balance preview.',
    },
    multi_uan: {
      old: 'User doesn\'t know duplicates exist. Old balance sits dormant for years. No proactive discovery.',
      improved: 'Auto-detects multiple UANs via Aadhaar. Shows balance per account. One-click merge with employer attestation.',
    },
  },
  '/mark-exit': {
    _default: {
      old: 'Employer-only exit marking. Employee has no visibility or self-service option.',
      improved: 'Self-declaration after 60 days. Clear eligibility per establishment.',
    },
    no_exit: {
      old: 'Transfer blocked because exit date not marked. Employee has no recourse if employer is unresponsive.',
      improved: 'Self-declaration after 60 days bypasses unresponsive employer. Clear per-establishment eligibility with date validation.',
    },
    employer_hold: {
      old: 'Employer hasn\'t marked exit after 90+ days. No escalation path. Transfer and claim both blocked.',
      improved: 'SLA tracker shows employer delay. Self-declaration available after 60 days. Regional Commissioner escalation visible.',
    },
  },
  '/transfer': {
    _default: {
      old: 'Generic transfer form. Fails if exit date not marked — no prior warning.',
      improved: 'Prerequisite check blocks if exit date missing. Routes to fix first.',
    },
    no_exit: {
      old: 'Transfer form submits, processes for weeks, then fails with "exit date required" — wasted months.',
      improved: 'Pre-flight check catches exit-date issue instantly. Routes to Mark Exit first, then back to transfer.',
    },
    employer_hold: {
      old: 'Transfer requires employer attestation. No visibility into employer response timeline.',
      improved: 'Employer SLA tracker visible during transfer. Auto-escalation after 7 working days.',
    },
  },
  '/life-certificate': {
    _default: {
      old: 'Branch visit mandatory. No face-auth or postman alternatives.',
      improved: 'Face Auth via Aadhaar. ₹70 postman option. Camera check upfront.',
    },
    pension_cert: {
      old: 'Life certificate expired. Branch visit required. Pension payment suspended until renewed.',
      improved: 'Face Auth instant renewal. Postman doorstep option for ₹70. Pension continuity guaranteed.',
    },
  },
  '/grievance': {
    _default: {
      old: 'Generic form. No SLA visibility, no employer-specific routing.',
      improved: 'Grievance type routing. Employer SLA tracking. Auto-escalation.',
    },
    employer_hold: {
      old: 'Employer not responding. Grievance filed with no SLA visibility. No escalation path.',
      improved: 'Type-specific routing (non-deposit = 15-day SLA). Auto-escalation to Regional PF Commissioner.',
    },
    claim_denied: {
      old: 'Claim rejected but grievance system doesn\'t connect to claim context. User re-explains everything.',
      improved: 'Grievance auto-linked to rejected claim. EPFO response history visible. One-tap escalation.',
    },
  },
  '/uan-activation': {
    _default: {
      old: 'Dense form. OTP fails silently if Aadhaar not linked to mobile.',
      improved: 'Clear prerequisite check. Aadhaar-mobile link verified upfront.',
    },
    aadhaar_conflict: {
      old: 'UAN activation fails because Aadhaar linked to different UAN. Error is cryptic.',
      improved: 'Conflict detected upfront. Routes to UAN merge flow instead of failing silently.',
    },
  },
  '/documents': {
    _default: {
      old: 'No vault concept. Users email/upload docs with no permission control.',
      improved: 'DigiLocker integration. Granular permission grants per workflow.',
    },
    bank_not_seeded: {
      old: 'Bank document not linked to UAN. Disbursement fails. User doesn\'t know where to upload.',
      improved: 'Vault prompts for bank document upload. Permission auto-granted for claim disbursement.',
    },
  },
};

/**
 * Which features are ACTIVE (highlighted) for each scenario.
 * Non-active features are shown dimmed.
 */
export const SCENARIO_FEATURES: Record<string, ScenarioFeatures> = {
  happy: {
    active: [
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Prerequisite Gating',
      '6 Indian Languages',
      'Simulation Mode',
    ],
    highlighted: ['Smart Flow Agent'],
  },
  no_kyc: {
    active: [
      'Prerequisite Gating',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Document Vault',
      '6 Indian Languages',
    ],
    highlighted: ['Prerequisite Gating'],
  },
  kyc_wrong: {
    active: [
      'KYC Auto-Diff',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Document Vault',
      '6 Indian Languages',
    ],
    highlighted: ['KYC Auto-Diff'],
  },
  claim_denied: {
    active: [
      'Smart Flow Agent',
      'Prerequisite Gating',
      'Flow Knowledge Cards',
      'Approval Status',
      '6 Indian Languages',
    ],
    highlighted: ['Smart Flow Agent'],
  },
  employer_hold: {
    active: [
      'Employer SLA Tracking',
      'Approval Status',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      '6 Indian Languages',
    ],
    highlighted: ['Employer SLA Tracking'],
  },
  no_exit: {
    active: [
      'Prerequisite Gating',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Approval Status',
      '6 Indian Languages',
    ],
    highlighted: ['Prerequisite Gating'],
  },
  multi_uan: {
    active: [
      'Duplicate Discovery',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Document Vault',
      '6 Indian Languages',
    ],
    highlighted: ['Duplicate Discovery'],
  },
  no_nominee: {
    active: [
      'Prerequisite Gating',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Document Vault',
      '6 Indian Languages',
    ],
    highlighted: ['Prerequisite Gating'],
  },
  pension_cert: {
    active: [
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Face Auth',
      'Approval Status',
      '6 Indian Languages',
    ],
    highlighted: ['Face Auth'],
  },
  advance_rejected: {
    active: [
      'Prerequisite Gating',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      'Approval Status',
      '6 Indian Languages',
    ],
    highlighted: ['Prerequisite Gating'],
  },
  bank_not_seeded: {
    active: [
      'Prerequisite Gating',
      'Document Vault',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      '6 Indian Languages',
    ],
    highlighted: ['Document Vault'],
  },
  aadhaar_conflict: {
    active: [
      'Duplicate Discovery',
      'KYC Auto-Diff',
      'Smart Flow Agent',
      'Flow Knowledge Cards',
      '6 Indian Languages',
    ],
    highlighted: ['Duplicate Discovery'],
  },
};

/**
 * Master list of all possible features.
 */
export const ALL_FEATURES = [
  'Smart Flow Agent',
  'Prerequisite Gating',
  'Flow Knowledge Cards',
  'KYC Auto-Diff',
  'Scam Awareness',
  '6 Indian Languages',
  'Employer SLA Tracking',
  'Duplicate Discovery',
  'Approval Status',
  'Simulation Mode',
  'Document Vault',
  'Face Auth',
];

/**
 * Resolves the comparison for a given route + scenario.
 * Falls back to route default, then global default.
 */
export function getComparison(route: string, scenario: string): ComparisonEntry {
  const routeComparisons = COMPARISONS[route];
  if (routeComparisons) {
    if (scenario !== 'happy' && routeComparisons[scenario]) {
      return routeComparisons[scenario];
    }
    if (routeComparisons['_default']) {
      return routeComparisons['_default'];
    }
  }
  return COMPARISONS['/']['_default'];
}

/**
 * Resolves which features are active for a given scenario.
 */
export function getScenarioFeatures(scenario: string): ScenarioFeatures {
  return SCENARIO_FEATURES[scenario] || SCENARIO_FEATURES['happy'];
}
