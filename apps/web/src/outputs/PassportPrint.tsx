import { ArrowLeft, Printer } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { fmtDate, NOW } from '@/lib/format'
import { useDocumentTitle } from '@/lib/hooks'
import { useDemo } from '@/lib/store'
import {
  asset as getAsset,
  CLAIM_STATUS_LABEL,
  claimsFor,
  EVIDENCE_LEVELS,
  fakeHash,
  flagsFor,
  investor,
  person,
  SEVERITY_LABEL,
  TIER_BADGE,
  WORKSTREAMS,
  type Asset,
  type LngLat,
} from '@/data'
import { assetFlagCounts, workstreamProgress } from '@/ds/components'
import { Logo, SeverityShape, StampIcon } from '@/ds/icons'
import { Segmented } from '@/ds/ui'

type Paper = 'a4' | 'letter'
const SIZES: Record<Paper, { w: string; h: string; css: string }> = {
  a4: { w: '210mm', h: '297mm', css: 'A4 portrait' },
  letter: { w: '215.9mm', h: '279.4mm', css: 'letter portrait' },
}

/** X-01 · Mine Passport PDF: print design, 8–12 pages; save as PDF from the browser's print dialog. */
export default function PassportPrint() {
  const { id = 'kiboko' } = useParams()
  const a = getAsset(id)
  const [params, setParams] = useSearchParams()
  const level = (params.get('level') === 'teaser' ? 'teaser' : 'full') as 'teaser' | 'full'
  const paper = (params.get('paper') === 'letter' ? 'letter' : 'a4') as Paper
  const persona = useDemo((s) => s.investorPersona)
  const reader = person(persona)
  const readerOrg = investor(persona === 'marcus' ? 'cedar-peak' : 'brightwater').name
  const title = level === 'teaser' ? a.code : a.name
  useDocumentTitle(`${title} passport v${a.passport.version ?? 1}`)
  const size = SIZES[paper]
  const code = useMemo(() => `TS-${a.code}-V${a.passport.version ?? 1}-${fakeHash(a.id + reader.name).slice(0, 4).toUpperCase()}-${fakeHash(reader.name).slice(0, 4).toUpperCase()}`, [a, reader])

  const pages: { key: string; node: ReactNode }[] = [{ key: 'cover', node: <Cover a={a} level={level} /> }]
  if (level === 'full') {
    pages.push({ key: 'flags', node: <FlagsPage a={a} /> })
    const ws = WORKSTREAMS
    // Two workstreams per page keeps each section readable.
    for (let i = 0; i < ws.length; i += 2) pages.push({ key: `ws${i}`, node: <WorkstreamPage a={a} ids={ws.slice(i, i + 2).map((w) => w.id)} withMap={i === 0} /> })
  }
  pages.push({ key: 'method', node: <MethodPage a={a} code={code} level={level} /> })
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params)
    n.set(k, v)
    setParams(n, { replace: true })
  }

  return (
    <div className="min-h-dvh bg-sunken print:bg-white">
      <style>{`@page { size: ${size.css}; margin: 0 } @media print { .sheet { box-shadow: none !important; margin: 0 !important; } }`}</style>
      <div className="no-print glass sticky top-0 z-20 border-b border-line pt-safe">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <button type="button" className="rounded-full p-2 hover:bg-surface" aria-label="Back" onClick={() => (history.length > 1 ? history.back() : (window.location.href = '/apps'))}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-meta font-semibold">Mine Passport PDF</p>
            <p className="text-micro text-muted">
              {pages.length} pages · prepared for {reader.name}
            </p>
          </div>
          <Segmented ariaLabel="Level" size="sm" value={level} onChange={(v) => set('level', v)} options={[{ value: 'teaser', label: 'Teaser' }, { value: 'full', label: 'Full' }]} />
          <Segmented ariaLabel="Paper" size="sm" value={paper} onChange={(v) => set('paper', v)} options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'US Letter' }]} />
          <button type="button" onClick={() => window.print()} className="pressable inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-meta font-medium text-on-primary">
            <Printer className="size-4" aria-hidden /> Print or save as PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto py-6 print:overflow-visible print:py-0">
        {pages.map((p, i) => (
          <article
            key={p.key}
            className="sheet relative mx-auto mb-6 flex flex-col bg-white text-[#0f1419] shadow-e3 print:mb-0"
            style={{ width: size.w, height: size.h, padding: '16mm 16mm 18mm', breakAfter: 'page', fontSize: '9.5pt', lineHeight: 1.45 }}
            aria-label={`Page ${i + 1} of ${pages.length}`}
          >
            {/* Running header */}
            <header className="mb-5 flex items-center justify-between border-b border-[#d5dce2] pb-2 text-[8pt] text-[#52606f]">
              <span className="flex items-center gap-2">
                <Logo size={14} /> Touchstone Mine Passport · {title}
              </span>
              <span>
                v{a.passport.version ?? 1} · released {a.passport.releasedOn ? fmtDate(a.passport.releasedOn) : 'draft'} · as of {fmtDate(NOW)}
              </span>
            </header>
            <div className="min-h-0 flex-1">{p.node}</div>
            {/* Footer watermark and page numbers */}
            <footer className="mt-4 flex items-center justify-between border-t border-[#d5dce2] pt-2 text-[7.5pt] text-[#52606f]">
              <span>
                Prepared for {reader.name}, {readerOrg}, {fmtDate(NOW)} · {code}
              </span>
              <span>
                Page {i + 1} of {pages.length}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}

function StatusText({ s }: { s: keyof typeof CLAIM_STATUS_LABEL }) {
  const color = { verified: '#1e6b4a', in_review: '#8a5a00', discrepancy: '#a3242f', disputed: '#6b3fa0', stale: '#52606f', unverifiable: '#3a4654', declared: '#3a4654' }[s]
  return (
    <span style={{ color, fontWeight: 600 }}>
      {s === 'verified' ? '✓ ' : s === 'discrepancy' ? '⬣ ' : s === 'in_review' ? '⧗ ' : s === 'disputed' ? '⇄ ' : s === 'stale' ? '◷ ' : '○ '}
      {CLAIM_STATUS_LABEL[s]}
    </span>
  )
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 font-serif text-[14pt] font-semibold">{children}</h2>
}

function Cover({ a, level }: { a: Asset; level: 'teaser' | 'full' }) {
  const counts = assetFlagCounts(a.id)
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[8pt] font-semibold uppercase tracking-[0.18em] text-[#b4532a]">Mine Passport</p>
          <h1 className="mt-2 font-serif text-[26pt] font-semibold leading-tight">{level === 'teaser' ? a.code : a.name}</h1>
          <p className="mt-1 text-[10pt] text-[#52606f]">
            {a.commodity} · {level === 'teaser' ? `${a.region}, ${a.country}` : `${a.county}, ${a.country}`} · {a.stage}
          </p>
          {level === 'full' && <p className="mt-1 font-mono text-[8.5pt] text-[#52606f]">{a.code} · {a.licence.number}</p>}
        </div>
        <div className="flex size-[30mm] shrink-0 flex-col items-center justify-center rounded-full border-[1.5mm] border-[#1f4e8c] text-center text-[#1f4e8c]">
          <StampIcon className="size-6" />
          <span className="mt-1 text-[8pt] font-bold uppercase leading-tight tracking-wide">{TIER_BADGE[a.tier]}</span>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-4 gap-3 rounded-[2mm] bg-[#f5f7f9] p-3 text-[8.5pt]">
        <div>
          <dt className="text-[#52606f]">Version</dt>
          <dd className="font-semibold">v{a.passport.version ?? 1}</dd>
        </div>
        <div>
          <dt className="text-[#52606f]">Released</dt>
          <dd className="font-semibold">{a.passport.releasedOn ? fmtDate(a.passport.releasedOn) : 'Draft'}</dd>
        </div>
        <div>
          <dt className="text-[#52606f]">As of</dt>
          <dd className="font-semibold">{fmtDate(NOW)}</dd>
        </div>
        <div>
          <dt className="text-[#52606f]">Material claims fresh</dt>
          <dd className="font-semibold">
            {a.fresh.fresh} of {a.fresh.total}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <H>Verification by workstream</H>
        <table className="w-full border-collapse text-[9pt]">
          <thead>
            <tr className="border-b border-[#7d8a98] text-left text-[8pt] text-[#52606f]">
              <th className="py-1 font-medium">Workstream</th>
              <th className="font-medium">Status</th>
              <th className="font-medium">Material claims proven (E2+)</th>
            </tr>
          </thead>
          <tbody>
            {WORKSTREAMS.map((w) => {
              const p = workstreamProgress(a, w.id)
              return (
                <tr key={w.id} className="border-b border-[#e3e8ec]">
                  <td className="py-1.5">{w.name}</td>
                  <td>
                    <StatusText s={a.workstreamStatus[w.id]} />
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-[1.6mm] w-[28mm] overflow-hidden rounded-full bg-[#e3e8ec]">
                        <span className="block h-full rounded-full bg-[#1f4e8c]" style={{ width: `${p.pct}%` }} />
                      </span>
                      {p.proven} of {p.total}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center gap-5 text-[9pt]">
        <span className="font-semibold">Red flags:</span>
        {(['critical', 'high', 'medium', 'low'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1">
            <SeverityShape severity={s} size={11} /> {counts[s]} {SEVERITY_LABEL[s]}
          </span>
        ))}
      </div>

      {level === 'teaser' && (
        <div className="mt-5 grid grid-cols-2 gap-3 text-[9pt]">
          <div className="rounded-[2mm] border border-[#d5dce2] p-3">
            <p className="text-[#52606f]">Capital sought</p>
            <p className="font-semibold">{a.capitalSought}</p>
          </div>
          <div className="rounded-[2mm] border border-[#d5dce2] p-3">
            <p className="text-[#52606f]">Preferred structure</p>
            <p className="font-semibold">{a.structure}</p>
          </div>
        </div>
      )}

      <div className="mt-auto rounded-[2mm] border-l-[1.2mm] border-[#1f4e8c] bg-[#e3ecf7] p-4">
        <p className="text-[8pt] font-semibold uppercase tracking-wide text-[#1f4e8c]">In plain English</p>
        <p className="mt-1 text-[10pt]">
          {a.id === 'kiboko'
            ? 'The licence is active until March 2027 and the company and its owners are known and clean of sanctions. There is an early, low-confidence estimate of about 12 million tonnes of rock containing about 8% graphite; an independent geologist is checking it. The main issues are the licence expiry without a renewal filed, gaps in quality-control samples, and artisanal digging in one corner.'
            : 'Summary of verified facts and open issues for this asset. See the red-flag register and each workstream for the evidence.'}
        </p>
        <p className="mt-2 text-[7.5pt] text-[#52606f]">Drafted by AI, approved by Kevin Omondi, 18 Sep 2026.</p>
      </div>
    </div>
  )
}

function FlagsPage({ a }: { a: Asset }) {
  const list = flagsFor(a.id).filter((f) => f.status !== 'resolved')
  return (
    <div>
      <H>Red-flag register</H>
      <p className="mb-4 text-[8.5pt] text-[#52606f]">Critical flags block release and can only be resolved. High flags appear at the top of the passport.</p>
      <div className="space-y-3">
        {list.map((f) => (
          <section key={f.id} className="break-inside-avoid rounded-[2mm] border border-[#d5dce2] p-3" style={{ borderLeft: `1.2mm solid ${f.severity === 'medium' ? '#9a6700' : f.severity === 'low' ? '#52606f' : '#a3242f'}` }}>
            <p className="flex items-center gap-2 text-[8pt] font-semibold uppercase tracking-wide">
              <SeverityShape severity={f.severity} size={11} /> {SEVERITY_LABEL[f.severity]} · {f.status} · {WORKSTREAMS.find((w) => w.id === f.workstream)?.name}
            </p>
            <h3 className="mt-1 text-[11pt] font-semibold">{f.title}</h3>
            <p className="mt-1">{f.description}</p>
            {f.mitigation && (
              <p className="mt-1.5">
                <span className="font-semibold">Mitigation: </span>
                {f.mitigation}
              </p>
            )}
            <p className="mt-1.5 text-[8pt] text-[#52606f]">
              Raised {fmtDate(f.raisedOn)} · updated {fmtDate(f.updatedOn)} · {person(f.ownerId).name}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

function StaticMap({ a }: { a: Asset }) {
  const pts = [...a.registered, ...a.claimed]
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const pad = 0.15
  const w = 170
  const h = 70
  const sx = (x: number) => ((x - minX) / (maxX - minX || 1)) * (w * (1 - 2 * pad)) + w * pad
  const sy = (y: number) => h - (((y - minY) / (maxY - minY || 1)) * (h * (1 - 2 * pad)) + h * pad)
  const path = (ring: LngLat[]) => ring.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ') + 'Z'
  return (
    <figure className="break-inside-avoid">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-[2mm] border border-[#d5dce2] bg-[#eef1ea]" role="img" aria-label={`Map snapshot of ${a.name}: registered boundary solid, owner's boundary dashed`}>
        <path d={path(a.registered)} fill="rgba(31,78,140,0.1)" stroke="#1f4e8c" strokeWidth="0.8" />
        <path d={path(a.claimed)} fill="none" stroke="#b4532a" strokeWidth="0.6" strokeDasharray="2 1.2" />
        {a.id === 'kiboko' && <circle cx={sx(38.4485)} cy={sy(-3.4565)} r="2.4" fill="rgba(154,103,0,0.45)" stroke="#9a6700" strokeWidth="0.4" />}
      </svg>
      <figcaption className="mt-1 text-[7.5pt] text-[#52606f]">
        Map snapshot, {fmtDate('2026-09-14')} imagery (simulated). Solid: registered boundary (Ministry). Dashed: boundary drawn by the owner. Ochre: artisanal workings.
      </figcaption>
    </figure>
  )
}

function WorkstreamPage({ a, ids, withMap }: { a: Asset; ids: string[]; withMap: boolean }) {
  return (
    <div className="space-y-5">
      {ids.map((wid) => {
        const w = WORKSTREAMS.find((x) => x.id === wid)!
        const claims = claimsFor(a.id).filter((c) => c.workstream === wid)
        const p = workstreamProgress(a, w.id)
        return (
          <section key={wid} className="break-inside-avoid">
            <div className="flex items-baseline justify-between gap-3">
              <H>{w.name}</H>
              <span className="text-[8.5pt] text-[#52606f]">
                <StatusText s={a.workstreamStatus[w.id]} /> · {p.proven} of {p.total} material claims proven
              </span>
            </div>
            {withMap && wid === 'title' && <StaticMap a={a} />}
            <table className="mt-2 w-full border-collapse text-[8pt]">
              <thead>
                <tr className="border-b border-[#7d8a98] text-left text-[7.5pt] text-[#52606f]">
                  <th className="w-[40%] py-1 pr-2 font-medium">Claim</th>
                  <th className="pr-2 font-medium">Status</th>
                  <th className="pr-2 font-medium">Level</th>
                  <th className="pr-2 font-medium">Verifier</th>
                  <th className="pr-2 font-medium">Verified</th>
                  <th className="font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-2 text-[#52606f]">
                      Claims summarised in the online passport.
                    </td>
                  </tr>
                )}
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-[#e3e8ec] align-top">
                    <td className="py-1.5 pr-2">{c.statement}</td>
                    <td className="pr-2">
                      <StatusText s={c.status} />
                    </td>
                    <td className="pr-2 font-mono">{EVIDENCE_LEVELS[c.level].code}</td>
                    <td className="pr-2">{c.verifierId ? person(c.verifierId).name : '—'}</td>
                    <td className="pr-2">{c.verifiedOn ? fmtDate(c.verifiedOn) : '—'}</td>
                    <td>{c.staleNote ? `Re-check ${fmtDate(c.staleNote.recheckOn)}` : c.expiresOn ? fmtDate(c.expiresOn) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      })}
    </div>
  )
}

function MethodPage({ a, code, level }: { a: Asset; code: string; level: 'teaser' | 'full' }) {
  return (
    <div className="flex h-full flex-col gap-5">
      <section>
        <H>Methodology in brief</H>
        <p>Every fact is a claim with a source, an evidence level, a named verifier, a date and an expiry. The passport reports how well facts are proven, never how good the investment is.</p>
        <table className="mt-2 w-full border-collapse text-[8.5pt]">
          <tbody>
            {EVIDENCE_LEVELS.map((e) => (
              <tr key={e.code} className="border-b border-[#e3e8ec]">
                <td className="w-12 py-1 font-mono font-semibold">{e.code}</td>
                <td className="w-32 font-semibold">{e.name}</td>
                <td>{e.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[8.5pt]">
          Tiers: Desk screen (about 10 working days), Standard (about 30 days, adds counsel title opinion, ownership mapping, ESG and geology desk reviews and a one-day site visit), Investor-ready (8–10 weeks, adds Qualified Person review, field ESG assessment and an organised data room). Freshness windows range from daily (sanctions) to 12 months (site visits); stale claims are marked and re-checked.
        </p>
      </section>
      <section>
        <H>Who paid for verification</H>
        <p>{a.paidBy === 'owner' ? 'The owner paid a fixed fee, set before verification and independent of the result.' : 'An investor commissioned verification for a fixed fee.'} Verifiers are paid by SSD, never by the party they verify.</p>
      </section>
      <section>
        <H>Disclaimers</H>
        <ul className="list-disc space-y-1 pl-5 text-[8.5pt]">
          <li>Not investment advice. SSD does not rate, value or recommend investments, negotiate terms or handle investor funds.</li>
          <li>Scope and limits: verification covers the claims listed, as of the dates shown, using the sources cited. Facts can change after those dates.</li>
          <li>Reliance: expert opinions may be relied on by SSD and by qualified investors who signed an NDA for this asset, under the engagement terms approved by counsel.</li>
          {level === 'teaser' && <li>This teaser is confidential and was sent only to an investor SSD has qualified.</li>}
        </ul>
      </section>
      <section className="mt-auto flex items-center gap-4 rounded-[2mm] border border-[#d5dce2] p-3">
        <div className="grid size-[22mm] shrink-0 grid-cols-6 gap-[0.6mm] rounded-[1mm] bg-white p-[1.5mm]" aria-hidden>
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className="rounded-[0.3mm]" style={{ background: parseInt(code.charCodeAt(i % code.length).toString(), 10) % 3 ? '#0f1419' : 'transparent' }} />
          ))}
        </div>
        <div className="text-[8.5pt]">
          <p className="font-semibold">Check this PDF is authentic</p>
          <p>
            Verification code <span className="font-mono font-semibold">{code}</span>. Enter it at touchstone.example/verify or scan the code. It confirms the version, the recipient and that no page has changed.
          </p>
        </div>
      </section>
    </div>
  )
}
