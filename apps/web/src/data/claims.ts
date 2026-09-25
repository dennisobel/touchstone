import type { Claim } from './types'

// Claims ledger (Platform PRD §5). Kiboko Ridge Graphite (Asset A) is the fully worked example.
export const claims: Claim[] = [
  // ---------- Asset A · Title and tenure ----------
  {
    id: 'kb-t1', assetId: 'kiboko', workstream: 'title', material: true,
    statement: 'Prospecting licence PL/2024/0117 is active until 14 Mar 2027',
    value: { kind: 'date', value: '2027-03-14' },
    status: 'verified', level: 3, methods: [2, 3], verifierId: 'wanjiru', method: 'Title opinion; automated cadastre check',
    verifiedOn: '2026-09-10', expiresOn: '2026-10-10', source: 'Registry: Kenya Mining Cadastre Portal',
    evidence: [{ docId: 'kb-d02', page: 1, region: 'Licence status panel' }, { docId: 'kb-d03', page: 2 }, { docId: 'kb-d04', page: 4, region: 'Opinion §2.1' }],
    flagId: 'kb-f1',
  },
  {
    id: 'kb-t2', assetId: 'kiboko', workstream: 'title', material: true,
    statement: 'The registered holder is Kiboko Minerals Ltd',
    value: { kind: 'text', value: 'Kiboko Minerals Ltd' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Cadastre record matched to company registry',
    verifiedOn: '2026-09-10', expiresOn: '2026-10-10', source: 'Kenya Mining Cadastre Portal; Business Registration Service',
    evidence: [{ docId: 'kb-d02', page: 1, region: 'Holder field' }, { docId: 'kb-d07', page: 1 }],
  },
  {
    id: 'kb-t3', assetId: 'kiboko', workstream: 'title', material: true,
    statement: "The owner's boundary matches the registered boundary within tolerance",
    value: { kind: 'number', value: 2.1, unit: '% area difference' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Boundary overlay against the cadastre polygon',
    verifiedOn: '2026-09-12', expiresOn: '2027-03-12', source: 'Kenya Mining Cadastre Portal',
    evidence: [{ docId: 'kb-d05', page: 1, region: 'Beacon schedule' }, { docId: 'kb-d02', page: 1 }],
  },
  {
    id: 'kb-t4', assetId: 'kiboko', workstream: 'title', material: true,
    statement: 'No overlap with protected areas, forest reserves or gazetted closures',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Map overlay: protected areas, forest reserves, gazette notices',
    verifiedOn: '2026-09-12', expiresOn: '2027-03-12', source: 'Protected Planet; Kenya Gazette',
    evidence: [{ docId: 'kb-d19', page: 2 }],
  },
  {
    id: 'kb-t5', assetId: 'kiboko', workstream: 'title', material: true,
    statement: 'No mortgages, charges or court orders are registered against the licence',
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Certified search and title opinion',
    verifiedOn: '2026-09-08', expiresOn: '2027-03-08', source: 'Mining Cadastre certified search',
    evidence: [{ docId: 'kb-d03', page: 3 }, { docId: 'kb-d04', page: 7, region: 'Opinion §3' }],
  },
  {
    id: 'kb-t6', assetId: 'kiboko', workstream: 'title', material: true,
    statement: 'A renewal application for PL/2024/0117 has been filed',
    status: 'declared', level: 0, methods: [0], source: 'Owner declaration', evidence: [], flagId: 'kb-f1',
  },
  {
    id: 'kb-t7', assetId: 'kiboko', workstream: 'title', material: false,
    statement: 'The 2025 work programme and annual fees are evidenced',
    status: 'in_review', level: 1, methods: [1], method: 'Receipts supplied; awaiting cadastre confirmation',
    source: 'Owner documents', evidence: [{ docId: 'kb-d04', page: 12 }],
  },

  // ---------- Asset A · Ownership and control ----------
  {
    id: 'kb-o1', assetId: 'kiboko', workstream: 'ownership', material: true,
    statement: 'Kiboko Minerals Ltd is owned 72% by Grace Wanjiku and 28% by Ndege Capital Ltd',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'CR12 official search',
    verifiedOn: '2026-09-05', expiresOn: '2026-12-04', source: 'Business Registration Service',
    evidence: [{ docId: 'kb-d07', page: 2, region: 'Shareholders table' }],
  },
  {
    id: 'kb-o2', assetId: 'kiboko', workstream: 'ownership', material: true,
    statement: 'Beneficial owners are traced to two natural persons at or above the 10% threshold',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Beneficial ownership register extract',
    verifiedOn: '2026-09-05', expiresOn: '2026-12-04', source: 'Business Registration Service',
    evidence: [{ docId: 'kb-d08', page: 1 }],
  },
  {
    id: 'kb-o3', assetId: 'kiboko', workstream: 'ownership', material: false,
    statement: 'Directors are Grace Wanjiku, Paul Mwangi and Lucy Chebet',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'CR12 official search',
    verifiedOn: '2026-09-05', expiresOn: '2026-12-04', source: 'Business Registration Service',
    evidence: [{ docId: 'kb-d07', page: 3 }],
  },

  // ---------- Asset A · Integrity and sanctions ----------
  {
    id: 'kb-i1', assetId: 'kiboko', workstream: 'integrity', material: true,
    statement: 'No sanctions hits for the company, directors or beneficial owners (US, UN, EU, UK lists)',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated screening, re-screened daily',
    verifiedOn: '2026-09-24', expiresOn: '2026-09-25', source: 'Sanctions screening provider',
    evidence: [{ docId: 'kb-d07', page: 1 }],
  },
  {
    id: 'kb-i2', assetId: 'kiboko', workstream: 'integrity', material: true,
    statement: 'No politically exposed persons among owners, directors or their close associates',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated PEP screening with analyst disposition',
    verifiedOn: '2026-09-24', expiresOn: '2026-09-25', source: 'PEP screening provider', evidence: [],
  },
  {
    id: 'kb-i3', assetId: 'kiboko', workstream: 'integrity', material: true,
    statement: 'No adverse media found in English or Swahili sources, including local press',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Adverse-media search, 14 hits dispositioned',
    verifiedOn: '2026-09-23', expiresOn: '2026-09-25', source: 'Adverse-media provider; local press archive', evidence: [],
  },
  {
    id: 'kb-i4', assetId: 'kiboko', workstream: 'integrity', material: true,
    statement: 'No litigation involving the holder or its directors',
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Court records search, title opinion',
    verifiedOn: '2026-09-08', expiresOn: '2027-03-08', source: 'Kenya Law court records', evidence: [{ docId: 'kb-d04', page: 11 }],
  },

  // ---------- Asset A · Geology and resources ----------
  {
    id: 'kb-g1', assetId: 'kiboko', workstream: 'geology', material: true,
    statement: 'JORC (2012) Inferred resource of 12.4 Mt at 8.1% graphitic carbon, 4% Cg cut-off',
    value: { kind: 'number', value: 12.4, unit: 'Mt at 8.1% Cg' },
    status: 'in_review', level: 1, methods: [1], verifierId: 'nomvula', method: 'Independent resource review in progress (Investor-ready), due 7 Oct',
    source: "Owner's JORC report, signed by the Competent Person",
    evidence: [{ docId: 'kb-d10', page: 47, region: 'Table 14.3 Mineral Resource statement' }],
  },
  {
    id: 'kb-g2', assetId: 'kiboko', workstream: 'geology', material: true,
    statement: 'The resource is signed by Competent Person Samuel Otieno (MAusIMM 318842), effective 30 Jun 2025',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Membership checked on the AusIMM register',
    verifiedOn: '2026-09-11', expiresOn: '2028-09-11', source: 'AusIMM member register',
    evidence: [{ docId: 'kb-d10', page: 3, region: 'Competent Person statement' }],
  },
  {
    id: 'kb-g3', assetId: 'kiboko', workstream: 'geology', material: true,
    statement: 'Certified standards, blanks and duplicates were inserted at 5% or more of samples',
    status: 'discrepancy', level: 1, methods: [1], verifierId: 'amani', method: 'Geologist desk review: duplicates at 2.8%; no blanks in batches 31–38',
    verifiedOn: '2026-09-14', source: 'QA/QC summary 2025', evidence: [{ docId: 'kb-d13', page: 6, region: 'Insertion rates table' }],
    flagId: 'kb-f2',
  },
  {
    id: 'kb-g4', assetId: 'kiboko', workstream: 'geology', material: true,
    statement: 'All 38 assay certificates were confirmed with the issuing ISO/IEC 17025 laboratory',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Certificate numbers confirmed with the laboratory',
    verifiedOn: '2026-09-15', expiresOn: '2028-09-15', source: 'Issuing laboratory', evidence: [{ docId: 'kb-d12', page: 1 }],
  },
  {
    id: 'kb-g5', assetId: 'kiboko', workstream: 'geology', material: true,
    statement: '42% of concentrate reports at +80 mesh (large flake)',
    value: { kind: 'number', value: 42, unit: '% at +80 mesh' },
    status: 'in_review', level: 1, methods: [1], verifierId: 'nomvula', method: 'Part of the independent resource review',
    source: 'Metallurgical test work', evidence: [{ docId: 'kb-d14', page: 9, region: 'Flake size distribution chart' }],
  },
  {
    id: 'kb-g6', assetId: 'kiboko', workstream: 'geology', material: false,
    statement: 'The drillhole database holds 412 holes and 38,650 m and passed import validation',
    value: { kind: 'number', value: 412, unit: 'holes' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Structured import, required columns validated',
    verifiedOn: '2026-09-01', expiresOn: '2028-09-01', source: 'Drillhole database', evidence: [{ docId: 'kb-d11', page: 1 }],
  },

  // ---------- Asset A · Technical and infrastructure ----------
  {
    id: 'kb-x1', assetId: 'kiboko', workstream: 'technical', material: true,
    statement: 'The port of Mombasa is 186 km away by paved road',
    value: { kind: 'number', value: 186, unit: 'km' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Route measured on the reference road layer',
    verifiedOn: '2026-09-12', expiresOn: '2027-09-12', source: 'OpenStreetMap road layer', evidence: [{ docId: 'kb-d19', page: 3 }],
  },
  {
    id: 'kb-x2', assetId: 'kiboko', workstream: 'technical', material: true,
    statement: 'A grid power line runs 11 km from the licence boundary',
    value: { kind: 'number', value: 11, unit: 'km' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Reference power-line layer',
    verifiedOn: '2026-09-12', expiresOn: '2027-09-12', source: 'Power network layer', evidence: [{ docId: 'kb-d19', page: 4 }],
  },
  {
    id: 'kb-x3', assetId: 'kiboko', workstream: 'technical', material: false,
    statement: 'Water is available from a seasonal river and two boreholes on the licence',
    status: 'verified', level: 4, methods: [4], verifierId: 'brian', method: 'Site visit with tamper-evident capture',
    verifiedOn: '2026-09-02', expiresOn: '2027-09-02', source: 'Field verification', evidence: [{ docId: 'kb-d17', page: 14 }],
  },
  {
    id: 'kb-x4', assetId: 'kiboko', workstream: 'technical', material: true,
    statement: 'The access road is passable by trucks year-round',
    status: 'disputed', level: 4, methods: [4], verifierId: 'brian', method: 'Site visit with tamper-evident capture',
    verifiedOn: '2026-09-02', source: 'Field verification', evidence: [{ docId: 'kb-d17', page: 9 }, { docId: 'kb-d21', page: 2 }],
    dispute: {
      finding: 'The access road from the C103 is impassable for trucks during the long rains (April–May). Site-visit photos show washouts at two river crossings.',
      reply: 'Two culverts were installed in August 2026 and both crossings are now graded. Photos and the contractor invoice are attached.',
      replyOn: '2026-09-16',
      evidence: 'kb-d21',
    },
  },

  // ---------- Asset A · Environment and social ----------
  {
    id: 'kb-e1', assetId: 'kiboko', workstream: 'esg', material: true,
    statement: 'The environmental licence for exploration drilling (NEMA) is valid until 11 Jan 2027',
    value: { kind: 'date', value: '2027-01-11' },
    status: 'verified', level: 3, methods: [2, 3], verifierId: 'faith', method: 'NEMA register check and ESG desk review',
    verifiedOn: '2026-09-03', expiresOn: '2027-03-03', source: 'NEMA licence register', evidence: [{ docId: 'kb-d15', page: 1 }, { docId: 'kb-d16', page: 5 }],
  },
  {
    id: 'kb-e2', assetId: 'kiboko', workstream: 'esg', material: true,
    statement: 'Artisanal digging covers about 3 ha in the north-east corner; about 40 people; no children seen',
    value: { kind: 'number', value: 3, unit: 'ha' },
    status: 'verified', level: 4, methods: [4], verifierId: 'brian', method: 'Site visit with tamper-evident capture',
    verifiedOn: '2026-09-02', expiresOn: '2027-09-02', source: 'Field verification', evidence: [{ docId: 'kb-d17', page: 18, region: 'Photos 41–47' }],
    flagId: 'kb-f3',
  },
  {
    id: 'kb-e3', assetId: 'kiboko', workstream: 'esg', material: true,
    statement: 'Two village meetings were held; no active community dispute was recorded',
    status: 'verified', level: 4, methods: [4], verifierId: 'faith', method: 'Consented, anonymised community interviews',
    verifiedOn: '2026-09-02', expiresOn: '2027-09-02', source: 'Field verification', evidence: [{ docId: 'kb-d18', page: 1 }],
  },
  {
    id: 'kb-e4', assetId: 'kiboko', workstream: 'esg', material: true,
    statement: 'No protected, heritage or sacred sites lie inside the boundary',
    status: 'verified', level: 4, methods: [2, 4], verifierId: 'faith', method: 'Map overlay and field check',
    verifiedOn: '2026-09-03', expiresOn: '2027-03-03', source: 'Protected Planet; field verification', evidence: [{ docId: 'kb-d16', page: 9 }],
  },

  // ---------- Asset A · Legal, fiscal and market access ----------
  {
    id: 'kb-l1', assetId: 'kiboko', workstream: 'legal', material: true,
    statement: "A transfer or mortgage of the licence needs the Cabinet Secretary's consent (Mining Act s.51)",
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Title opinion',
    verifiedOn: '2026-09-10', expiresOn: '2027-03-10', source: 'Mining Act 2016', evidence: [{ docId: 'kb-d04', page: 9 }],
  },
  {
    id: 'kb-l2', assetId: 'kiboko', workstream: 'legal', material: true,
    statement: 'A 10% free carried interest applies only at the large-scale mining licence stage (s.48(1))',
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Title opinion',
    verifiedOn: '2026-09-10', expiresOn: '2027-03-10', source: 'Mining Act 2016', evidence: [{ docId: 'kb-d04', page: 10 }],
  },
  {
    id: 'kb-l3', assetId: 'kiboko', workstream: 'legal', material: true,
    statement: 'No export restriction on graphite concentrate is currently in force',
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Counsel review of current export rules',
    verifiedOn: '2026-09-08', expiresOn: '2027-03-08', source: 'Kenya pack v1.2', evidence: [{ docId: 'kb-d04', page: 15 }],
  },
  {
    id: 'kb-l4', assetId: 'kiboko', workstream: 'legal', material: true,
    statement: 'The company holds a valid tax compliance certificate',
    status: 'stale', level: 1, methods: [1], verifierId: 'kevin', method: 'Certificate checked on the revenue authority portal',
    verifiedOn: '2025-07-20', expiresOn: '2026-07-20', source: 'Revenue authority portal', evidence: [{ docId: 'kb-d20', page: 1 }],
    staleNote: { lastChecked: '2025-07-20', recheckOn: '2026-10-02' },
  },

  // ---------- Asset B · Nyanza Reef Gold ----------
  {
    id: 'ny-t1', assetId: 'nyanza', workstream: 'title', material: true,
    statement: 'Mining permit MP/2023/0442 is active until 1 May 2028',
    plain: { en: 'Your mining permit is active until 1 May 2028.', sw: 'Kibali chako cha uchimbaji kinatumika hadi 1 Mei 2028.' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated cadastre check',
    verifiedOn: '2026-09-09', expiresOn: '2026-10-09', source: 'Kenya Mining Cadastre Portal', evidence: [{ docId: 'ny-d04', page: 1 }, { docId: 'ny-d01', page: 1 }],
  },
  {
    id: 'ny-t2', assetId: 'nyanza', workstream: 'title', material: true,
    statement: 'Prospecting licence PL/2022/0391 is active until 20 Nov 2027',
    plain: { en: 'Your prospecting licence is active until 20 Nov 2027.', sw: 'Leseni yako ya utafutaji inatumika hadi 20 Nov 2027.' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated cadastre check',
    verifiedOn: '2026-09-09', expiresOn: '2026-10-09', source: 'Kenya Mining Cadastre Portal', evidence: [{ docId: 'ny-d04', page: 1 }, { docId: 'ny-d02', page: 1 }],
  },
  {
    id: 'ny-t3', assetId: 'nyanza', workstream: 'title', material: true,
    statement: 'The boundary drawn by the owner extends about 0.9 km east of the registered boundary',
    plain: {
      en: "The boundary on the Ministry's map is smaller than the one you drew. Please check the corner points or send your survey plan.",
      sw: 'Mpaka kwenye ramani ya Wizara ni mdogo kuliko ule uliouchora. Tafadhali angalia pembe za mpaka au tuma mpango wako wa upimaji.',
    },
    status: 'discrepancy', level: 2, methods: [2], verifierId: 'kevin', method: 'Boundary overlay against the cadastre polygon',
    verifiedOn: '2026-09-12', source: 'Kenya Mining Cadastre Portal', evidence: [{ docId: 'ny-d04', page: 1 }, { docId: 'ny-d05', page: 1 }],
  },
  {
    id: 'ny-t4', assetId: 'nyanza', workstream: 'title', material: true,
    statement: 'Title opinion: licences valid, no encumbrances, consents in place',
    plain: { en: 'Our lawyer is checking your licence with the Ministry.', sw: 'Wakili wetu anakagua leseni yako na Wizara.' },
    status: 'in_review', level: 1, methods: [1], verifierId: 'wanjiru', method: 'Title opinion in progress', source: 'Counsel', evidence: [],
  },
  {
    id: 'ny-o1', assetId: 'nyanza', workstream: 'ownership', material: true,
    statement: 'Peter Ouma is the sole holder of both licences',
    plain: { en: 'You are the only holder of both licences.', sw: 'Wewe ndiye mmiliki pekee wa leseni zote mbili.' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Cadastre and identity check',
    verifiedOn: '2026-09-09', expiresOn: '2026-12-08', source: 'Kenya Mining Cadastre Portal', evidence: [{ docId: 'ny-d06', page: 1 }],
  },
  {
    id: 'ny-i1', assetId: 'nyanza', workstream: 'integrity', material: true,
    statement: 'No sanctions, politically exposed person or adverse-media hits',
    plain: { en: 'Background checks found nothing of concern.', sw: 'Ukaguzi wa historia haukupata jambo lolote la kutia wasiwasi.' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated screening, re-screened daily',
    verifiedOn: '2026-09-24', expiresOn: '2026-09-25', source: 'Screening provider', evidence: [],
  },
  {
    id: 'ny-g1', assetId: 'nyanza', workstream: 'geology', material: true,
    statement: 'Only a historical estimate (2019 grab samples) exists; no current resource',
    plain: {
      en: 'Your 2019 report is useful, but grab samples are a hint, not an estimate. Investors will see that no current resource exists yet.',
      sw: 'Ripoti yako ya 2019 inasaidia, lakini sampuli za mkono ni dalili tu, si makadirio. Wawekezaji wataona kwamba bado hakuna makadirio ya sasa.',
    },
    status: 'in_review', level: 1, methods: [1], verifierId: 'amani', method: 'Geologist desk review', source: 'Consultant report, 2019',
    evidence: [{ docId: 'ny-d03', page: 12, region: 'Assay table' }], flagId: 'ny-f1',
  },
  {
    id: 'ny-e1', assetId: 'nyanza', workstream: 'esg', material: true,
    statement: 'Mercury use was observed at artisanal workings on the permit',
    plain: {
      en: 'Mercury was seen being used by artisanal miners on your permit. This is shown to investors with your reply.',
      sw: 'Zebaki ilionekana ikitumiwa na wachimbaji wadogo kwenye kibali chako. Hili litaonyeshwa kwa wawekezaji pamoja na jibu lako.',
    },
    status: 'in_review', level: 1, methods: [1], verifierId: 'faith', method: 'Photos from the assisted intake visit; site visit on 2 Oct will confirm',
    source: 'Assisted intake visit, 5 Sep 2026', evidence: [], flagId: 'ny-f2',
  },
  {
    id: 'ny-x1', assetId: 'nyanza', workstream: 'technical', material: false,
    statement: 'The nearest paved road is 9 km away; grid power is 6 km away',
    plain: { en: 'The nearest paved road is 9 km away and power is 6 km away.', sw: 'Barabara ya lami iliyo karibu iko umbali wa km 9 na umeme uko km 6.' },
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Reference layers',
    verifiedOn: '2026-09-12', expiresOn: '2027-09-12', source: 'Reference map layers', evidence: [],
  },
  {
    id: 'ny-l1', assetId: 'nyanza', workstream: 'legal', material: true,
    statement: 'Gold sales must go through licensed dealers; no export licence is held',
    plain: { en: 'Your gold must be sold through licensed dealers.', sw: 'Dhahabu yako lazima iuzwe kupitia wafanyabiashara wenye leseni.' },
    status: 'verified', level: 3, methods: [3], verifierId: 'wanjiru', method: 'Counsel review of the Kenya pack',
    verifiedOn: '2026-09-15', expiresOn: '2027-03-15', source: 'Kenya pack v1.2', evidence: [],
  },

  // ---------- Asset C · Mawe Mekundu ----------
  {
    id: 'mw-t1', assetId: 'mawe', workstream: 'title', material: true,
    statement: 'Prospecting licence PL/2025/0206 is active until 9 Jun 2028',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated cadastre check',
    verifiedOn: '2026-09-18', expiresOn: '2026-10-18', source: 'Kenya Mining Cadastre Portal', evidence: [{ docId: 'mw-d02', page: 1 }],
  },
  {
    id: 'mw-t2', assetId: 'mawe', workstream: 'title', material: true,
    statement: 'About 410 ha of the licence overlaps a gazetted forest reserve; no consent is on file',
    value: { kind: 'number', value: 410, unit: 'ha overlap' },
    status: 'discrepancy', level: 2, methods: [2], verifierId: 'kevin', method: 'Overlay: gazetted forest reserve boundary',
    verifiedOn: '2026-09-19', source: 'Kenya Gazette; forest reserve boundary', evidence: [{ docId: 'mw-d03', page: 2, region: 'Schedule of boundaries' }],
    flagId: 'mw-f1',
  },
  {
    id: 'mw-o1', assetId: 'mawe', workstream: 'ownership', material: true,
    statement: "The representative's mandate is confirmed directly with the licence holder",
    status: 'in_review', level: 1, methods: [1], verifierId: 'kevin', method: 'Call scheduled with the holder', source: 'Mandate document', evidence: [{ docId: 'mw-d04', page: 1 }],
  },
  {
    id: 'mw-i1', assetId: 'mawe', workstream: 'integrity', material: true,
    statement: 'No sanctions or politically exposed person hits',
    status: 'verified', level: 2, methods: [2], verifierId: 'kevin', method: 'Automated screening',
    verifiedOn: '2026-09-24', expiresOn: '2026-09-25', source: 'Screening provider', evidence: [],
  },
]

export const claimsFor = (assetId: string) => claims.filter((c) => c.assetId === assetId)
export const claim = (id: string) => claims.find((c) => c.id === id)
