"use client"


import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import ReactCountryFlag from "react-country-flag"


import { StateType } from "@lib/hooks/use-toggle-state"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"


type LanguageOption = {
  code: string
  name: string
  localizedName: string
  countryCode: string
}


const getCountryCodeFromLocale = (localeCode: string): string => {
  try {
    const locale = new Intl.Locale(localeCode)
    if (locale.region) {
      return locale.region.toUpperCase()
    }
    const maximized = locale.maximize()
    return maximized.region?.toUpperCase() ?? localeCode.toUpperCase()
  } catch {
    const parts = localeCode.split(/[-_]/)
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase()
  }
}


type LanguageSelectProps = {
  toggleState: StateType
  locales: Locale[]
  currentLocale: string | null
}


const getLocalizedLanguageName = (
  code: string,
  fallbackName: string,
  displayLocale: string = "en-US"
): string => {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], {
      type: "language",
    })
    return displayNames.of(code) ?? fallbackName
  } catch {
    return fallbackName
  }
}


const DEFAULT_OPTION: LanguageOption = {
  code: "en-GB",
  name: "English",
  localizedName: "English",
  countryCode: "GB",
}


const LanguageSelect = ({
  toggleState,
  locales,
  currentLocale,
}: LanguageSelectProps) => {
  const [current, setCurrent] = useState<LanguageOption>(DEFAULT_OPTION)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()


  const { state, close, toggle } = toggleState


  const options = useMemo(() => {
    const localeOptions = locales.map((locale) => ({
      code: locale.code,
      name: locale.name,
      localizedName: getLocalizedLanguageName(
        locale.code,
        locale.name,
        currentLocale ?? "en-US"
      ),
      countryCode: getCountryCodeFromLocale(locale.code),
    }))
    return localeOptions
  }, [locales, currentLocale])


  useEffect(() => {
    if (currentLocale) {
      const option = options.find(
        (o) => o.code.toLowerCase() === currentLocale.toLowerCase()
      )
      setCurrent(option ?? DEFAULT_OPTION)
    } else {
      setCurrent(DEFAULT_OPTION)
    }
  }, [options, currentLocale])


  const handleChange = (option: LanguageOption) => {
    startTransition(async () => {
      await updateLocale(option.code)
      close()
      router.refresh()
    })
  }


  return (
    <div className="relative">
      {/* Кнопка - завжди видима */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-white hover:text-teal-100 transition cursor-pointer"
      >
        <span className="font-medium text-lg">
          {isPending ? "..." : current.countryCode}
        </span>
        <img
          src="/icons/icon-globe.svg"
          alt="Globe"
          className="w-6 h-6"
        />
      </button>


      {/* Випадаючий список */}
      {state && (
        <Listbox value={current} onChange={handleChange}>
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              static
              className="absolute right-0 top-full mt-2 w-[250px] max-h-[300px] overflow-y-auto z-[900] bg-white drop-shadow-lg rounded-lg"
            >
              {options.map((o) => (
                <ListboxOption
                  key={o.code}
                  value={o}
                  className="py-3 px-4 hover:bg-teal-50 cursor-pointer flex items-center gap-x-3 transition"
                >
                  {o.countryCode && (
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      countryCode={o.countryCode}
                    />
                  )}
                  <span className="text-sm text-gray-900">{o.localizedName}</span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </Listbox>
      )}
    </div>
  )
}


export default LanguageSelect

