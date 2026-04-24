"use client"


import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import TripSteps from "@modules/trips/components/trip-steps"
import { translateCity } from "@lib/util/city-translations"


interface OutboundClientProps {
  deal: DealFlight
  currentLocale: string | null
  customerName: string
  customerEmail: string
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


function Counter({
  label,
  sublabel,
  value,
  min,
  onChange,
}: {
  label: string
  sublabel?: string
  value: number
  min: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <span className="font-medium text-gray-800 text-sm">{label}</span>
        {sublabel && <span className="text-xs text-gray-400 ml-1.5">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-30 transition flex items-center justify-center"
        >−</button>
        <span className="w-5 text-center font-semibold text-gray-800 text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border-2 border-teal-500 text-teal-600 font-bold hover:bg-teal-50 transition flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )
}


export default function OutboundClient({ deal, currentLocale, customerName, customerEmail }: OutboundClientProps) {
  const router = useRouter()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedClass, setSelectedClass] = useState<"economy" | "business">("economy")
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)


  const t = useMemo(() => {
    return (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback
  }, [currentLocale])


  const translateDuration = (duration: string) =>
    duration
      .replace(/h/g, t("flightStatus.flightCard.hours", "h"))
      .replace(/m\b/g, t("flightStatus.flightCard.min", "m"))


  const departDateFormatted = new Date(deal.departDate).toLocaleDateString(currentLocale || "en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })


  const totalPassengers = adults + children


  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ from: deal.from, to: deal.to, date: deal.departDate })
        const res = await fetch(`/api/flights/search?${params.toString()}`, { cache: "no-store" })
        const data = await res.json()
        setFlights(data.flights || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [deal])


  const handleContinue = () => {
    if (!selectedFlight) return
    const price = selectedClass === "economy"
      ? selectedFlight.price_economy
      : selectedFlight.price_business
    const params = new URLSearchParams({
      outboundScheduleId: selectedFlight.schedule_id.toString(),
      outboundClass: selectedClass,
      outboundTime: selectedFlight.departure_time,
      outboundArrivalTime: selectedFlight.arrival_time,
      outboundFlightNumber: selectedFlight.flight_number,
      outboundPrice: price.toString(),
      adults: adults.toString(),
      children: children.toString(),
    })
    router.push(`/book-trip/${deal.id}/return?${params.toString()}`)
  }


  const selectedPrice = selectedFlight
    ? (selectedClass === "economy" ? selectedFlight.price_economy : selectedFlight.price_business)
    : null


  return (
    <div className="min-h-screen bg-gray-50">
      <TripSteps currentStep={1} />


      <div className="container mx-auto px-4 max-w-3xl py-8">


        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {t("bookTrip.outbound.label", "Outbound flight")}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {translateCity(deal.fromCity, currentLocale)} → {translateCity(deal.toCity, currentLocale)}
          </h1>
          <p className="text-gray-500 mt-1">{departDateFormatted}</p>
        </div>


        {/* ─── PASSENGERS ─── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold mb-3 uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t("bookTrip.passengers", "Passengers")}
          </div>
          <Counter label={t("flightSearch.labels.adult", "Adults")} sublabel="18+" value={adults} min={1} onChange={setAdults} />
          <div className="border-t border-gray-50" />
          <Counter label={t("flightSearch.labels.children", "Children")} sublabel="0–17" value={children} min={0} onChange={setChildren} />
          {totalPassengers > 1 && (
            <div className="mt-2 text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
              {totalPassengers} {t("bookTrip.passengers", "passengers")} · {t("bookTrip.pricesShown", "Prices shown per person")}
            </div>
          )}
        </div>


        {/* Class selector */}
        <div className="flex gap-3 mb-6">
          {(["economy", "business"] as const).map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${selectedClass === cls
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-teal-400"
              }`}
            >
              {cls === "economy" ? t("flightSearch.labels.economy", "Economy") : t("flightSearch.labels.business", "Business")}
            </button>
          ))}
        </div>


        {/* Flights */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : flights.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500 shadow-sm">
            {t("bookTrip.outbound.noFlights", "No flights available for this date.")}
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {flights.map(flight => {
              const price = selectedClass === "economy" ? flight.price_economy : flight.price_business
              const seats = selectedClass === "economy" ? flight.available_seats_economy : flight.available_seats_business
              const isSelected = selectedFlight?.schedule_id === flight.schedule_id
              const notEnoughSeats = seats < totalPassengers


              return (
                <div
                  key={flight.schedule_id}
                  onClick={() => !notEnoughSeats && setSelectedFlight(flight)}
                  className={`bg-white rounded-2xl p-5 transition-all border-2 ${
                    notEnoughSeats
                      ? "border-transparent opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-teal-500 shadow-md cursor-pointer"
                        : "border-transparent shadow-sm hover:border-teal-200 hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.departure_time.substring(0, 5)}</div>
                        <div className="text-xs text-gray-400">{deal.from}</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-gray-400">{translateDuration(flight.duration)}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                          <div className="w-16 h-0.5 bg-teal-300" />
                          <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z" />
                            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z" />
                          </svg>
                        </div>
                        <div className="text-xs text-teal-600 font-medium">{t("flightCard.direct", "Direct")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.arrival_time.substring(0, 5)}</div>
                        <div className="text-xs text-gray-400">{deal.to}</div>
                      </div>
                    </div>


                    <div className="text-right">
                      <div className="text-xl font-bold text-teal-600">£{price.toFixed(0)}</div>
                      <div className="text-xs text-gray-400">{t("bookTrip.perPerson", "per person")}</div>
                      {totalPassengers > 1 && (
                        <div className="text-xs text-gray-500 font-medium">£{(price * totalPassengers).toFixed(0)} {t("bookTrip.total", "total")}</div>
                      )}
                      {notEnoughSeats ? (
                        <div className="text-xs text-red-500 mt-1">{t("bookTrip.notEnoughSeats", "Not enough seats")}</div>
                      ) : seats <= 9 ? (
                        <div className="text-xs text-orange-500 mt-1">{seats} {t("bookTrip.seatsLeft", "seats left")}</div>
                      ) : null}
                    </div>


                    <div className={`w-5 h-5 rounded-full border-2 ml-4 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? "border-teal-500 bg-teal-500" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>


                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">{flight.flight_number}</span>
                    <span className="text-xs text-gray-400">{t("flightCard.directFlight", "Direct flight")} · Boeing 737</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}


        {/* Continue */}
        {selectedFlight && selectedPrice && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">{t("bookTrip.selected", "Selected")}: {selectedFlight.departure_time.substring(0,5)} – {selectedFlight.arrival_time.substring(0,5)}</div>
              <div className="font-bold text-teal-600">
                £{(selectedPrice * totalPassengers).toFixed(0)}
                {totalPassengers > 1 && <span className="text-xs font-normal text-gray-400 ml-1">(£{selectedPrice} × {totalPassengers})</span>}
              </div>
            </div>
          </div>
        )}


        <button
          onClick={handleContinue}
          disabled={!selectedFlight}
          className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
            selectedFlight
              ? "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-xl"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selectedFlight
            ? t("bookTrip.continueToReturn", "Continue to return flight →")
            : t("bookTrip.selectFlight", "Select a flight to continue")}
        </button>
      </div>
    </div>
  )
}

