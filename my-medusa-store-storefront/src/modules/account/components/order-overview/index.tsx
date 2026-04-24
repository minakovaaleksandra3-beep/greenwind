"use client"


import { Button } from "@medusajs/ui"
import { useMemo } from "react"


import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { getTranslation } from "@lib/util/translations"


type Props = {
  orders: HttpTypes.StoreOrder[]
  currentLocale?: string | null
}


const OrderOverview = ({ orders, currentLocale }: Props) => {
  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale || null, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div key={o.id} className="border-b border-gray-200 pb-6 last:pb-0 last:border-none">
            <OrderCard order={o} currentLocale={currentLocale} />
          </div>
        ))}
      </div>
    )
  }


  return (
    <div className="w-full flex flex-col items-center gap-y-6 py-12 px-4" data-testid="no-orders-container">
      <div className="mb-2 rounded-full bg-[#00897B]/10 p-6">
        <svg className="h-12 w-12 text-[#00897B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11L5 14l7 3 7-3-7-3z" />
        </svg>
      </div>


      <h2 className="text-2xl font-semibold text-gray-900">
        {t("account.orders.emptyTitle", "Haven't traveled with us yet?")}
      </h2>


      <p className="max-w-md text-center text-base text-gray-600">
        {t("account.orders.emptyText", "You have no booked flights yet. Time to plan your next unforgettable journey!")}
      </p>


      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <LocalizedClientLink href="/flights" passHref>
          <Button data-testid="find-flights-button" className="bg-[#00897B] px-6 py-3 text-white hover:bg-[#00695C] transition-colors duration-200">
            {t("account.orders.findFlights", "Find flights")}
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/destinations" passHref>
          <Button data-testid="explore-destinations-button" variant="secondary" className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors duration-200">
            {t("account.orders.popularDestinations", "Popular destinations")}
          </Button>
        </LocalizedClientLink>
      </div>


      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center">
          <div className="mb-2 text-2xl">✈️</div>
          <h3 className="font-medium text-gray-900">{t("account.orders.perk1Title", "100+ destinations")}</h3>
          <p className="text-sm text-gray-500">{t("account.orders.perk1Desc", "Europe and beyond")}</p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-2xl">🧳</div>
          <h3 className="font-medium text-gray-900">{t("account.orders.perk2Title", "Carry-on included")}</h3>
          <p className="text-sm text-gray-500">{t("account.orders.perk2Desc", "10kg in the cabin")}</p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-2xl">💳</div>
          <h3 className="font-medium text-gray-900">{t("account.orders.perk3Title", "Easy payment")}</h3>
          <p className="text-sm text-gray-500">{t("account.orders.perk3Desc", "Installments or instant")}</p>
        </div>
      </div>


      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {t("account.orders.haveBooking", "Already have a booking?")}{" "}
          <LocalizedClientLink href="/account/bookings" className="text-[#00897B] hover:text-[#00695C] font-medium">
            {t("account.orders.findBooking", "Find my booking")}
          </LocalizedClientLink>
        </p>
      </div>
    </div>
  )
}


export default OrderOverview



