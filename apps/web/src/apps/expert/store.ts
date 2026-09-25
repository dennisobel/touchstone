import { create } from 'zustand'

export type Finding = 'supported' | 'qualified' | 'not_supported'

/** Review progress shared by the workspace (ED-03) and sign-off (ED-05) for the demo session. */
interface ReviewState {
  findings: Record<string, { finding?: Finding; comment?: string }>
  signed: boolean
  version: number
  setFinding: (claimId: string, finding: Finding) => void
  setComment: (claimId: string, comment: string) => void
  sign: () => void
  amend: () => void
}

export const useReview = create<ReviewState>((set) => ({
  findings: {
    'kb-g4': { finding: 'supported', comment: 'Certificates reconcile with the drillhole database; laboratory confirmed all 38.' },
    'kb-g6': { finding: 'supported', comment: 'Import validated; spot-checked 40 holes against logs.' },
  },
  signed: false,
  version: 1,
  setFinding: (claimId, finding) => set((s) => ({ findings: { ...s.findings, [claimId]: { ...s.findings[claimId], finding } } })),
  setComment: (claimId, comment) => set((s) => ({ findings: { ...s.findings, [claimId]: { ...s.findings[claimId], comment } } })),
  sign: () => set({ signed: true }),
  amend: () => set((s) => ({ signed: false, version: s.version + 1 })),
}))
