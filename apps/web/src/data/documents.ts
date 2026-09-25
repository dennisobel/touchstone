import { fakeHash } from './hash'
import type { DocumentItem } from './types'

type Seed = Omit<DocumentItem, 'sha256' | 'version' | 'download'> & { version?: number; download?: boolean }

const d = (s: Seed): DocumentItem => ({ version: 1, download: true, ...s, sha256: fakeHash(s.id + s.name) })

export const documents: DocumentItem[] = [
  // Kiboko Ridge Graphite (Asset A) — the deal room holds 86 documents; these are the ones the screens cite.
  d({ id: 'kb-d01', assetId: 'kiboko', name: 'Prospecting licence PL-2024-0117.pdf', type: 'Licence certificate', folder: 'Title', pages: 3, sizeBytes: 412_000, uploadedOn: '2026-07-28', uploadedBy: 'grace', level: 'L3', linkedClaims: 3 }),
  d({ id: 'kb-d02', assetId: 'kiboko', name: 'Cadastre capture, 10 Sep 2026.pdf', type: 'Portal capture', folder: 'Title', pages: 1, sizeBytes: 188_000, uploadedOn: '2026-09-10', uploadedBy: 'kevin', level: 'L3', linkedClaims: 2 }),
  d({ id: 'kb-d03', assetId: 'kiboko', name: 'Certified search, Mining Cadastre, 8 Sep 2026.pdf', type: 'Certified search', folder: 'Title', pages: 4, sizeBytes: 640_000, uploadedOn: '2026-09-08', uploadedBy: 'wanjiru', level: 'L3', linkedClaims: 2 }),
  d({ id: 'kb-d04', assetId: 'kiboko', name: 'Title opinion, W. Kamau, 10 Sep 2026.pdf', type: 'Title opinion', folder: 'Legal and fiscal', pages: 18, sizeBytes: 1_320_000, uploadedOn: '2026-09-10', uploadedBy: 'wanjiru', level: 'L3', linkedClaims: 6 }),
  d({ id: 'kb-d05', assetId: 'kiboko', name: 'Survey plan and beacon schedule.pdf', type: 'Survey plan', folder: 'Title', pages: 2, sizeBytes: 2_100_000, uploadedOn: '2026-07-28', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d06', assetId: 'kiboko', name: 'Certificate of incorporation, Kiboko Minerals Ltd.pdf', type: 'Company certificate', folder: 'Corporate', pages: 1, sizeBytes: 220_000, uploadedOn: '2026-07-28', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d07', assetId: 'kiboko', name: 'CR12 official search, 5 Sep 2026.pdf', type: 'Registry extract', folder: 'Corporate', pages: 3, sizeBytes: 310_000, uploadedOn: '2026-09-05', uploadedBy: 'kevin', level: 'L3', linkedClaims: 3 }),
  d({ id: 'kb-d08', assetId: 'kiboko', name: 'Beneficial ownership register extract.pdf', type: 'Registry extract', folder: 'Corporate', pages: 2, sizeBytes: 190_000, uploadedOn: '2026-09-05', uploadedBy: 'kevin', level: 'L3', linkedClaims: 2 }),
  d({ id: 'kb-d10', assetId: 'kiboko', name: 'JORC Mineral Resource Report, June 2025.pdf', type: 'Resource report', folder: 'Geology', pages: 112, sizeBytes: 18_400_000, uploadedOn: '2026-07-29', uploadedBy: 'grace', level: 'L3', linkedClaims: 5 }),
  d({ id: 'kb-d11', assetId: 'kiboko', name: 'Drillhole database, 412 holes.xlsx', type: 'Drillhole database', folder: 'Geology', pages: 6, sizeBytes: 9_800_000, uploadedOn: '2026-07-29', uploadedBy: 'grace', level: 'L3', linkedClaims: 3 }),
  d({ id: 'kb-d12', assetId: 'kiboko', name: 'Assay certificates, 38 batches.pdf', type: 'Assay certificates', folder: 'Geology', pages: 76, sizeBytes: 14_200_000, uploadedOn: '2026-07-29', uploadedBy: 'grace', level: 'L3', linkedClaims: 2 }),
  d({ id: 'kb-d13', assetId: 'kiboko', name: 'QA/QC summary 2025.pdf', type: 'QA/QC report', folder: 'Geology', pages: 22, sizeBytes: 2_600_000, uploadedOn: '2026-09-22', uploadedBy: 'grace', level: 'L3', linkedClaims: 1, version: 2 }),
  d({ id: 'kb-d14', assetId: 'kiboko', name: 'Metallurgical test work, flake size distribution.pdf', type: 'Test work', folder: 'Geology', pages: 14, sizeBytes: 3_100_000, uploadedOn: '2026-08-02', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d15', assetId: 'kiboko', name: 'Environmental licence NEMA-EIA-2025-114.pdf', type: 'Environmental licence', folder: 'ESG', pages: 6, sizeBytes: 540_000, uploadedOn: '2026-07-28', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d16', assetId: 'kiboko', name: 'ESG desk review, F. Njeri, 3 Sep 2026.pdf', type: 'ESG review', folder: 'ESG', pages: 24, sizeBytes: 2_900_000, uploadedOn: '2026-09-03', uploadedBy: 'faith', level: 'L3', linkedClaims: 4 }),
  d({ id: 'kb-d17', assetId: 'kiboko', name: 'Site visit report, B. Kiptoo, 2 Sep 2026.pdf', type: 'Site visit report', folder: 'Technical', pages: 31, sizeBytes: 22_000_000, uploadedOn: '2026-09-04', uploadedBy: 'brian', level: 'L3', linkedClaims: 6 }),
  d({ id: 'kb-d18', assetId: 'kiboko', name: 'Community meeting notes (anonymised).pdf', type: 'Community input', folder: 'ESG', pages: 5, sizeBytes: 380_000, uploadedOn: '2026-09-04', uploadedBy: 'faith', level: 'L3', linkedClaims: 1, download: false }),
  d({ id: 'kb-d19', assetId: 'kiboko', name: 'Infrastructure and access review.pdf', type: 'Technical review', folder: 'Technical', pages: 9, sizeBytes: 1_700_000, uploadedOn: '2026-09-06', uploadedBy: 'kevin', level: 'L3', linkedClaims: 3 }),
  d({ id: 'kb-d20', assetId: 'kiboko', name: 'Tax compliance certificate 2025.pdf', type: 'Tax certificate', folder: 'Legal and fiscal', pages: 1, sizeBytes: 150_000, uploadedOn: '2025-07-14', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d21', assetId: 'kiboko', name: 'Owner reply: culvert works, Aug 2026.pdf', type: 'Owner reply', folder: 'Technical', pages: 6, sizeBytes: 4_300_000, uploadedOn: '2026-09-16', uploadedBy: 'grace', level: 'L3', linkedClaims: 1 }),
  d({ id: 'kb-d22', assetId: 'kiboko', name: 'Engagement letter and fee schedule.pdf', type: 'Engagement letter', folder: 'Legal and fiscal', pages: 5, sizeBytes: 260_000, uploadedOn: '2026-07-28', uploadedBy: 'kevin', level: 'L3', linkedClaims: 0 }),

  // Nyanza Reef Gold (Asset B)
  d({ id: 'ny-d01', assetId: 'nyanza', name: 'Mining permit MP-2023-0442.jpg', type: 'Licence certificate', folder: 'Title', pages: 1, sizeBytes: 1_900_000, uploadedOn: '2026-09-02', uploadedBy: 'peter', level: 'L3', linkedClaims: 2 }),
  d({ id: 'ny-d02', assetId: 'nyanza', name: 'Prospecting licence PL-2022-0391.jpg', type: 'Licence certificate', folder: 'Title', pages: 1, sizeBytes: 2_200_000, uploadedOn: '2026-09-02', uploadedBy: 'peter', level: 'L3', linkedClaims: 1 }),
  d({ id: 'ny-d03', assetId: 'nyanza', name: 'Consultant report with grab-sample assays, 2019.pdf', type: 'Historical report', folder: 'Geology', pages: 26, sizeBytes: 5_400_000, uploadedOn: '2026-09-02', uploadedBy: 'peter', level: 'L3', linkedClaims: 2 }),
  d({ id: 'ny-d04', assetId: 'nyanza', name: 'Cadastre capture, 9 Sep 2026.pdf', type: 'Portal capture', folder: 'Title', pages: 1, sizeBytes: 170_000, uploadedOn: '2026-09-09', uploadedBy: 'kevin', level: 'L3', linkedClaims: 2 }),
  d({ id: 'ny-d05', assetId: 'nyanza', name: 'Boundary drawn by owner (app).geojson', type: 'Owner boundary', folder: 'Title', pages: 1, sizeBytes: 4_000, uploadedOn: '2026-09-02', uploadedBy: 'peter', level: 'L3', linkedClaims: 1 }),
  d({ id: 'ny-d06', assetId: 'nyanza', name: 'National ID, Peter Ouma.jpg', type: 'Identity document', folder: 'Corporate', pages: 1, sizeBytes: 980_000, uploadedOn: '2026-09-01', uploadedBy: 'peter', level: 'L4', linkedClaims: 1, download: false }),

  // Mawe Mekundu (Asset C)
  d({ id: 'mw-d01', assetId: 'mawe', name: 'Prospecting licence PL-2025-0206.pdf', type: 'Licence certificate', folder: 'Title', pages: 2, sizeBytes: 380_000, uploadedOn: '2026-09-15', uploadedBy: 'ali', level: 'L3', linkedClaims: 2 }),
  d({ id: 'mw-d02', assetId: 'mawe', name: 'Cadastre capture, 18 Sep 2026.pdf', type: 'Portal capture', folder: 'Title', pages: 1, sizeBytes: 175_000, uploadedOn: '2026-09-18', uploadedBy: 'kevin', level: 'L3', linkedClaims: 2 }),
  d({ id: 'mw-d03', assetId: 'mawe', name: 'Forest reserve boundary, gazette notice extract.pdf', type: 'Gazette notice', folder: 'Legal and fiscal', pages: 3, sizeBytes: 560_000, uploadedOn: '2026-09-19', uploadedBy: 'kevin', level: 'L3', linkedClaims: 1 }),
  d({ id: 'mw-d04', assetId: 'mawe', name: 'Mandate, Mawe Mekundu Resources to Ali Juma.pdf', type: 'Representative mandate', folder: 'Corporate', pages: 2, sizeBytes: 210_000, uploadedOn: '2026-09-15', uploadedBy: 'ali', level: 'L4', linkedClaims: 0 }),
]

export const docsFor = (assetId: string) => documents.filter((x) => x.assetId === assetId)
export const doc = (id: string) => documents.find((x) => x.id === id)
