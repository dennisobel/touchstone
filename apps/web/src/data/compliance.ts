import { fakeHash } from './hash'
import type { AuditEvent, Escalation, Rule } from './types'

const r = (
  id: string,
  name: string,
  firesWhen: string,
  level: Rule['level'],
  hits30d: number,
  rationale: string,
  condition: string,
  json: Record<string, unknown>,
  tests: Rule['tests'],
): Rule => ({ id, name, firesWhen, level, version: 'v1.0', effective: '2026-09-01', ownerId: 'sarah', hits30d, rationale, condition, json, tests })

// Starter rule catalogue (Platform PRD §11), for counsel to confirm.
export const rules: Rule[] = [
  r('R01', 'Relationship first', "A teaser is sent and the investor's relationship record is missing or dated after it", 'hard_stop', 3,
    'SSD must show a pre-existing, substantive relationship before presenting any specific opportunity, or it risks general solicitation and broker activity.',
    'WHEN teaser.send\nBLOCK IF investor.firstRelationshipReview IS NULL\n  OR investor.firstRelationshipReview.date >= teaser.sentAt',
    { event: 'teaser.send', block_if: { any: [{ is_null: 'investor.first_relationship_review' }, { gte: ['investor.first_relationship_review.date', 'teaser.sent_at'] }] } },
    [{ name: 'Blocks when no review exists', pass: true }, { name: 'Blocks when review is dated after teaser', pass: true }, { name: 'Allows when review predates teaser', pass: true }]),
  r('R02', 'Qualified only', 'Any L2 or L3 access for an investor organisation that is not qualified', 'hard_stop', 1,
    'Only investors SSD has vetted and approved may see opportunity-specific information. Advisers admitted under a qualified investor\'s NDA are covered by it.',
    'WHEN access.grant AND level IN (L2, L3)\nBLOCK IF organisation.status != "qualified"\n  AND NOT member.isAdviserUnderNda',
    { event: 'access.grant', where: { level_in: ['L2', 'L3'] }, block_if: { all: [{ neq: ['organisation.status', 'qualified'] }, { not: 'member.is_adviser_under_nda' }] } },
    [{ name: 'Blocks unqualified organisation', pass: true }, { name: 'Allows adviser under NDA', pass: true }]),
  r('R03', 'No closing-linked pay', "A fee line's trigger is a deal closing or a share of capital raised", 'hard_stop', 0,
    'Transaction-based compensation is a hallmark of broker activity. Allowed only through a registered broker-dealer partner (feature off).',
    'WHEN feeLine.save\nBLOCK IF feeLine.trigger IN ("deal_closing", "percent_of_capital")\n  UNLESS feeLine.routedTo = registeredBrokerDealer',
    { event: 'fee_line.save', block_if: { in: ['fee_line.trigger', ['deal_closing', 'percent_of_capital']] }, unless: { eq: ['fee_line.routed_to', 'registered_broker_dealer'] } },
    [{ name: 'Blocks success fee', pass: true }, { name: 'Allows fixed verification fee', pass: true }, { name: 'Allows broker-dealer routed fee', pass: true }]),
  r('R04', 'Investor-introduction milestones', 'An engagement milestone is defined by introducing investors', 'counsel_review', 1,
    'Milestones tied to introductions can look like transaction-based pay. Counsel reviews each instance.',
    'WHEN engagement.milestone.save\nESCALATE IF milestone.definition MENTIONS "introduction"',
    { event: 'engagement.milestone.save', escalate_if: { mentions: ['milestone.definition', 'introduction'] } },
    [{ name: 'Escalates introduction milestone', pass: true }]),
  r('R05', 'Promotional language', 'A message contains phrases such as "guaranteed", "risk-free" or "act now"', 'warning', 6,
    'Promotional language on investor-facing material can amount to general solicitation or misleading statements.',
    'WHEN message.draft OR teaser.draft\nWARN IF text CONTAINS ANY bannedPhrases\nESCALATE IF audience = investor',
    { event: ['message.draft', 'teaser.draft'], warn_if: { contains_any: ['text', '$banned_phrases'] }, escalate_if: { eq: ['audience', 'investor'] } },
    [{ name: 'Flags "guaranteed"', pass: true }, { name: 'Flags "act now"', pass: true }, { name: 'Ignores "guarantee of title" in legal context', pass: false }]),
  r('R06', 'Library leak', 'An L1 payload contains terms, capital sought or valuation', 'hard_stop', 0,
    'Library profiles carry facts only. Terms or capital sought would turn them into offers.',
    'ON passport.release AND library.payload.build\nBLOCK IF payload HAS ANY (terms, capitalSought, valuation)',
    { event: ['passport.release', 'library.payload.build'], block_if: { has_any: ['payload', ['terms', 'capital_sought', 'valuation']] } },
    [{ name: 'Blocks capital sought in L1', pass: true }, { name: 'Allows facts-only payload', pass: true }]),
  r('R07', 'Owner consent', "A teaser is sent without the owner's approval of its wording", 'hard_stop', 2,
    'Owners approve every word investors see about their asset.',
    'WHEN teaser.send\nBLOCK IF teaser.ownerApproval IS NULL\n  OR teaser.ownerApproval.version != teaser.version',
    { event: 'teaser.send', block_if: { any: [{ is_null: 'teaser.owner_approval' }, { neq: ['teaser.owner_approval.version', 'teaser.version'] }] } },
    [{ name: 'Blocks unapproved wording', pass: true }, { name: 'Blocks edited-after-approval', pass: true }]),
  r('R08', 'No negotiation', 'SSD staff edit a document in an L4 parties-only folder', 'hard_stop', 0,
    'SSD logs access to parties-only documents but never negotiates terms.',
    'WHEN document.edit\nBLOCK IF folder.level = L4 AND actor.organisation = SSD',
    { event: 'document.edit', block_if: { all: [{ eq: ['folder.level', 'L4'] }, { eq: ['actor.organisation', 'ssd'] }] } },
    [{ name: 'Blocks SSD edit in L4', pass: true }]),
  r('R09', 'Sanctions', 'Any party has an unresolved sanctions hit', 'hard_stop', 1,
    'US persons may not deal with listed parties, including entities 50% or more owned by them.',
    'WHEN introduction.* OR access.grant\nBLOCK IF ANY party.screening.unresolvedHit',
    { event: ['introduction.*', 'access.grant'], block_if: { any_party: 'screening.unresolved_hit' } },
    [{ name: 'Blocks unresolved hit', pass: true }, { name: 'Allows dispositioned false positive', pass: true }]),
  r('R10', 'High-risk party', 'A politically exposed or high-risk party is approved by one person', 'hard_stop', 1,
    'High-risk approvals need two people so no single approver can clear them.',
    'WHEN qualification.approve OR kyc.clear\nBLOCK IF subject.risk = high AND approvals.count < 2',
    { event: ['qualification.approve', 'kyc.clear'], block_if: { all: [{ eq: ['subject.risk', 'high'] }, { lt: ['approvals.count', 2] }] } },
    [{ name: 'Blocks single approval', pass: true }, { name: 'Allows two approvals', pass: true }]),
  r('R11', 'Critical flag', 'A passport release is requested with a Critical flag open', 'hard_stop', 1,
    'A Critical flag could void title or create legal liability; it can only be resolved, never accepted.',
    'WHEN passport.release\nBLOCK IF asset.flags WHERE severity = critical AND status = open',
    { event: 'passport.release', block_if: { exists: { flags: { severity: 'critical', status: 'open' } } } },
    [{ name: 'Blocks with open Critical', pass: true }, { name: 'Allows when resolved', pass: true }]),
  r('R12', 'Verifier independence', 'A verifier is assigned where the owner pays them directly, or where a declared conflict has not been cleared in writing', 'hard_stop', 0,
    'Verifiers are never paid by the party they verify; conflicts are declared per assignment.',
    'WHEN assignment.accept\nBLOCK IF payer = owner OR (conflict.declared AND NOT conflict.clearedInWriting)',
    { event: 'assignment.accept', block_if: { any: [{ eq: ['payer', 'owner'] }, { all: ['conflict.declared', { not: 'conflict.cleared_in_writing' }] }] } },
    [{ name: 'Blocks owner-paid verifier', pass: true }, { name: 'Blocks uncleared conflict', pass: true }]),
]

export const BANNED_PHRASES = [
  'guaranteed', 'guarantee', 'risk-free', 'risk free', 'high returns', 'hot deal', 'hot', 'exclusive opportunity',
  'act now', 'limited time', 'recommended for you', 'best deal', 'invest now', 'buy now', 'exceptional',
]

export const escalations: Escalation[] = [
  {
    id: 'esc-1', ruleId: 'R04', object: 'Engagement letter EL-2026-031 · Kakamega Shear Gold', requesterId: 'mercy', raisedOn: '2026-09-23', deadline: '2026-09-25', status: 'open',
    triggering: 'Milestone 3 reads: "Advisory support fee payable once SSD has introduced two qualified investors."',
    priorDecisions: ['EL-2026-019: denied, milestone rewritten as "delivery of the Standard passport" (12 Aug 2026)', 'EL-2026-024: approved with modification, fixed monthly fee instead (29 Aug 2026)'],
  },
  {
    id: 'esc-2', ruleId: 'R05', object: 'Teaser draft KE-HMS-01 v2 · Pwani Heavy Sands', requesterId: 'kevin', raisedOn: '2026-09-24', deadline: '2026-09-26', status: 'open',
    triggering: 'Highlight 2 reads: "Exceptional grades with guaranteed offtake demand from Asia."',
    priorDecisions: ['Teaser KE-GR-04 v1: approved with modification, "high-grade" quoted from the signed resource report (27 Aug 2026)'],
  },
  {
    id: 'esc-3', ruleId: 'R10', object: 'Qualification · Summit Ridge Capital', requesterId: 'james', raisedOn: '2026-09-19', deadline: '2026-09-23', status: 'decided',
    triggering: 'A limited partner of the feeder fund is a politically exposed person. One approval recorded (James Whitfield).',
    priorDecisions: [],
  },
]

// Audit trail (M22): append-only, hash-chained.
const seed: Omit<AuditEvent, 'hash' | 'prevHash'>[] = [
  { id: 'ev-1', at: '2026-09-22T08:02', actorId: 'marcus', action: 'Signed in', object: 'Investor Portal', device: 'Chrome on macOS · Denver, US' },
  { id: 'ev-2', at: '2026-09-22T08:05', actorId: 'marcus', action: 'Viewed document', object: 'KE-GR-07 · JORC Mineral Resource Report, June 2025 (p. 1–58)', device: 'Chrome on macOS · Denver, US', assetId: 'kiboko' },
  { id: 'ev-3', at: '2026-09-22T08:31', actorId: 'marcus', action: 'Viewed document', object: 'KE-GR-07 · Drillhole database, 412 holes', device: 'Chrome on macOS · Denver, US', assetId: 'kiboko' },
  { id: 'ev-4', at: '2026-09-22T08:40', actorId: 'marcus', action: 'Downloaded (watermarked)', object: 'KE-GR-07 · Drillhole database, 412 holes', device: 'Chrome on macOS · Denver, US', assetId: 'kiboko' },
  { id: 'ev-5', at: '2026-09-22T09:12', actorId: 'tom', action: 'Viewed document', object: 'KE-GR-07 · QA/QC summary 2025 (v2)', device: 'Safari on iPad · Reno, US', assetId: 'kiboko' },
  { id: 'ev-6', at: '2026-09-22T09:30', actorId: 'kevin', action: 'Rule evaluated', object: 'R05 Promotional language · deal-room answer draft · passed', device: 'Chrome on Windows · Nairobi, KE' },
  { id: 'ev-7', at: '2026-09-22T10:03', actorId: 'grace', action: 'Uploaded document', object: 'KE-GR-07 · QA/QC summary 2025 (v2) · sha256 recorded', device: 'Chrome on Windows · Nairobi, KE', assetId: 'kiboko' },
  { id: 'ev-8', at: '2026-09-22T11:47', actorId: 'priya', action: 'Viewed document', object: 'KE-GR-07 · Site visit report, B. Kiptoo (p. 1–31)', device: 'Chrome on Windows · Denver, US', assetId: 'kiboko' },
  { id: 'ev-9', at: '2026-09-22T14:05', actorId: 'marcus', action: 'Viewed document', object: 'KE-GR-07 · Title opinion, W. Kamau', device: 'Chrome on macOS · Denver, US', assetId: 'kiboko' },
  { id: 'ev-10', at: '2026-09-22T14:20', actorId: 'marcus', action: 'Asked a question', object: 'KE-GR-07 · Geology · core photos', device: 'Chrome on macOS · Denver, US', assetId: 'kiboko' },
  { id: 'ev-11', at: '2026-09-23T09:15', actorId: 'kevin', action: 'Sent message', object: 'Grace Wanjiku · teaser approval request (template OWN-12 v3)', device: 'Chrome on Windows · Nairobi, KE' },
  { id: 'ev-12', at: '2026-09-23T15:30', actorId: 'kevin', action: 'AI output reviewed', object: 'Extraction · Mutomo licence certificate · 11 fields confirmed, 1 corrected', device: 'Chrome on Windows · Nairobi, KE' },
  { id: 'ev-13', at: '2026-09-24T07:50', actorId: 'aisha', action: 'Configuration draft saved', object: 'Kenya pack v1.3 (draft) · Licence types', device: 'Firefox on Linux · Nairobi, KE' },
  { id: 'ev-14', at: '2026-09-24T08:10', actorId: 'sarah', action: 'Approved escalation', object: 'esc-0917 · R05 · approved with modification', device: 'Edge on Windows · Washington DC, US' },
  { id: 'ev-15', at: '2026-09-24T08:30', actorId: 'kevin', action: 'Claim status changed', object: 'KE-GR-07 · kb-i1 sanctions re-screen · Verified', device: 'System · daily screening' },
]

let prev = '0'.repeat(64)
export const auditEvents: AuditEvent[] = seed.map((e) => {
  const hash = fakeHash(prev + e.id + e.action + e.object)
  const out = { ...e, prevHash: prev, hash }
  prev = hash
  return out
})

export const legalHolds = [
  { id: 'lh-1', scope: 'Pwani Heavy Sands · all records', placedById: 'sarah', placedOn: '2026-08-14', reason: 'Community complaint to county government; preserve until resolved' },
  { id: 'lh-2', scope: 'Introduction in-3 (Brightwater × KE-HMS-01)', placedById: 'sarah', placedOn: '2026-09-01', reason: 'Regulator information request (routine)' },
]
