import type { ComponentType } from 'react'

/** Lazy route helper: each screen is its own chunk, default-exported. */
export const screen = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })

/** Lazy route helper for a named export (several small tabs sharing one module). */
export const named =
  <M extends Record<string, unknown>>(load: () => Promise<M>, key: keyof M & string) =>
  async () => ({ Component: (await load())[key] as ComponentType })
