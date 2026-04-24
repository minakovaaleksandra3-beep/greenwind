

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type Locale = {
  code: string
  name: string
}

export const locales: Locale[] = [
  { code: "en-GB", name: "English" },
  { code: "uk-UA", name: "Українська" },
  { code: "de-DE", name: "Deutsch" },
  { code: "fr-FR", name: "Français" },
  { code: "es-ES", name: "Español" },
]

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  const next = {
    ...(await getCacheOptions("locales")),
  }

  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ locales }) => locales)
    .catch(() => null)
}
