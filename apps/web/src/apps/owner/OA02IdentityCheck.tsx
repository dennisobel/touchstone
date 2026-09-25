import { Camera, CircleCheck, CircleUserRound, IdCard, RotateCcw, TriangleAlert, UserRoundCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useDemoState } from '@/lib/demo-states'
import { Page } from '@/ds/shell'
import { Button, Stepper, toast } from '@/ds/ui'
import { useT } from './i18n'

const STATES = [
  { id: 'default', label: 'Front of ID' },
  { id: 'captured', label: 'Photo taken' },
  { id: 'blurry', label: 'Blurry photo' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'manual', label: 'Manual review fallback' },
  { id: 'done', label: 'Done' },
] as const

type Shot = 'front' | 'back' | 'selfie'

export default function OA02IdentityCheck() {
  const { t } = useT()
  const navigate = useNavigate()
  const [demo] = useDemoState('OA-02', STATES)
  const [shot, setShot] = useState<Shot>('front')
  const [captured, setCaptured] = useState(false)
  const [blurry, setBlurry] = useState(false)
  const [done, setDone] = useState(false)
  const [manual, setManual] = useState(false)

  useEffect(() => {
    setShot(demo === 'selfie' ? 'selfie' : 'front')
    setCaptured(demo === 'captured' || demo === 'blurry')
    setBlurry(demo === 'blurry')
    setDone(demo === 'done' || demo === 'manual')
    setManual(demo === 'manual')
  }, [demo])

  const order: Shot[] = ['front', 'back', 'selfie']
  const idx = order.indexOf(shot)
  const label = shot === 'front' ? t('id.front') : shot === 'back' ? t('id.back') : t('id.selfie')
  const hint = shot === 'selfie' ? t('id.selfie_hint') : t('id.frame_hint')

  const next = () => {
    setCaptured(false)
    setBlurry(false)
    if (idx < 2) setShot(order[idx + 1])
    else setDone(true)
  }

  if (done) {
    return (
      <Page title={t('id.title')} focus hideHeaderOnDesktop contentClassName="max-w-md">
        <div className="flex flex-col items-center py-10 text-center animate-rise-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-verified-fill text-verified">
            {manual ? <UserRoundCheck className="size-8" /> : <CircleCheck className="size-8" />}
          </span>
          <h1 className="mt-5 text-h1 font-semibold">{t('id.done_title')}</h1>
          <p className="mt-2 max-w-sm text-body text-muted">{manual ? t('id.manual_review') : t('id.done_body')}</p>
          <Button size="xl" block className="mt-8" onClick={() => navigate('/owner/assets/new', { viewTransition: true })}>
            {t('id.add_licence')}
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page title={t('id.title')} focus back="/owner/welcome" hideHeaderOnDesktop contentClassName="max-w-md">
      <div className="space-y-4">
        <div>
          <h1 className="text-h1 font-semibold">{t('id.title')}</h1>
          <p className="mt-1 text-body text-muted">{t('id.why')}</p>
        </div>
        <Stepper steps={[t('id.front'), t('id.back'), t('id.selfie')]} current={idx} />

        <div className="relative overflow-hidden rounded-xl bg-[#0b0f13]" style={{ aspectRatio: '3 / 4' }}>
          {!captured ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#3a4654_0%,#1a2129_60%,#0b0f13_100%)]" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                {shot === 'selfie' ? (
                  <div className="aspect-[3/4] w-3/5 rounded-[50%] border-[3px] border-dashed border-white/80" />
                ) : (
                  <div className="aspect-[1.586] w-full rounded-xl border-[3px] border-dashed border-white/80" />
                )}
              </div>
              <p className="absolute inset-x-4 top-4 rounded-full bg-black/55 px-3 py-2 text-center text-meta text-white">{hint}</p>
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
                <button
                  type="button"
                  aria-label={t('id.take')}
                  onClick={() => {
                    setCaptured(true)
                    setBlurry(false)
                  }}
                  className="pressable flex size-18 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white"
                >
                  <Camera className="size-7" aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a2129] p-8">
              {shot === 'selfie' ? (
                <div className={cn('flex aspect-[3/4] w-3/5 items-center justify-center rounded-[50%] bg-[#52606f]', blurry && 'blur-[3px]')}>
                  <CircleUserRound className="size-24 text-[#b4bec8]" aria-hidden />
                </div>
              ) : (
                <div className={cn('aspect-[1.586] w-full rounded-xl bg-[#e9edf1] p-4', blurry && 'blur-[3px]')}>
                  <div className="flex gap-3">
                    <div className="h-20 w-16 rounded-sm bg-[#b4bec8]" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-2.5 w-3/4 rounded bg-[#7d8a98]" />
                      <div className="h-2 w-1/2 rounded bg-[#b4bec8]" />
                      <div className="h-2 w-2/3 rounded bg-[#b4bec8]" />
                      <div className="h-2 w-1/3 rounded bg-[#b4bec8]" />
                    </div>
                  </div>
                  <IdCard className="mt-2 size-5 text-[#7d8a98]" aria-hidden />
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-body font-medium">{label}</p>

        {blurry && (
          <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-review-border bg-review-fill p-3 text-meta text-fg">
            <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-review" aria-hidden />
            {t('id.blurry')}
          </div>
        )}

        {captured && (
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" variant="secondary" icon={<RotateCcw />} onClick={() => setCaptured(false)}>
              {t('id.retake')}
            </Button>
            <Button size="lg" onClick={next} disabled={blurry}>
              {t('id.use')}
            </Button>
          </div>
        )}

        <div className="rounded-lg border border-line bg-surface p-4 text-meta">
          <p className="text-muted">{t('id.manual')}</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => {
              setManual(true)
              setDone(true)
              toast('Kevin Omondi will call you to arrange a check (demo)')
            }}
          >
            {t('id.manual_cta')}
          </Button>
        </div>
      </div>
    </Page>
  )
}
