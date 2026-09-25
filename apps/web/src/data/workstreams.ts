import type { AssetStage, ClaimStatus, FlagStatus, IntroStatus, InvestorStatus, PassportStatus, Severity, TaskStatus, Tier, WorkstreamId } from './types'

export const WORKSTREAMS: { id: WorkstreamId; name: string; short: string; plain: { en: string; sw: string } }[] = [
  { id: 'title', name: 'Title and tenure', short: 'Title', plain: { en: 'Your licence', sw: 'Leseni yako' } },
  { id: 'ownership', name: 'Ownership and control', short: 'Ownership', plain: { en: 'Who owns the company', sw: 'Nani anamiliki kampuni' } },
  { id: 'integrity', name: 'Integrity and sanctions', short: 'Integrity', plain: { en: 'Background checks', sw: 'Ukaguzi wa historia' } },
  { id: 'geology', name: 'Geology and resources', short: 'Geology', plain: { en: "What's in the ground", sw: 'Kilichopo ardhini' } },
  { id: 'technical', name: 'Technical and infrastructure', short: 'Technical', plain: { en: 'Roads, power and water', sw: 'Barabara, umeme na maji' } },
  { id: 'esg', name: 'Environment and social', short: 'Environment', plain: { en: 'Land, environment and community', sw: 'Ardhi, mazingira na jamii' } },
  { id: 'legal', name: 'Legal, fiscal and market access', short: 'Legal', plain: { en: 'Taxes, government share and export rules', sw: 'Kodi, hisa ya serikali na sheria za mauzo nje' } },
]

export const workstreamName = (id: WorkstreamId) => WORKSTREAMS.find((w) => w.id === id)?.name ?? id

// Status vocabulary (UI PRD §5): use these exact words everywhere.
export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  declared: 'Declared',
  in_review: 'In review',
  verified: 'Verified',
  discrepancy: 'Discrepancy',
  disputed: 'Disputed',
  unverifiable: 'Unverifiable',
  stale: 'Stale',
}
export const CLAIM_STATUS_LABEL_SW: Record<ClaimStatus, string> = {
  declared: 'Imetangazwa',
  in_review: 'Inakaguliwa',
  verified: 'Imethibitishwa',
  discrepancy: 'Tofauti',
  disputed: 'Inabishaniwa',
  unverifiable: 'Haiwezi kuthibitishwa',
  stale: 'Imepitwa na wakati',
}
export const PASSPORT_STATUS_LABEL: Record<PassportStatus, string> = {
  draft: 'Draft',
  findings_review: 'In findings review',
  released: 'Released',
  superseded: 'Superseded',
}
export const FLAG_STATUS_LABEL: Record<FlagStatus, string> = { open: 'Open', mitigated: 'Mitigated', accepted: 'Accepted', resolved: 'Resolved' }
export const SEVERITY_LABEL: Record<Severity, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
export const SEVERITY_LABEL_SW: Record<Severity, string> = { critical: 'Hatari kubwa', high: 'Juu', medium: 'Wastani', low: 'Chini' }
export const INVESTOR_STATUS_LABEL: Record<InvestorStatus, string> = {
  invited: 'Invited',
  in_qualification: 'In qualification',
  qualified: 'Qualified',
  on_hold: 'On hold',
  declined: 'Declined',
}
export const INTRO_STATUS_LABEL: Record<IntroStatus, string> = {
  teaser_sent: 'Teaser sent',
  opened: 'Opened',
  interested: 'Interested',
  not_now: 'Not now',
  expired: 'Expired',
  nda_signed: 'NDA signed',
  in_diligence: 'In diligence',
  loi: 'LOI or term sheet',
  closed: 'Closed',
  lost: 'Lost',
}
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = { todo: 'To do', in_progress: 'In progress', blocked: 'Blocked', done: 'Done' }
export const TIER_LABEL: Record<Tier, string> = { desk: 'Desk screen', standard: 'Standard', investor_ready: 'Investor-ready' }
export const TIER_BADGE: Record<Tier, string> = { desk: 'Desk-screened', standard: 'Standard', investor_ready: 'Investor-ready' }
export const STAGE_LABEL: Record<AssetStage, string> = {
  submitted: 'Submitted',
  triage: 'Triage',
  verifying: 'Verifying',
  findings_review: 'Findings review',
  released: 'Released',
  introduced: 'Introduced',
  in_deal_room: 'In deal room',
  closed: 'Closed or withdrawn',
}
export const EVIDENCE_LEVELS = [
  { level: 0, code: 'E0', name: 'Declared', meaning: 'The owner says so; nothing supplied' },
  { level: 1, code: 'E1', name: 'Documented', meaning: 'A document supports it, not yet checked' },
  { level: 2, code: 'E2', name: 'Cross-checked', meaning: 'Matches an independent source: registry, cadastre, laboratory, satellite' },
  { level: 3, code: 'E3', name: 'Expert-verified', meaning: 'Signed by a credentialed professional within their scope' },
  { level: 4, code: 'E4', name: 'Field-verified', meaning: 'Observed on site with tamper-evident capture' },
] as const
