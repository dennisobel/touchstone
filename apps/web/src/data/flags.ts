import type { RedFlag } from './types'

export const flags: RedFlag[] = [
  {
    id: 'kb-f1', assetId: 'kiboko', severity: 'high', status: 'open', workstream: 'title',
    title: 'Licence expires in under 6 months; no renewal filed',
    plain: {
      en: 'Your licence ends on 14 Mar 2027 and we could not find a renewal application. Investors see this at the top of your passport until a renewal is filed.',
      sw: 'Leseni yako inaisha tarehe 14 Mac 2027 na hatukupata ombi la kuihuisha. Wawekezaji wataona hili juu ya pasipoti yako hadi ombi la kuihuisha liwasilishwe.',
    },
    description: 'PL/2024/0117 expires on 14 Mar 2027 (171 days). Kenyan prospecting licences can be renewed twice (Mining Act s.83), but no renewal filing appears on the cadastre and none was supplied.',
    mitigation: 'Owner is preparing the renewal application. SSD re-checks the cadastre on 10 Oct 2026.',
    ownerId: 'kevin', raisedOn: '2026-09-10', updatedOn: '2026-09-20', claimIds: ['kb-t1', 'kb-t6'],
    evidence: [{ docId: 'kb-d02', page: 1 }, { docId: 'kb-d04', page: 4 }],
  },
  {
    id: 'kb-f2', assetId: 'kiboko', severity: 'medium', status: 'open', workstream: 'geology',
    title: 'QA/QC data incomplete',
    plain: {
      en: 'Some quality-control samples are missing from the 2025 drilling. You sent more data on 22 Sep; the reviewer is checking it.',
      sw: 'Baadhi ya sampuli za udhibiti wa ubora hazipo kwenye uchimbaji wa 2025. Ulituma data zaidi tarehe 22 Sep; mkaguzi anaiangalia.',
    },
    description: 'Field duplicates were inserted at 2.8% against a 5% target, and batches 31–38 carry no blanks. Updated QA/QC data received on 22 Sep 2026 is under review by the Qualified Person.',
    mitigation: 'Dr Nomvula Dlamini to assess the updated QA/QC summary as part of the resource review.',
    ownerId: 'kevin', raisedOn: '2026-09-14', updatedOn: '2026-09-22', claimIds: ['kb-g3'],
    evidence: [{ docId: 'kb-d13', page: 6 }],
  },
  {
    id: 'kb-f3', assetId: 'kiboko', severity: 'medium', status: 'open', workstream: 'esg',
    title: 'Artisanal digging in the north-east corner',
    plain: {
      en: 'About 40 people are digging in the north-east corner of your licence. This is disclosed, not treated as a failure.',
      sw: 'Takriban watu 40 wanachimba kwenye kona ya kaskazini-mashariki ya leseni yako. Hili linaonyeshwa, halihesabiwi kama kosa.',
    },
    description: 'About 3 ha of artisanal workings with roughly 40 people, observed on the 2 Sep site visit. No children or mercury seen. The holder reports an informal arrangement; no written agreement exists.',
    mitigation: 'Owner to document the arrangement with the artisanal group; ESG specialist to review at the Investor-ready visit.',
    ownerId: 'kevin', raisedOn: '2026-09-04', updatedOn: '2026-09-18', claimIds: ['kb-e2'],
    evidence: [{ docId: 'kb-d17', page: 18 }],
  },
  {
    id: 'ny-f1', assetId: 'nyanza', severity: 'high', status: 'open', workstream: 'geology',
    title: 'Historical estimate only',
    plain: {
      en: 'Your 2019 report uses grab samples, which are a hint rather than an estimate. Investors will see that there is no current resource yet.',
      sw: 'Ripoti yako ya 2019 inatumia sampuli za mkono, ambazo ni dalili tu badala ya makadirio. Wawekezaji wataona kwamba bado hakuna makadirio ya sasa.',
    },
    description: 'The only estimate is a 2019 consultant report based on grab samples, not prepared under a current reporting code. It cannot display as a current resource.',
    mitigation: 'Recommend a scoping drilling programme; disclose as historical.',
    ownerId: 'kevin', raisedOn: '2026-09-16', updatedOn: '2026-09-16', claimIds: ['ny-g1'],
    evidence: [{ docId: 'ny-d03', page: 12 }],
  },
  {
    id: 'ny-f2', assetId: 'nyanza', severity: 'medium', status: 'open', workstream: 'esg',
    title: 'Mercury use observed at artisanal workings',
    plain: {
      en: 'Mercury was seen being used at artisanal workings on your permit. You can reply with what you are doing about it.',
      sw: 'Zebaki ilionekana ikitumika kwenye machimbo madogo ndani ya kibali chako. Unaweza kujibu kueleza unachofanya kuhusu hili.',
    },
    description: 'Photos from the assisted intake visit on 5 Sep 2026 show amalgamation at two artisanal sites. The 2 Oct site visit will confirm extent.',
    ownerId: 'kevin', raisedOn: '2026-09-06', updatedOn: '2026-09-06', claimIds: ['ny-e1'], evidence: [],
  },
  {
    id: 'mw-f1', assetId: 'mawe', severity: 'critical', status: 'open', workstream: 'title',
    title: 'Licence area overlaps a gazetted forest reserve with no consent on file',
    plain: {
      en: 'Part of the licence lies inside a gazetted forest reserve and we have no consent for it. The passport cannot be released until this is resolved.',
      sw: 'Sehemu ya leseni iko ndani ya hifadhi ya msitu iliyotangazwa kwenye gazeti na hatuna kibali chake. Pasipoti haiwezi kutolewa hadi hili litatuliwe.',
    },
    description: 'About 410 ha of PL/2025/0206 lies inside a gazetted forest reserve. Mining there needs consent from the forest authority; none has been supplied. A licence granted over a closed area can fail entirely, as in the Mrima Hill arbitration.',
    mitigation: 'Request the consent from the holder, or a boundary variation excluding the reserve.',
    ownerId: 'kevin', raisedOn: '2026-09-19', updatedOn: '2026-09-22', claimIds: ['mw-t2'],
    evidence: [{ docId: 'mw-d03', page: 2 }],
  },
  {
    id: 'kk-f1', assetId: 'kakamega', severity: 'high', status: 'open', workstream: 'title',
    title: 'Licence expired on 13 Aug 2026; renewal pending',
    plain: { en: '', sw: '' },
    description: 'PL/2023/0512 expired on 13 Aug 2026. A renewal filing dated 2 Aug 2026 is on the cadastre and awaiting decision.',
    ownerId: 'mercy', raisedOn: '2026-09-05', updatedOn: '2026-09-05', claimIds: [], evidence: [],
  },
  {
    id: 'kk-f2', assetId: 'kakamega', severity: 'low', status: 'open', workstream: 'ownership',
    title: 'Registry address differs from correspondence address',
    plain: { en: '', sw: '' },
    description: 'The company registry shows a Kisumu address; correspondence uses Kakamega. Housekeeping only.',
    ownerId: 'mercy', raisedOn: '2026-09-08', updatedOn: '2026-09-08', claimIds: [], evidence: [],
  },
  {
    id: 'ts-f1', assetId: 'tsavo', severity: 'high', status: 'open', workstream: 'esg',
    title: 'Active community dispute over grazing land',
    plain: { en: '', sw: '' },
    description: 'County records show an open complaint from a neighbouring grazing group about access routes across the permit.',
    ownerId: 'kevin', raisedOn: '2026-09-21', updatedOn: '2026-09-21', claimIds: [], evidence: [],
  },
  {
    id: 'pw-f1', assetId: 'pwani', severity: 'medium', status: 'mitigated', workstream: 'esg',
    title: 'Resettlement plan not yet agreed',
    plain: { en: '', sw: '' },
    description: 'Twelve households sit inside the proposed pit footprint. A resettlement framework is drafted; community sign-off pending.',
    mitigation: 'Resettlement action plan to IFC PS5 in preparation; community consultation scheduled.',
    ownerId: 'mercy', raisedOn: '2026-06-30', updatedOn: '2026-09-02', claimIds: [], evidence: [],
  },
  {
    id: 'pw-f2', assetId: 'pwani', severity: 'high', status: 'accepted', workstream: 'title',
    title: 'Retention licence expires on 30 Sep 2026; conversion application filed',
    plain: { en: '', sw: '' },
    description: 'Retention licence ends on 30 Sep 2026. A mining licence application was filed on 1 Jul 2026 and is in review.',
    rationale: 'Application evidenced on the cadastre; Ministry acknowledgement on file. Accepted by Kevin Omondi and Sarah Mitchell on 3 Jul 2026.',
    ownerId: 'mercy', raisedOn: '2026-06-20', updatedOn: '2026-07-03', claimIds: [], evidence: [],
  },
  {
    id: 'ga-f1', assetId: 'galana', severity: 'low', status: 'resolved', workstream: 'legal',
    title: 'Missing county business permit',
    plain: { en: '', sw: '' },
    description: 'County single business permit for 2026 supplied on 20 Aug 2026.',
    ownerId: 'mercy', raisedOn: '2026-07-11', updatedOn: '2026-08-20', claimIds: [], evidence: [],
  },
]

export const flagsFor = (assetId: string) => flags.filter((f) => f.assetId === assetId)
export const openFlagsFor = (assetId: string) => flags.filter((f) => f.assetId === assetId && f.status !== 'resolved')
