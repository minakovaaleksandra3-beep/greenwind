"use client"


import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import TripSteps from "@modules/trips/components/trip-steps"


interface ReturnClientProps {
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
  adults: number
  children: number
}


interface Flight {
  schedule_id: number
  flight_number: string
  departure_time: string
  arrival_time: string
  duration: string
  price_economy: number
  price_business: number
  available_seats_economy: number
  available_seats_business: number
}


export default function ReturnClient({
  deal, currentLocale, customerName, customerEmail,
  outboundScheduleId, outboundClass, outboundTime, outboundArrivalTime,
  outboundFlightNumber, outboundPrice, adults, children,
}: ReturnClientProps) {
  const router = useRouter()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedClass, setSelectedClass] = useState<"economy" | "business">(
    outboundClass === "business" ? "business" : "economy"
  )


  const totalPassengers = adults + children


  const t = useMemo(() => (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback, [currentLocale])
  const translateDuration = (d: string) =>
    d.replace(/h/g, t("flightStatus.flightCard.hours", "h")).replace(/m\b/g, t("flightStatus.flightCard.min", "m"))


  const fromCityTranslated = translateCity(deal.fromCity, currentLocale)
  const toCityTranslated = translateCity(deal.toCity, currentLocale)
  const returnDateFormatted = new Date(deal.returnDate).toLocaleDateString(currentLocale || "en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })


  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ from: deal.to, to: deal.from, date: deal.returnDate })
        const res = await fetch(`/api/flights/search?${params.toString()}`, { cache: "no-store" })
        const data = await res.json()
        setFlights(data.flights || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [deal])


  const handleContinue = () => {
    if (!selectedFlight) return
    const returnPrice = selectedClass === "economy" ? selectedFlight.price_economy : selectedFlight.price_business
    const params = new URLSearchParams({
      outboundScheduleId,
      outboundClass,
      outboundTime,
      outboundArrivalTime,
      outboundFlightNumber,
      outboundPrice,
      returnScheduleId: selectedFlight.schedule_id.toString(),
      returnClass: selectedClass,
      returnTime: selectedFlight.departure_time,
      returnArrivalTime: selectedFlight.arrival_time,
      returnFlightNumber: selectedFlight.flight_number,
      returnPrice: returnPrice.toString(),
      adults: adults.toString(),
      children: children.toString(),
    })
    router.push(`/book-trip/${deal.id}/hotel?${params.toString()}`)
  }


  const outboundTotal = parseFloat(outboundPrice) * totalPassengers


  return (
    <div className="min-h-screen bg-gray-50">
      <TripSteps currentStep={2} />


      <div className="container mx-auto px-4 max-w-3xl py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("search.backToSearch", "Back")}
          </button>
          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {t("bookTrip.return.label", "Return flight")}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{toCityTranslated} → {fromCityTranslated}</h1>
          <p className="text-gray-500 mt-1">{returnDateFormatted}</p>
        </div>


        {/* Passengers badge */}
        <div className="flex items-center gap-2 mb-4 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5 border border-teal-100">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">{totalPassengers} {totalPassengers === 1 ? t("bookTrip.passenger", "passenger") : t("bookTrip.passengers", "passengers")}</span>
          <span className="text-teal-500">·</span>
          <span className="text-teal-600">{t("bookTrip.pricesShown", "Prices shown per person")}</span>
        </div>


        {/* Outbound summary */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-600 font-medium mb-1">✓ {t("bookTrip.outbound.selected", "Outbound selected")}</p>
              <p className="text-sm font-semibold text-gray-800">
                {fromCityTranslated} → {toCityTranslated} · {outboundTime.substring(0, 5)} · {outboundClass}
              </p>
            </div>
            <div className="text-right">
              <div className="text-teal-700 font-bold">£{outboundTotal.toFixed(0)}</div>
              {totalPassengers > 1 && <div className="text-xs text-teal-500">£{parseFloat(outboundPrice).toFixed(0)} × {totalPassengers}</div>}
            </div>
          </div>
        </div>


        {/* Class selector */}
        <div className="flex gap-3 mb-6">
          {(["economy", "business"] as const).map(cls => (
            <button key={cls} onClick={() => setSelectedClass(cls)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${selectedClass === cls ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-teal-400"}`}>
              {cls === "economy" ? t("flightSearch.labels.economy", "Economy") : t("flightSearch.labels.business", "Business")}
            </button>
          ))}
        </div>


        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : flights.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500 shadow-sm">
            {t("bookTrip.return.noFlights", "No return flights available.")}
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {flights.map(flight => {
              const price = selectedClass === "economy" ? flight.price_economy : flight.price_business
              const seats = selectedClass === "economy" ? flight.available_seats_economy : flight.available_seats_business
              const isSelected = selectedFlight?.schedule_id === flight.schedule_id
              const notEnoughSeats = seats < totalPassengers


              return (
                <div key={flight.schedule_id}
                  onClick={() => !notEnoughSeats && setSelectedFlight(flight)}
                  className={`bg-white rounded-2xl p-5 transition-all border-2 ${notEnoughSeats ? "border-transparent opacity-50 cursor-not-allowed" : isSelected ? "border-teal-500 shadow-md cursor-pointer" : "border-transparent shadow-sm hover:border-teal-200 hover:shadow-md cursor-pointer"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.departure_time.substring(0, 5)}</div>
                        <div className="text-xs text-gray-400">{deal.to}</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-gray-400">{translateDuration(flight.duration)}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                          <div className="w-16 h-0.5 bg-teal-300" />
                          <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                          </svg>
                        </div>
                        <div className="text-xs text-teal-600 font-medium">{t("flightCard.direct", "Direct")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.arrival_time.substring(0, 5)}</div>
                        <div className="text-xs text-gray-400">{deal.from}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-teal-600">£{price.toFixed(0)}</div>
                      <div className="text-xs text-gray-400">{t("bookTrip.perPerson", "per person")}</div>
                      {totalPassengers > 1 && <div className="text-xs text-gray-500 font-medium">£{(price * totalPassengers).toFixed(0)} total</div>}
                      {notEnoughSeats ? (
                        <div className="text-xs text-red-500 mt-1">{t("bookTrip.notEnoughSeats", "Not enough seats")}</div>
                      ) : seats <= 9 ? (
                        <div className="text-xs text-orange-500 mt-1">{seats} {t("bookTrip.seatsLeft", "seats left")}</div>
                      ) : null}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ml-4 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">{flight.flight_number}</span>
                    <span className="text-xs text-gray-400">{t("flightCard.directFlight", "Direct")} · Boeing 737</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}


        <button onClick={handleContinue} disabled={!selectedFlight}
          className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${selectedFlight ? "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
          {selectedFlight ? t("bookTrip.continueToHotel", "Continue to hotel →") : t("bookTrip.selectFlight", "Select a flight to continue")}
        </button>
      </div>
    </div>
  )
}



