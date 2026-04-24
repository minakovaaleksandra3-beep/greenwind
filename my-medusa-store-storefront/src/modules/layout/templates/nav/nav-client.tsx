"use client"


import { useState, useEffect } from "react"
import Link from "next/link"
import LanguageSelect from "../../components/language-select"
import { Locale } from "@lib/data/locales"
import useToggleState from "@lib/hooks/use-toggle-state"


type NavClientProps = {
  locales: Locale[]
  currentLocale: string | null
  isLoggedIn: boolean
  customerName?: string | null
  customerEmail?: string | null
  translations: {
    book: string
    myFlights: string
    myTrips: string
    checkIn: string
    flightStatus: string
    help: string
    greenWingPass: string
    logIn: string
    account: string
  }
}


export default function NavClient({
  locales, currentLocale, isLoggedIn, customerName, customerEmail, translations
}: NavClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const toggleState = useToggleState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)


  useEffect(() => {
    if (!isLoggedIn || !customerEmail) return
    fetch(`/api/account/avatar?email=${encodeURIComponent(customerEmail)}`)
      .then(r => r.json())
      .then(data => { if (data.avatarUrl) setAvatarUrl(data.avatarUrl + "?t=" + Date.now()) })
      .catch(() => {})
  }, [isLoggedIn, customerEmail])


  const navLinks = [
    { href: "/book",          label: translations.book },
    { href: "/my-flights",    label: translations.myFlights },
    { href: "/my-trips",      label: translations.myTrips },
    { href: "/check-in",      label: translations.checkIn },
    { href: "/flight-status", label: translations.flightStatus },
    { href: "/help",          label: translations.help },
    { href: "/greenwin-pass", label: translations.greenWingPass },
  ]


  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-6 text-white">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className="hover:text-teal-100 transition font-medium text-sm">
            {link.label}
          </Link>
        ))}
      </div>


      {/* Right */}
      <div className="hidden lg:flex items-center gap-4">
        <Link href="/account" className="flex items-center gap-2 text-white hover:text-teal-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border-2 border-white/60" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          <span className="text-sm">{isLoggedIn ? (customerName || translations.account) : translations.logIn}</span>
        </Link>
        <div className="relative">
          <LanguageSelect toggleState={toggleState} locales={locales} currentLocale={currentLocale} />
        </div>
      </div>


      {/* Mobile button */}
      <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>


      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[70px] left-0 right-0 lg:hidden bg-teal-700 border-t border-teal-500 z-40">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4 text-white">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-teal-100" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/account" className="hover:text-teal-100" onClick={() => setMobileMenuOpen(false)}>
              {isLoggedIn ? translations.account : translations.logIn}
            </Link>
            <div className="border-t border-teal-500 pt-4">
              <LanguageSelect toggleState={toggleState} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}



