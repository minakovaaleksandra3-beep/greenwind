import enGB from "@lib/translations/en-GB.json"
import ukUA from "@lib/translations/uk-UA.json"
import deDE from "@lib/translations/de-DE.json"
import frFR from "@lib/translations/fr-FR.json"
import esES from "@lib/translations/es-ES.json"


const translations: Record<string, any> = {
  "en-GB": enGB,
  "uk-UA": ukUA,
  "de-DE": deDE,
  "fr-FR": frFR,
  "es-ES": esES,
}


export function getTranslation(locale: string | null, key: string): string {
  const currentLocale = locale || "en-GB"
  const keys = key.split(".")
 
  let value = translations[currentLocale]
 
  for (const k of keys) {
    value = value?.[k]
  }
 
  return value || key
}

