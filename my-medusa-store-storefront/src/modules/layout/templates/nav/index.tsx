// БЕЗ "use client"
import Link from "next/link"
import Image from "next/image"
import NavClient from "./nav-client"
import { Locale } from "@lib/data/locales"
import { getTranslation } from "@lib/util/translations"
import { retrieveCustomer } from "@lib/data/customer"


type NavProps = {
  locales: Locale[]
  currentLocale: string | null
}


export default async function Nav({ locales, currentLocale }: NavProps) {
  const customer = await retrieveCustomer().catch(() => null)
  const t = (key: string) => getTranslation(currentLocale, key)


  const translations = {
    book: t("nav.book") || "Бронювати",
    myFlights: t("nav.myFlights") || "Мої рейси",
    myTrips: t("nav.myTrips") || "Мої тури",
    checkIn: t("nav.checkIn") || "Реєстрація",
    flightStatus: t("nav.flightStatus") || "Статус рейсу",
    help: t("nav.help") || "Допомога",
    greenWingPass: t("nav.greenWingPass") || "GreenWing Pass",
    logIn: t("nav.logIn") || "Увійти",
    account: t("nav.account") || "Акаунт",
  }


  return (
    <header className="bg-teal-600 shadow-md sticky top-0 z-50 h-[70px]">
      <nav className="container mx-auto px-6 py-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="GreenWing Logo"
            width={32}
            height={32}
            className="w-40 h-40"
          />
        </Link>
        <NavClient
          locales={locales}
          currentLocale={currentLocale}
          isLoggedIn={!!customer}
          customerName={customer?.first_name}
          customerEmail={customer?.email}
          translations={translations}
        />
      </nav>
    </header>
  )
}



