import { Container } from "@medusajs/ui"
import { useMemo } from "react"


import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getTranslation } from "@lib/util/translations"
import RecentFlights from "@modules/account/components/recent-flights"


type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  currentLocale?: string | null
}


const Overview = ({ customer, orders, currentLocale }: OverviewProps) => {
  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale || null, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  return (
    <div data-testid="overview-page-wrapper" className="bg-gradient-to-b from-teal-50/30 to-white">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#00897B] to-teal-500 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-8 translate-y-8 rounded-full from-[#00897B]/20 to-teal-400/20 bg-gradient-to-r blur-3xl" />
        <div className="relative z-10 flex flex-col gap-2">
          <span data-testid="welcome-message" data-value={customer?.first_name} className="text-4xl font-light">
            {t("account.overview.welcome", "Welcome")},{" "}
            <span className="font-semibold">{customer?.first_name}</span>
          </span>
          <span className="text-teal-50">
            <span className="text-sm opacity-90">{t("account.overview.registeredAs", "Registered as:")} </span>
            <span className="font-medium" data-testid="customer-email" data-value={customer?.email}>
              {customer?.email}
            </span>
          </span>
        </div>
      </div>


      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                {t("account.overview.profile", "Profile")}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900" data-testid="customer-profile-completion" data-value={getProfileCompletion(customer)}>
                  {getProfileCompletion(customer)}%
                </span>
                <span className="text-sm text-gray-500">{t("account.overview.completed", "completed")}</span>
              </div>
            </div>
            <div className="rounded-full bg-[#00897B]/10 p-3 text-[#00897B] transition-all group-hover:bg-[#00897B]/20">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>


        <div className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                {t("account.overview.addresses", "Addresses")}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900" data-testid="addresses-count" data-value={customer?.addresses?.length || 0}>
                  {customer?.addresses?.length || 0}
                </span>
                <span className="text-sm text-gray-500">{t("account.overview.saved", "saved")}</span>
              </div>
            </div>
            <div className="rounded-full bg-[#00897B]/10 p-3 text-[#00897B] transition-all group-hover:bg-[#00897B]/20">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Orders */}
     <RecentFlights
        customerEmail={customer?.email || ""}
        currentLocale={currentLocale}
        bookFlightLabel={t("account.overview.bookFlight", "Book a flight")}
        noFlightsLabel={t("account.overview.noFlights", "You have no booked flights yet")}
        recentFlightsLabel={t("account.overview.recentFlights", "Recent flights")}
        allFlightsLabel={t("account.overview.allFlights", "All flights")}
      />

      </div>
  )
}


const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) return 0
  let count = 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  const billingAddress = customer.addresses?.find((addr) => addr.is_default_billing)
  if (billingAddress) count++
  return Math.round((count / 4) * 100)
}


export default Overview



