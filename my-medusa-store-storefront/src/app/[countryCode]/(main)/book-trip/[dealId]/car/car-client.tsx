"use client"


import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import TripSteps from "@modules/trips/components/trip-steps"


interface CarClientProps {
  deal: DealFlight
  currentLocale: string | null
  customerName: string
  customerEmail: string
  outboundScheduleId: string
  outboundClass: string
  outboundTime: string
  outboundArrivalTime: string
  outboundFlightNumber: string
  outboundPrice: string
  returnScheduleId: string
  returnClass: string
  returnTime: string
  returnArrivalTime: string
  returnFlightNumber: string
  returnPrice: string
  hotelId: string
  adults: number
  children: number
}


export default function CarClient({
  deal, currentLocale,
  outboundScheduleId, outboundClass, outboundTime, outboundArrivalTime, outboundFlightNumber, outboundPrice,
  returnScheduleId, returnClass, returnTime, returnArrivalTime, returnFlightNumber, returnPrice,
  hotelId, adults, children,
}: CarClientProps) {
  const router = useRouter()


  const t = useMemo(() => (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback, [currentLocale])
  const toCityTranslated = translateCity(deal.toCity, currentLocale)


  const buildParams = () => {
    const params = new URLSearchParams({
      outboundScheduleId,
      outboundClass,
      outboundTime,
      outboundArrivalTime,
      outboundFlightNumber,
      outboundPrice,
      returnScheduleId,
      returnClass,
      returnTime,
      returnArrivalTime,
      returnFlightNumber,
      returnPrice,
      adults: adults.toString(),
      children: children.toString(),
    })
    if (hotelId) params.set("hotelId", hotelId)
    return params.toString()
  }


  const handleSkip = () => {
    router.push(`/book-trip/${deal.id}/payment?${buildParams()}`)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <TripSteps currentStep={4} />


      <div className="container mx-auto px-4 max-w-3xl py-8">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("search.backToSearch", "Back")}
          </button>
          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {t("bookTrip.car.label", "Car rental")}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("bookTrip.car.title", "Rent a car in")} {toCityTranslated}
          </h1>
        </div>


        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-10 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mx-auto mb-5 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("bookTrip.car.comingSoon", "Car rental coming soon!")}</h2>
            <p className="text-teal-100 text-sm max-w-sm mx-auto">
              {t("bookTrip.car.comingSoonDesc", "We're working on bringing you the best car rental options. Skip for now and complete your booking.")}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-4 tracking-wider">
              {t("bookTrip.car.comingSoonFeatures", "What's coming")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t("bookTrip.car.feature1", "Full insurance included") },
                { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", label: t("bookTrip.car.feature2", "Pick up at airport") },
                { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: t("bookTrip.car.feature3", "Best price guarantee") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


        <button onClick={handleSkip}
          className="w-full py-4 rounded-xl font-bold text-lg bg-teal-500 hover:bg-teal-600 text-white transition shadow-lg hover:shadow-xl">
          {t("bookTrip.car.skip", "Skip and continue to payment →")}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          {t("bookTrip.car.skipNote", "You can always add a car later")}
        </p>
      </div>
    </div>
  )
}



