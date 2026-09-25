import type { DealRoom, Introduction, Investor, Question } from './types'

export const investors: Investor[] = [
  {
    id: 'cedar-peak', name: 'Cedar Peak Minerals Fund', type: 'Mining private-equity fund', city: 'Denver', contactId: 'marcus',
    status: 'qualified', qualifiedOn: '2026-09-03', relationshipOwnerId: 'james', risk: 'standard',
    mandate: {
      commodities: ['Gold', 'Copper', 'Graphite', 'Rare earths'], countries: ['Kenya', 'Tanzania', 'Zambia'],
      stages: ['Exploration', 'Advanced exploration', 'Pre-feasibility'], licenceTypes: ['Prospecting licence', 'Retention licence', 'Mining licence'],
      ticket: [10, 50], structures: ['Equity', 'Royalty or stream'], esg: ['IFC Performance Standards', 'No artisanal child labour'],
    },
    reviews: [
      { date: '2026-08-28', channel: 'Video call', whoId: 'james', with: 'Marcus Bell', topics: 'Fund strategy, East Africa appetite, typical ticket size, past African deals', assessment: 'Sophisticated institutional investor; mining engineer by training; invests through a Delaware fund with an investment committee.' },
      { date: '2026-09-02', channel: 'Phone', whoId: 'james', with: 'Marcus Bell, Priya Raman', topics: 'Qualification questionnaire follow-up; accreditation basis', assessment: 'Entity accredited investor; no third-party financing for commitments.' },
      { date: '2026-09-18', channel: 'In person, Denver', whoId: 'james', with: 'Marcus Bell', topics: 'Graphite and copper pipeline; deal-room process', assessment: 'Relationship continuing; prefers raw data and fast triage.' },
    ],
  },
  {
    id: 'brightwater', name: 'Brightwater Anode Co.', type: 'Strategic corporate buyer (battery materials)', city: 'Atlanta', contactId: 'rachel',
    status: 'qualified', qualifiedOn: '2026-07-15', relationshipOwnerId: 'james', risk: 'standard',
    mandate: {
      commodities: ['Graphite'], countries: ['Kenya', 'Tanzania', 'Uganda', 'Zambia'], stages: ['Exploration', 'Advanced exploration', 'Pre-feasibility'],
      licenceTypes: ['Prospecting licence', 'Mining licence'], ticket: [5, 25], structures: ['Offtake', 'Equity'],
      esg: ['IFC Performance Standards', 'No artisanal child labour', 'Community agreement required'],
      specs: ['Flake size: at least 40% at +80 mesh', 'Concentrate purity: 94% Cg or higher'],
    },
    reviews: [
      { date: '2026-06-24', channel: 'Video call', whoId: 'james', with: 'Rachel Kim', topics: 'Anode supply outside Chinese control; offtake plus minority equity', assessment: 'Strategic buyer with board-approved sourcing programme; experienced with supplier audits.' },
      { date: '2026-07-10', channel: 'Phone', whoId: 'sarah', with: 'Rachel Kim, in-house counsel', topics: 'Questionnaire, representations, NDA template', assessment: 'Entity accredited investor; NDA pre-agreed.' },
    ],
  },
  {
    id: 'hargrove', name: 'Hargrove Family Office', type: 'Single-family office', city: 'Houston', contactId: 'linda',
    status: 'qualified', qualifiedOn: '2026-08-02', relationshipOwnerId: 'james', risk: 'standard',
    mandate: {
      commodities: ['Gold', 'Heavy mineral sands', 'Graphite'], countries: ['Kenya', 'Tanzania'], stages: ['Advanced exploration', 'Pre-feasibility'],
      licenceTypes: ['Retention licence', 'Mining licence'], ticket: [2, 10], structures: ['Equity', 'Co-investment'], esg: ['IFC Performance Standards'],
    },
    reviews: [
      { date: '2026-07-21', channel: 'In person, Houston', whoId: 'james', with: 'Linda Hargrove', topics: 'Co-investment alongside institutions; energy background', assessment: 'Accredited; relies on SSD relationship; wants plain-English summaries.' },
    ],
  },
  {
    id: 'summit', name: 'Summit Ridge Capital', type: 'Resources hedge fund', city: 'Chicago', contactId: 'owen',
    status: 'in_qualification', relationshipOwnerId: 'james', risk: 'high',
    mandate: { commodities: ['Copper', 'Rare earths'], countries: ['Kenya', 'Zambia'], stages: ['Exploration'], licenceTypes: ['Prospecting licence'], ticket: [5, 20], structures: ['Equity'], esg: [] },
    reviews: [
      { date: '2026-09-12', channel: 'Video call', whoId: 'james', with: 'Owen Clarke', topics: 'Introduction via a Chicago broker; fund structure', assessment: 'Offshore feeder fund; a limited partner is a politically exposed person. Rated high risk.' },
    ],
  },
  {
    id: 'northgate', name: 'Northgate Royalty Partners', type: 'Royalty and streaming company', city: 'Toronto', contactId: 'owen',
    status: 'on_hold', relationshipOwnerId: 'james', risk: 'standard',
    mandate: { commodities: ['Gold', 'Copper'], countries: ['Kenya', 'Tanzania', 'Zambia'], stages: ['Pre-feasibility'], licenceTypes: ['Mining licence'], ticket: [10, 40], structures: ['Royalty or stream'], esg: [] },
    reviews: [{ date: '2026-08-10', channel: 'Phone', whoId: 'james', with: 'Investment director', topics: 'Royalty appetite', assessment: 'Awaiting entity documents.' }],
  },
  {
    id: 'lakeshore', name: 'Lakeshore Battery Metals', type: 'Strategic corporate buyer', city: 'Detroit', contactId: 'owen',
    status: 'invited', relationshipOwnerId: 'james', risk: 'standard',
    mandate: { commodities: ['Graphite', 'Copper'], countries: ['Kenya'], stages: ['Exploration'], licenceTypes: [], ticket: [5, 15], structures: ['Offtake'], esg: [] },
    reviews: [{ date: '2026-09-20', channel: 'Conference, Denver', whoId: 'james', with: 'Head of procurement', topics: 'Graphite supply', assessment: 'Invitation sent 21 Sep.' }],
  },
]

export const introductions: Introduction[] = [
  { id: 'in-1', assetId: 'kiboko', investorId: 'cedar-peak', status: 'in_diligence', teaserSentOn: '2026-09-12', openedOn: '2026-09-12', respondedOn: '2026-09-14', ndaOn: '2026-09-16', daysInStage: 8 },
  { id: 'in-2', assetId: 'kiboko', investorId: 'brightwater', status: 'opened', teaserSentOn: '2026-09-22', openedOn: '2026-09-23', daysInStage: 1 },
  { id: 'in-3', assetId: 'pwani', investorId: 'brightwater', status: 'not_now', teaserSentOn: '2026-08-04', openedOn: '2026-08-05', respondedOn: '2026-08-06', declineReason: 'Outside our commodity focus', daysInStage: 49 },
  { id: 'in-4', assetId: 'pwani', investorId: 'hargrove', status: 'nda_signed', teaserSentOn: '2026-08-20', openedOn: '2026-08-21', respondedOn: '2026-08-24', ndaOn: '2026-09-02', daysInStage: 22 },
  { id: 'in-5', assetId: 'pwani', investorId: 'cedar-peak', status: 'in_diligence', teaserSentOn: '2026-07-22', openedOn: '2026-07-22', respondedOn: '2026-07-24', ndaOn: '2026-07-29', daysInStage: 57 },
  { id: 'in-6', assetId: 'galana', investorId: 'brightwater', status: 'loi', teaserSentOn: '2026-08-30', openedOn: '2026-08-30', respondedOn: '2026-08-31', ndaOn: '2026-08-31', daysInStage: 3 },
  { id: 'in-7', assetId: 'galana', investorId: 'cedar-peak', status: 'in_diligence', teaserSentOn: '2026-09-01', openedOn: '2026-09-01', respondedOn: '2026-09-03', ndaOn: '2026-09-04', daysInStage: 20 },
  { id: 'in-8', assetId: 'galana', investorId: 'hargrove', status: 'expired', teaserSentOn: '2026-09-01', daysInStage: 23 },
]

export const dealRooms: DealRoom[] = [
  { id: 'dr-kiboko-cedar', assetId: 'kiboko', investorId: 'cedar-peak', ndaOn: '2026-09-16', expires: '2026-12-16', documents: 86, openQuestions: 3, activity: [2, 5, 9, 4, 12, 7, 14, 6, 3, 8, 11, 5, 9, 14], status: 'open' },
  { id: 'dr-galana-bright', assetId: 'galana', investorId: 'brightwater', ndaOn: '2026-08-31', expires: '2026-11-30', documents: 112, openQuestions: 1, activity: [6, 8, 5, 10, 4, 3, 7, 9, 12, 6, 4, 5, 2, 6], status: 'open' },
  { id: 'dr-galana-cedar', assetId: 'galana', investorId: 'cedar-peak', ndaOn: '2026-09-04', expires: '2026-12-04', documents: 112, openQuestions: 0, activity: [1, 3, 2, 6, 4, 2, 5, 3, 1, 2, 4, 3, 2, 1], status: 'open' },
  { id: 'dr-pwani-hargrove', assetId: 'pwani', investorId: 'hargrove', ndaOn: '2026-09-02', expires: '2026-12-02', documents: 97, openQuestions: 2, activity: [0, 1, 3, 2, 0, 1, 4, 2, 1, 0, 2, 1, 0, 1], status: 'open' },
  { id: 'dr-pwani-cedar', assetId: 'pwani', investorId: 'cedar-peak', ndaOn: '2026-07-29', expires: '2026-10-01', documents: 97, openQuestions: 0, activity: [3, 1, 0, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], status: 'closing' },
]

export const questions: Question[] = [
  {
    id: 'q1', roomId: 'dr-kiboko-cedar', category: 'Geology', askedById: 'marcus', askedOn: '2026-09-19', due: '2026-09-26', status: 'open',
    text: 'Can you share core photos for holes KR-25-014 to KR-25-022? We want to check the high-grade intercepts.', docRef: 'kb-d11',
  },
  {
    id: 'q2', roomId: 'dr-kiboko-cedar', category: 'Title', askedById: 'marcus', askedOn: '2026-09-17', due: '2026-09-24', status: 'answered',
    text: 'What is the status of the licence renewal application?',
    answer: 'The holder is preparing the renewal application and expects to file it by 10 Oct 2026. SSD will re-check the cadastre that day and update the passport.',
    answeredOn: '2026-09-20', citations: ['kb-d02', 'kb-d04'],
  },
  {
    id: 'q3', roomId: 'dr-kiboko-cedar', category: 'Technical', askedById: 'tom', askedOn: '2026-09-18', due: '2026-09-23', status: 'open',
    text: 'Has any flotation test work been done on the concentrate? If so, what purity was achieved?', docRef: 'kb-d14',
  },
  {
    id: 'q4', roomId: 'dr-kiboko-cedar', category: 'Environment and social', askedById: 'priya', askedOn: '2026-09-21', due: '2026-09-28', status: 'follow_up',
    text: 'Is there a written arrangement with the artisanal group in the north-east corner?',
    answer: 'There is an informal arrangement only. The holder is documenting it; the ESG specialist will review it at the Investor-ready visit.',
    answeredOn: '2026-09-22', citations: ['kb-d17'],
  },
  {
    id: 'q5', roomId: 'dr-galana-bright', category: 'Technical', askedById: 'rachel', askedOn: '2026-09-20', due: '2026-09-27', status: 'open',
    text: 'Could the owner share the purification test report for the 2026 bulk sample?',
  },
]

export const investor = (id: string) => investors.find((i) => i.id === id)!
export const introFor = (assetId: string, investorId: string) => introductions.find((i) => i.assetId === assetId && i.investorId === investorId)
