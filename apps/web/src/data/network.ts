import type { ExpertAssignment, NetworkMember } from './types'

export const network: NetworkMember[] = [
  { personId: 'nomvula', kind: 'resource_geologist', credentialStatus: 'verified', jurisdictions: ['Kenya', 'Tanzania', 'Zambia', 'South Africa'], commodities: ['Graphite', 'Gold', 'Copper', 'Rare earths'], rateUsd: 1300, rateUnit: 'day', availability: 'limited', active: 3, turnaroundDays: 9.5, reworkRate: 0.04, rating: 4.9 },
  { personId: 'amani', kind: 'resource_geologist', credentialStatus: 'verified', jurisdictions: ['Tanzania', 'Kenya'], commodities: ['Gold', 'Graphite'], rateUsd: 950, rateUnit: 'day', availability: 'available', active: 2, turnaroundDays: 11, reworkRate: 0.08, rating: 4.6 },
  { personId: 'wanjiru', kind: 'mining_lawyer', credentialStatus: 'verified', jurisdictions: ['Kenya'], commodities: ['All'], rateUsd: 1800, rateUnit: 'opinion', availability: 'limited', active: 4, turnaroundDays: 7, reworkRate: 0.03, rating: 4.8 },
  { personId: 'esther', kind: 'mining_lawyer', credentialStatus: 'verified', jurisdictions: ['Kenya', 'Uganda'], commodities: ['All'], rateUsd: 1500, rateUnit: 'opinion', availability: 'available', active: 1, turnaroundDays: 8, reworkRate: 0.05, rating: 4.5 },
  { personId: 'faith', kind: 'esg', credentialStatus: 'verified', jurisdictions: ['Kenya', 'Tanzania'], commodities: ['All'], rateUsd: 700, rateUnit: 'day', availability: 'available', active: 3, turnaroundDays: 10, reworkRate: 0.06, rating: 4.7 },
  { personId: 'brian', kind: 'field', credentialStatus: 'verified', jurisdictions: ['Kenya'], commodities: ['All'], rateUsd: 420, rateUnit: 'visit', availability: 'available', active: 2, turnaroundDays: 3, reworkRate: 0.02, rating: 4.9 },
  { personId: 'collins', kind: 'field', credentialStatus: 'verified', jurisdictions: ['Kenya'], commodities: ['All'], rateUsd: 380, rateUnit: 'visit', availability: 'available', active: 1, turnaroundDays: 4, reworkRate: 0.07, rating: 4.4 },
  { personId: 'halima', kind: 'field', credentialStatus: 'expired', jurisdictions: ['Kenya'], commodities: ['All'], rateUsd: 380, rateUnit: 'visit', availability: 'unavailable', active: 0, turnaroundDays: 4.5, reworkRate: 0.05, rating: 4.3 },
]

export const KIND_LABEL: Record<NetworkMember['kind'], string> = {
  resource_geologist: 'Resource geologist',
  mining_lawyer: 'Mining lawyer',
  esg: 'ESG specialist',
  field: 'Field verifier',
}

// Dr Nomvula Dlamini's assignments (ED-01).
export const assignments: ExpertAssignment[] = [
  {
    id: 'as-1', assetId: 'kiboko', expertId: 'nomvula', taskType: 'Resource review, JORC Inferred', status: 'active',
    scope: 'Independent review of the JORC (2012) Inferred resource, QA/QC and flake-size claims for the Investor-ready passport.',
    feeUsd: 6500, deadline: '2026-10-07', accessEnds: '2026-10-14', claimIds: ['kb-g1', 'kb-g3', 'kb-g4', 'kb-g5', 'kb-g6'],
    data: 'Drillhole database, 412 holes; assay certificates, 38 files; QA/QC summary; JORC report (112 pages)',
  },
  {
    id: 'as-2', assetId: 'kakamega', expertId: 'nomvula', taskType: 'Geology desk review', status: 'overdue',
    scope: 'Desk review of historical drilling and soil geochemistry for the Standard passport.',
    feeUsd: 2400, deadline: '2026-09-23', accessEnds: '2026-09-30', claimIds: [], data: 'Historical drill logs, 64 holes; soil geochemistry grid',
  },
  {
    id: 'as-3', assetId: 'tsavo', expertId: 'nomvula', taskType: 'Data check, gemstone production records', status: 'active',
    scope: 'Check production records against cooperative sales receipts.', feeUsd: 900, deadline: '2026-10-03', accessEnds: '2026-09-27', claimIds: [],
    data: 'Production ledger 2024–2026; 212 sales receipts',
  },
  {
    id: 'as-4', assetId: 'nyanza', expertId: 'nomvula', taskType: 'Resource review, historical estimate', status: 'offer',
    scope: 'Assess the 2019 grab-sample report and state whether any estimate can be disclosed, and how.', feeUsd: 3200, deadline: '2026-10-20', claimIds: ['ny-g1'],
    data: 'Consultant report, 2019 (26 pages); assay table',
  },
  {
    id: 'as-5', assetId: 'pwani', expertId: 'nomvula', taskType: 'Data audit, heavy mineral assays', status: 'offer',
    scope: 'Audit QA/QC for the 2025 infill drilling ahead of re-verification.', feeUsd: 4100, deadline: '2026-10-28', claimIds: [],
    data: 'Drillhole database, 288 holes; assay certificates, 22 files',
  },
  { id: 'as-6', assetId: 'galana', expertId: 'nomvula', taskType: 'Resource review, JORC Indicated', status: 'paid', scope: 'Investor-ready resource review.', feeUsd: 7200, deadline: '2026-08-20', claimIds: [], data: '', paidOn: '2026-08-28', reference: 'PAY-2026-0412' },
  { id: 'as-7', assetId: 'pwani', expertId: 'nomvula', taskType: 'Resource review, JORC Indicated', status: 'paid', scope: 'Investor-ready resource review.', feeUsd: 6800, deadline: '2026-07-05', claimIds: [], data: '', paidOn: '2026-07-12', reference: 'PAY-2026-0331' },
  { id: 'as-8', assetId: 'kiboko', expertId: 'nomvula', taskType: 'Geology desk review (Standard)', status: 'accepted', scope: 'Standard-tier desk review.', feeUsd: 1800, deadline: '2026-09-15', claimIds: [], data: '', reference: 'Pending payout' },
]
