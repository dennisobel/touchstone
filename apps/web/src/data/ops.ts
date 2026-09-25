import type { InfoRequest, Message, Task } from './types'

// Kevin Omondi's queue (CC-01): 5 blocked, 8 due today, 6 awaiting owner, 2 escalations.
export const tasks: Task[] = [
  { id: 't01', title: 'Title opinion', assetId: 'nyanza', workstream: 'title', assigneeId: 'wanjiru', due: '2026-09-27', status: 'blocked', blockedBy: 'certified search not received', group: 'blocked', kind: 'task' },
  { id: 't02', title: 'Forest reserve consent evidence', assetId: 'mawe', workstream: 'title', assigneeId: 'kevin', due: '2026-09-26', status: 'blocked', blockedBy: 'holder has not supplied consent', group: 'blocked', kind: 'task' },
  { id: 't03', title: 'Laboratory certificate cross-check', assetId: 'kakamega', workstream: 'geology', assigneeId: 'mercy', due: '2026-09-25', status: 'blocked', blockedBy: 'laboratory not responding after 3 attempts', group: 'blocked', kind: 'task' },
  { id: 't04', title: 'Cadastre capture', assetId: 'lodwar', workstream: 'title', assigneeId: 'kevin', due: '2026-09-25', status: 'blocked', blockedBy: 'cadastre portal unavailable (3 retries)', group: 'blocked', kind: 'task' },
  { id: 't05', title: 'Environmental licence check', assetId: 'tsavo', workstream: 'esg', assigneeId: 'faith', due: '2026-09-28', status: 'blocked', blockedBy: 'NEMA register search pending', group: 'blocked', kind: 'task' },

  { id: 't06', title: 'Cadastre re-check', assetId: 'kiboko', workstream: 'title', assigneeId: 'kevin', due: '2026-09-24', status: 'todo', group: 'today', kind: 'task' },
  { id: 't07', title: 'Triage new submission', assetId: 'mutomo', workstream: 'intake', assigneeId: 'kevin', due: '2026-09-24', status: 'todo', group: 'today', kind: 'task' },
  { id: 't08', title: 'Triage new submission', assetId: 'lodwar', workstream: 'intake', assigneeId: 'kevin', due: '2026-09-24', status: 'todo', group: 'today', kind: 'task' },
  { id: 't09', title: 'Sanctions hit disposition', assetId: 'tsavo', workstream: 'integrity', assigneeId: 'kevin', due: '2026-09-24', status: 'in_progress', group: 'today', kind: 'task' },
  { id: 't10', title: 'Beneficial owner mapping', assetId: 'kakamega', workstream: 'ownership', assigneeId: 'mercy', due: '2026-09-24', status: 'in_progress', group: 'today', kind: 'task' },
  { id: 't11', title: 'Assess owner replies', assetId: 'kakamega', workstream: 'esg', assigneeId: 'mercy', due: '2026-09-24', status: 'todo', group: 'today', kind: 'task' },
  { id: 't12', title: 'Teaser wording for Hargrove Family Office', assetId: 'kiboko', workstream: 'deal', assigneeId: 'kevin', due: '2026-09-24', status: 'todo', group: 'today', kind: 'approval', awaitingOwner: true },
  { id: 't13', title: 'Deal-room question overdue: flotation results', assetId: 'kiboko', workstream: 'deal', assigneeId: 'kevin', due: '2026-09-23', status: 'todo', group: 'today', kind: 'task' },

  { id: 't14', title: 'Resource review, JORC Inferred', assetId: 'kiboko', workstream: 'geology', assigneeId: 'nomvula', due: '2026-10-07', status: 'in_progress', group: 'week', kind: 'task' },
  { id: 't15', title: 'Site visit', assetId: 'nyanza', workstream: 'esg', assigneeId: 'brian', due: '2026-10-02', status: 'todo', group: 'week', kind: 'task' },
  { id: 't16', title: 'Request: survey plan with beacon coordinates', assetId: 'nyanza', workstream: 'title', assigneeId: 'peter', due: '2026-09-27', status: 'todo', group: 'week', kind: 'rfi', awaitingOwner: true },
  { id: 't17', title: 'Request: other interests in the permit', assetId: 'nyanza', workstream: 'ownership', assigneeId: 'peter', due: '2026-09-27', status: 'todo', group: 'week', kind: 'rfi', awaitingOwner: true },
  { id: 't18', title: 'Request: renewal application evidence', assetId: 'kiboko', workstream: 'title', assigneeId: 'grace', due: '2026-10-10', status: 'todo', group: 'later', kind: 'rfi', awaitingOwner: true },
  { id: 't19', title: 'Mandate confirmation call with the holder', assetId: 'mawe', workstream: 'ownership', assigneeId: 'kevin', due: '2026-09-26', status: 'todo', group: 'week', kind: 'task', awaitingOwner: true },
  { id: 't20', title: 'Request: community consultation notes', assetId: 'pwani', workstream: 'esg', assigneeId: 'omar', due: '2026-09-30', status: 'todo', group: 'week', kind: 'rfi', awaitingOwner: true },
  { id: 't21', title: 'ESG desk review', assetId: 'tsavo', workstream: 'esg', assigneeId: 'faith', due: '2026-09-29', status: 'todo', group: 'week', kind: 'task' },
  { id: 't22', title: 'Geologist desk review', assetId: 'nyanza', workstream: 'geology', assigneeId: 'amani', due: '2026-09-30', status: 'in_progress', group: 'week', kind: 'task' },
  { id: 't23', title: 'Plain-English summaries for v3', assetId: 'kiboko', workstream: 'deal', assigneeId: 'kevin', due: '2026-10-20', status: 'todo', group: 'later', kind: 'task' },
  { id: 't24', title: 'Company registry extract', assetId: 'nyanza', workstream: 'ownership', assigneeId: 'kevin', due: '2026-09-09', status: 'done', group: 'later', kind: 'task' },
  { id: 't25', title: 'Sanctions and PEP screening', assetId: 'nyanza', workstream: 'integrity', assigneeId: 'kevin', due: '2026-09-05', status: 'done', group: 'later', kind: 'task' },
]

export const infoRequests: InfoRequest[] = [
  {
    id: 'rfi-1', assetId: 'nyanza', askedById: 'wanjiru', due: '2026-09-27', status: 'open', claimId: 'ny-t3',
    title: 'Survey plan with beacon coordinates',
    titleSw: 'Mpango wa upimaji wenye viwianishi vya alama za mipaka',
    question: 'Please send the survey plan showing the beacon coordinates.',
    questionSw: 'Tafadhali tuma mpango wa upimaji unaoonyesha viwianishi vya alama za mipaka.',
    why: {
      en: "The Ministry's map shows a smaller boundary than the one you drew. The survey plan shows which one is right.",
      sw: 'Ramani ya Wizara inaonyesha mpaka mdogo kuliko ule uliouchora. Mpango wa upimaji unaonyesha upi ni sahihi.',
    },
    formats: 'Photo, PDF, or a list of coordinates',
  },
  {
    id: 'rfi-2', assetId: 'nyanza', askedById: 'wanjiru', due: '2026-09-27', status: 'open', claimId: 'ny-t4',
    title: 'Other interests in the permit',
    titleSw: 'Maslahi mengine kwenye kibali',
    question: 'Does anyone else have a share in, or a loan against, your mining permit? For example a partner, buyer or lender.',
    questionSw: 'Je, kuna mtu mwingine mwenye hisa au mkopo dhidi ya kibali chako cha uchimbaji? Kwa mfano mshirika, mnunuzi au mkopeshaji.',
    why: {
      en: 'A lawyer must confirm that nobody else has rights over the permit before investors rely on it.',
      sw: 'Wakili lazima athibitishe kwamba hakuna mtu mwingine mwenye haki juu ya kibali kabla wawekezaji hawajakitegemea.',
    },
    formats: 'A short answer, and any agreement as a photo or PDF',
  },
  {
    id: 'rfi-3', assetId: 'nyanza', askedById: 'amani', due: '2026-09-22', status: 'follow_up', claimId: 'ny-g1',
    title: '2019 assay certificates',
    titleSw: 'Vyeti vya uchunguzi wa sampuli vya 2019',
    question: 'Please send the laboratory certificates for the 2019 samples.',
    questionSw: 'Tafadhali tuma vyeti vya maabara vya sampuli za 2019.',
    why: {
      en: 'Certificates from the laboratory prove the results in the report were not changed.',
      sw: 'Vyeti kutoka maabara vinathibitisha kwamba matokeo ya ripoti hayakubadilishwa.',
    },
    formats: 'Photo or PDF',
    answer: 'I have sent the report pages with the results.',
    followUp: 'Thank you. The report mentions a laboratory in Kisumu. Do you have the original certificates with the laboratory stamp?',
  },
  {
    id: 'rfi-4', assetId: 'nyanza', askedById: 'faith', due: '2026-09-25', status: 'sent', claimId: 'ny-e1',
    title: 'Photos of the processing area',
    titleSw: 'Picha za eneo la kuchakata',
    question: 'Please send photos of where gold is processed on the site.',
    questionSw: 'Tafadhali tuma picha za mahali dhahabu inachakatwa kwenye eneo.',
    why: {
      en: 'We need to see how gold is separated so we can describe it fairly to investors.',
      sw: 'Tunahitaji kuona jinsi dhahabu inavyotenganishwa ili tuieleze kwa haki kwa wawekezaji.',
    },
    formats: 'Photos',
    answer: '4 photos sent on 22 Sep',
  },
  {
    id: 'rfi-5', assetId: 'nyanza', askedById: 'kevin', due: '2026-09-04', status: 'accepted', claimId: 'ny-o1',
    title: 'Photo of your national ID',
    titleSw: 'Picha ya kitambulisho chako cha taifa',
    question: 'Please photograph the front and back of your national ID.',
    questionSw: 'Tafadhali piga picha ya mbele na nyuma ya kitambulisho chako cha taifa.',
    why: { en: 'We confirm who holds the licence before anyone relies on it.', sw: 'Tunathibitisha nani anamiliki leseni kabla mtu yeyote hajaitegemea.' },
    formats: 'Photo',
    answer: 'Sent 3 Sep',
  },
]

export const ownerMessages: Message[] = [
  { id: 'm1', from: 'ssd', authorId: 'kevin', at: '2026-09-02T10:14', status: 'read', text: "Karibu Peter. I'm Kevin, your SSD contact. I'll update you every week, and you can message me here or on WhatsApp." },
  { id: 'm2', from: 'owner', authorId: 'peter', at: '2026-09-02T10:20', status: 'read', text: 'Asante Kevin. How long will the checks take?' },
  { id: 'm3', from: 'ssd', authorId: 'kevin', at: '2026-09-02T10:31', status: 'read', text: 'About 30 days for the Standard tier. Brian Kiptoo, our field geologist, will visit the site. I will confirm the date.' },
  { id: 'm4', from: 'ssd', authorId: 'kevin', at: '2026-09-18T15:02', status: 'read', text: 'Brian will visit on 2 Oct. Please make sure someone can show him the beacons.' },
  { id: 'm5', from: 'owner', authorId: 'peter', at: '2026-09-18T16:45', status: 'read', text: 'Yes. My son Tobias will be there. He knows all the corners.' },
  { id: 'm6', from: 'ssd', authorId: 'kevin', at: '2026-09-23T16:40', status: 'read', text: 'Wanjiru Kamau, our lawyer, has 2 questions for you, due 27 Sep. You will find them under Requests.' },
  { id: 'm7', from: 'owner', authorId: 'peter', at: '2026-09-24T07:55', status: 'delivered', text: 'I will send the survey plan today.', attachment: { name: 'beacon-sketch.jpg', size: '1.2 MB' } },
]

export const graceMessages: Message[] = [
  { id: 'g1', from: 'ssd', authorId: 'kevin', at: '2026-09-20T12:05', status: 'read', text: 'Your Standard passport (v2) is released. Two vetted investors have received the teaser.' },
  { id: 'g2', from: 'owner', authorId: 'grace', at: '2026-09-20T12:30', status: 'read', text: 'Great news. When does the Investor-ready review start?' },
  { id: 'g3', from: 'ssd', authorId: 'kevin', at: '2026-09-20T13:02', status: 'read', text: 'Dr Nomvula Dlamini has started the resource review. Her report is due on 7 Oct.' },
  { id: 'g4', from: 'ssd', authorId: 'kevin', at: '2026-09-23T09:15', status: 'read', text: 'Please approve the teaser wording for one more investor. You will find it under your asset.' },
]

/** Verification plan steps used by the Status Timeline (OA-08, CC-04). */
export const plans: Record<string, { label: string; date: string; who: string; state: 'done' | 'current' | 'next'; note?: string }[]> = {
  nyanza: [
    { label: 'Submitted', date: '2026-09-02', who: 'peter', state: 'done' },
    { label: 'Accepted: Standard tier', date: '2026-09-04', who: 'kevin', state: 'done' },
    { label: 'Desk checks (4 of 7 done)', date: '2026-09-30', who: 'kevin', state: 'current', note: 'Title opinion waiting for a certified search' },
    { label: 'Site visit', date: '2026-10-02', who: 'brian', state: 'next' },
    { label: 'Expert sign-off', date: '2026-10-12', who: 'wanjiru', state: 'next' },
    { label: 'Findings review (you reply)', date: '2026-10-16', who: 'peter', state: 'next' },
    { label: 'Release', date: '2026-10-30', who: 'sarah', state: 'next' },
  ],
  kiboko: [
    { label: 'Standard passport v2 released', date: '2026-09-20', who: 'sarah', state: 'done' },
    { label: 'Updated QA/QC data received', date: '2026-09-22', who: 'grace', state: 'done' },
    { label: 'Independent resource review', date: '2026-10-07', who: 'nomvula', state: 'current', note: 'Qualified Person review for Investor-ready' },
    { label: 'Field ESG assessment with community input', date: '2026-10-14', who: 'faith', state: 'next' },
    { label: 'Technical and infrastructure review', date: '2026-10-16', who: 'kevin', state: 'next' },
    { label: 'Findings review', date: '2026-10-21', who: 'grace', state: 'next' },
    { label: 'Release v3 (Investor-ready)', date: '2026-10-30', who: 'sarah', state: 'next' },
  ],
  mawe: [
    { label: 'Submitted by representative', date: '2026-09-15', who: 'ali', state: 'done' },
    { label: 'Accepted: Desk screen', date: '2026-09-17', who: 'kevin', state: 'done' },
    { label: 'Desk checks (3 of 6 done)', date: '2026-09-29', who: 'kevin', state: 'current', note: 'Blocked by a Critical flag' },
    { label: 'Findings review', date: '2026-10-01', who: 'salim', state: 'next' },
    { label: 'Release', date: '2026-10-08', who: 'sarah', state: 'next' },
  ],
}
