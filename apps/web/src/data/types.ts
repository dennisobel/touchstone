// Shared domain types for the fictional sample data (Platform PRD §5 and §14).

export type ClaimStatus = 'declared' | 'in_review' | 'verified' | 'discrepancy' | 'disputed' | 'unverifiable' | 'stale'
export type EvidenceLevel = 0 | 1 | 2 | 3 | 4
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type FlagStatus = 'open' | 'mitigated' | 'accepted' | 'resolved'
export type WorkstreamId = 'title' | 'ownership' | 'integrity' | 'geology' | 'technical' | 'esg' | 'legal'
export type Tier = 'desk' | 'standard' | 'investor_ready'
export type PassportStatus = 'draft' | 'findings_review' | 'released' | 'superseded'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type InvestorStatus = 'invited' | 'in_qualification' | 'qualified' | 'on_hold' | 'declined'
export type IntroStatus =
  | 'teaser_sent'
  | 'opened'
  | 'interested'
  | 'not_now'
  | 'expired'
  | 'nda_signed'
  | 'in_diligence'
  | 'loi'
  | 'closed'
  | 'lost'
export type AssetStage = 'submitted' | 'triage' | 'verifying' | 'findings_review' | 'released' | 'introduced' | 'in_deal_room' | 'closed'
export type DisclosureLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4'
export type RuleLevel = 'hard_stop' | 'counsel_review' | 'warning' | 'log_only'

export type LngLat = [number, number]

export interface Person {
  id: string
  name: string
  role: string
  org: string
  location?: string
  email?: string
  phone?: string
  credential?: string
  credentialBody?: string
  credentialExpiry?: string
  hue: number
}

export interface Organisation {
  id: string
  name: string
  type: 'holder' | 'investor' | 'consultancy' | 'ssd' | 'counsel'
  country: string
}

export type ClaimValue =
  | { kind: 'date'; value: string }
  | { kind: 'number'; value: number; unit: string }
  | { kind: 'enum'; value: string }
  | { kind: 'text'; value: string }

export interface EvidenceRef {
  docId: string
  page?: number
  region?: string
}

export interface Claim {
  id: string
  assetId: string
  workstream: WorkstreamId
  statement: string
  /** Plain-language version shown to owners (English / Swahili) */
  plain?: { en: string; sw: string }
  value?: ClaimValue
  material: boolean
  status: ClaimStatus
  level: EvidenceLevel
  /** Method badges shown beside the level, e.g. [2, 3] for "automated cadastre check + title opinion" */
  methods: EvidenceLevel[]
  verifierId?: string
  method?: string
  verifiedOn?: string
  expiresOn?: string
  source?: string
  evidence: EvidenceRef[]
  flagId?: string
  /** Disputed claims: the finding and the owner's reply side by side */
  dispute?: { finding: string; reply: string; replyOn: string; evidence?: string }
  staleNote?: { lastChecked: string; recheckOn: string }
}

export interface RedFlag {
  id: string
  assetId: string
  severity: Severity
  status: FlagStatus
  workstream: WorkstreamId
  title: string
  plain: { en: string; sw: string }
  description: string
  mitigation?: string
  rationale?: string
  ownerId: string
  raisedOn: string
  updatedOn: string
  claimIds: string[]
  evidence: EvidenceRef[]
}

export interface Licence {
  number: string
  type: string
  status: 'active' | 'expired' | 'pending_renewal'
  granted: string
  expires: string
  areaHa: number
  holder: string
  source: string
  retrievedAt: string
}

export interface Asset {
  id: string
  name: string
  code: string
  county: string
  region: string
  country: string
  commodity: string
  commodityKey: 'graphite' | 'gold' | 'ree' | 'garnet' | 'heavy_sands' | 'iron' | 'copper'
  stage: string
  tier: Tier
  tierInProgress?: Tier
  holderOrgId: string
  ownerId: string
  representativeId?: string
  analystId: string
  licence: Licence
  secondaryLicence?: Licence
  passport: {
    status: PassportStatus
    version?: number
    releasedOn?: string
    draftVersion?: number
    history: { version: number; releasedOn: string; tier: Tier; note: string; approverId: string }[]
  }
  pipeline: AssetStage
  daysInStage: number
  lastActivity: string
  checks: { done: number; total: number }
  completeness: Record<WorkstreamId, number>
  workstreamStatus: Record<WorkstreamId, ClaimStatus>
  fresh: { fresh: number; total: number }
  capitalSought?: string
  structure?: string
  paidBy: 'owner' | 'investor'
  feeKes?: number
  resource?: string
  center: LngLat
  registered: LngLat[]
  claimed: LngLat[]
  distances: { port: number; rail: number; power: number; road: number }
  submittedOn: string
  nextUpdate?: string
  siteVisit?: { date: string; verifierId: string }
  findingsDue?: string
  replyUntil?: string
  visibility: 'private' | 'anonymous' | 'named'
  highlights?: { text: string; claimId: string }[]
}

export interface Task {
  id: string
  title: string
  assetId: string
  workstream: WorkstreamId | 'intake' | 'deal'
  assigneeId: string
  due: string
  status: TaskStatus
  blockedBy?: string
  group: 'blocked' | 'today' | 'week' | 'later'
  kind: 'task' | 'rfi' | 'approval' | 'escalation'
  awaitingOwner?: boolean
}

export interface InfoRequest {
  id: string
  assetId: string
  askedById: string
  title: string
  question: string
  why: { en: string; sw: string }
  titleSw: string
  questionSw: string
  formats: string
  due: string
  status: 'open' | 'overdue' | 'sent' | 'accepted' | 'follow_up'
  claimId?: string
  answer?: string
  followUp?: string
}

export interface DocumentItem {
  id: string
  assetId: string
  name: string
  type: string
  folder: 'Title' | 'Corporate' | 'Geology' | 'ESG' | 'Technical' | 'Legal and fiscal'
  pages: number
  sizeBytes: number
  uploadedOn: string
  uploadedBy: string
  sha256: string
  version: number
  level: DisclosureLevel
  linkedClaims: number
  download: boolean
}

export interface Investor {
  id: string
  name: string
  type: string
  city: string
  contactId: string
  status: InvestorStatus
  qualifiedOn?: string
  relationshipOwnerId: string
  risk: 'standard' | 'high'
  mandate: {
    commodities: string[]
    countries: string[]
    stages: string[]
    licenceTypes: string[]
    ticket: [number, number]
    structures: string[]
    esg: string[]
    specs?: string[]
  }
  reviews: { date: string; channel: string; whoId: string; with: string; topics: string; assessment: string }[]
}

export interface Introduction {
  id: string
  assetId: string
  investorId: string
  status: IntroStatus
  teaserSentOn?: string
  openedOn?: string
  respondedOn?: string
  ndaOn?: string
  declineReason?: string
  daysInStage: number
}

export interface DealRoom {
  id: string
  assetId: string
  investorId: string
  ndaOn: string
  expires: string
  documents: number
  openQuestions: number
  activity: number[]
  status: 'open' | 'closing' | 'closed'
}

export interface Question {
  id: string
  roomId: string
  category: string
  text: string
  askedById: string
  askedOn: string
  due: string
  status: 'open' | 'answered' | 'follow_up'
  answer?: string
  answeredOn?: string
  citations?: string[]
  docRef?: string
}

export interface Rule {
  id: string
  name: string
  firesWhen: string
  level: RuleLevel
  version: string
  effective: string
  ownerId: string
  hits30d: number
  rationale: string
  condition: string
  json: Record<string, unknown>
  tests: { name: string; pass: boolean }[]
}

export interface Escalation {
  id: string
  ruleId: string
  object: string
  requesterId: string
  raisedOn: string
  deadline: string
  status: 'open' | 'decided'
  triggering: string
  priorDecisions: string[]
}

export interface AuditEvent {
  id: string
  at: string
  actorId: string
  action: string
  object: string
  device: string
  hash: string
  prevHash: string
  assetId?: string
}

export interface NetworkMember {
  personId: string
  kind: 'resource_geologist' | 'mining_lawyer' | 'esg' | 'field'
  credentialStatus: 'verified' | 'pending' | 'expired'
  jurisdictions: string[]
  commodities: string[]
  rateUsd: number
  rateUnit: 'day' | 'visit' | 'opinion'
  availability: 'available' | 'limited' | 'unavailable'
  active: number
  turnaroundDays: number
  reworkRate: number
  rating: number
}

export interface ExpertAssignment {
  id: string
  assetId: string
  expertId: string
  taskType: string
  scope: string
  feeUsd: number
  deadline: string
  status: 'offer' | 'active' | 'overdue' | 'submitted' | 'accepted' | 'paid'
  accessEnds?: string
  claimIds: string[]
  data: string
  paidOn?: string
  reference?: string
}

export interface Message {
  id: string
  from: 'owner' | 'ssd'
  authorId: string
  text: string
  at: string
  attachment?: { name: string; size: string }
  status?: 'queued' | 'sent' | 'delivered' | 'read'
}
