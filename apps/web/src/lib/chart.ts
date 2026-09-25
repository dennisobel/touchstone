import { useEffect, useState } from 'react'

function read(names: string[]) {
  const cs = getComputedStyle(document.documentElement)
  return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]))
}

/** Resolved CSS custom properties for charts; re-reads when the theme class changes. */
export function useCssVars<T extends string>(names: readonly T[]): Record<T, string> {
  const [vals, setVals] = useState(() => read(names as unknown as string[]) as Record<T, string>)
  useEffect(() => {
    const obs = new MutationObserver(() => setVals(read(names as unknown as string[]) as Record<T, string>))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return vals
}

export const CHART_VARS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6', '--chart-7', '--chart-8', '--text-muted', '--border', '--text', '--surface-raised', '--st-critical', '--primary'] as const

export function useChartTheme() {
  const v = useCssVars(CHART_VARS)
  return {
    series: [v['--chart-1'], v['--chart-2'], v['--chart-3'], v['--chart-4'], v['--chart-5'], v['--chart-6'], v['--chart-7'], v['--chart-8']],
    axis: v['--text-muted'],
    grid: v['--border'],
    text: v['--text'],
    tooltipBg: v['--surface-raised'],
    critical: v['--st-critical'],
    primary: v['--primary'],
  }
}
