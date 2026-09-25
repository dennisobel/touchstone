// Kenya jurisdiction pack (Platform PRD §13) and analytics series (§19). Seed content for counsel to confirm.

export const kenyaPack = {
  name: 'Kenya',
  version: 'v1.3',
  previous: 'v1.2',
  status: 'Draft' as 'Draft' | 'In counsel review' | 'Published',
  effective: '2026-11-01',
  impact: { checklistItems: 14, assets: 9 },
  sections: [
    'Licence types', 'Terms', 'Consents', 'State participation', 'Local listing', 'Community', 'Environment',
    'Cadastre access', 'Company registry', 'Data protection', 'Documents checklist', 'Counsel panel',
  ],
  licenceTypes: [
    { name: 'Prospecting licence', code: 'PL', maxTerm: '3 years, renewable twice for up to 3 years each', eligibility: 'Kenyan company or citizen; foreign companies through a local entity', consent: 'Yes (s.51)', documents: 'Licence certificate; company certificate; directors’ IDs; work programme', citation: 'Mining Act 2016, ss.74, 83', changed: false },
    { name: 'Retention licence', code: 'RL', maxTerm: '2 years', eligibility: 'Holder of a prospecting licence with an uneconomic discovery', consent: 'Yes (s.51)', documents: 'Licence certificate; feasibility evidence', citation: 'Mining Act 2016, s.87', changed: false },
    { name: 'Mining licence', code: 'ML', maxTerm: 'Set in the licence', eligibility: 'Kenyan company; community development agreement for large-scale', consent: 'Yes (s.51)', documents: 'Licence; CDA; approved EIA; mine plan', citation: 'Mining Act 2016, s.107', changed: true },
    { name: 'Artisanal mining permit', code: 'AP', maxTerm: '3 years', eligibility: 'Kenyan citizens and cooperatives', consent: 'County consultation', documents: 'Permit; cooperative registration', citation: 'Mining Act 2016, s.93', changed: true },
  ],
  diff: [
    { section: 'Licence types', change: 'Mining licence: reclamation bond added to required documents', kind: 'changed' },
    { section: 'Community', change: 'Binding community revenue-sharing added as a tracked claim (Mining (Amendment) Bill 2025, pending)', kind: 'added' },
    { section: 'Licence types', change: 'Artisanal permit: formalisation fields added', kind: 'changed' },
    { section: 'Documents checklist', change: 'Survey plan moved from optional to required for mining permits', kind: 'changed' },
  ],
}

export const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

export const analytics = {
  medianDays: months.map((m, i) => ({ month: m, standard: [48, 44, 41, 37, 34, 31][i], desk: [14, 13, 12, 11, 11, 10][i] })),
  cycleByWorkstream: [
    { workstream: 'Title', days: 11 },
    { workstream: 'Ownership', days: 6 },
    { workstream: 'Integrity', days: 2 },
    { workstream: 'Geology', days: 14 },
    { workstream: 'Technical', days: 5 },
    { workstream: 'Environment', days: 12 },
    { workstream: 'Legal', days: 7 },
  ],
  missedDeadlines: months.map((m, i) => ({ month: m, missed: [9, 7, 8, 5, 4, 3][i] })),
  funnel: [
    { stage: 'Submitted', value: 38 },
    { stage: 'Released', value: 21 },
    { stage: 'Teaser sent', value: 34 },
    { stage: 'NDA signed', value: 11 },
    { stage: 'LOI or term sheet', value: 2 },
    { stage: 'Closed', value: 0 },
  ],
  quality: months.map((m, i) => ({ month: m, reversals: [3, 2, 2, 1, 2, 1][i], postRelease: [0, 0, 0, 0, 0, 0][i], rework: [4, 3, 3, 2, 2, 1][i] })),
  satisfaction: months.map((m, i) => ({ month: m, ownerEffort: [5.1, 5.3, 5.4, 5.6, 5.7, 5.8][i], ownerSat: [4.0, 4.1, 4.2, 4.3, 4.3, 4.4][i], nps: [22, 25, 31, 34, 38, 41][i] })),
  compliance: months.map((m, i) => ({ month: m, hits: [14, 18, 11, 16, 12, 17][i], escalations: [3, 4, 2, 4, 3, 5][i], withinDeadline: [100, 100, 100, 75, 100, 100][i] })),
  comments: [
    { who: 'Owner, Migori', score: 6, text: 'The Swahili screens helped my family follow every step.' },
    { who: 'Investor, Denver', score: 9, text: 'Red flags first saves me hours. Wish core photos were in the data room by default.' },
    { who: 'Owner, Taita Taveta', score: 2, text: 'The findings on the access road felt unfair before I could reply.', followUp: 'Follow-up task created for Kevin Omondi' },
  ],
}

export const integrations = [
  { name: 'Identity checks (Africa)', vendor: 'Candidate: Smile ID', health: 'ok', costPerCall: 'USD 0.60', limit: '120 / min', calls30d: 212 },
  { name: 'Identity checks (US)', vendor: 'Candidate: Persona', health: 'ok', costPerCall: 'USD 1.50', limit: '60 / min', calls30d: 18 },
  { name: 'Sanctions and PEP screening', vendor: 'OpenSanctions (Phase 0–1)', health: 'ok', costPerCall: 'USD 0.00', limit: '600 / min', calls30d: 4380 },
  { name: 'Kenya Mining Cadastre', vendor: 'Adaptor (analyst capture fallback)', health: 'degraded', costPerCall: 'USD 0.00', limit: 'Portal terms', calls30d: 96 },
  { name: 'E-signature', vendor: 'Candidate: Dropbox Sign', health: 'ok', costPerCall: 'USD 0.90', limit: '30 / min', calls30d: 41 },
  { name: 'M-Pesa (Daraja)', vendor: 'Safaricom', health: 'ok', costPerCall: 'KES 0', limit: '100 / min', calls30d: 27 },
  { name: 'Card and ACH', vendor: 'Candidate: Stripe', health: 'ok', costPerCall: '2.9% + USD 0.30', limit: '100 / s', calls30d: 9 },
  { name: 'SMS', vendor: "Candidate: Africa's Talking", health: 'ok', costPerCall: 'KES 0.80', limit: '50 / s', calls30d: 1830 },
  { name: 'Language models', vendor: 'Internal gateway (zero retention)', health: 'ok', costPerCall: 'USD 0.004', limit: '300 / min', calls30d: 9210 },
]

export const featureFlags = [
  { key: 'verified_library', name: 'Verified library', description: 'Lets qualified investors search released passports at L1 (facts only). Off = gatekeeper mode.', on: false, special: true },
  { key: 'owner_voice_notes', name: 'Voice-note answers (Owner App)', description: 'Swahili and English voice notes transcribed for owner confirmation.', on: false, special: false },
  { key: 'whatsapp_intake', name: 'WhatsApp document intake', description: 'Documents sent by WhatsApp routed to the Evidence Vault after owner confirmation.', on: false, special: false },
  { key: 'analyst_copilot', name: 'Analyst copilot', description: 'Cited answers about a passport for SSD staff.', on: true, special: false },
  { key: 'broker_dealer_route', name: 'Broker-dealer partner fees', description: 'Allows closing-linked fees routed through a registered broker-dealer partner. Needs counsel approval.', on: false, special: false },
]
