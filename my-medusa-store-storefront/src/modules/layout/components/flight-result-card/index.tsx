"use client"


import { useState, useMemo, useCallback } from "react"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import { getCityNameFromCode } from "@modules/layout/components/flight-search-form/airports-data"
import { useSearchParams } from "next/navigation"
import { openPaymentTab, usePaymentListener, BookingSuccessData } from "@lib/hooks/use-payment-listener"
import { Flight } from "@lib/data/flights"


type FlightResultCardProps = {
  scheduleId: number
  departureTime: string
  arrivalTime: string
  departureAirport: string
  arrivalAirport: string
  duration: string
  isDirect: boolean
  priceEconomy: number
  priceBusiness: number
  currency?: string
  co2Emissions?: number
  hasMembership?: boolean
  flightNumber?: string
  departureAirportFull?: string
  arrivalAirportFull?: string
  operator?: string
  amenities?: string[]
  availableSeatsEconomy?: number
  availableSeatsBusiness?: number
  currentLocale?: string | null
  hasPass?: boolean
  passFlightsLeft?: number
  customerName?: string
  customerEmail?: string
  adultsCount?: number
  childrenCount?: number
  // Round-trip props
  roundTripMode?: "select-outbound" | "select-return"
  onSelectForRoundTrip?: (selectedClass: "economy" | "business", price: number) => void
  outboundFlight?: {
    flight: Flight
    class: "economy" | "business"
    price: number
  }
}


export default function FlightResultCard({
  scheduleId,
  departureTime,
  arrivalTime,
  departureAirport,
  arrivalAirport,
  duration,
  isDirect,
  priceEconomy,
  priceBusiness,
  currency = "GBP",
  co2Emissions,
  hasMembership = false,
  flightNumber,
  departureAirportFull,
  arrivalAirportFull,
  operator,
  amenities,
  availableSeatsEconomy,
  availableSeatsBusiness,
  currentLocale,
  hasPass = false,
  passFlightsLeft = 0,
  customerName,
  customerEmail,
  adultsCount = 1,
  childrenCount = 0,
  roundTripMode,
  onSelectForRoundTrip,
  outboundFlight,
}: FlightResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingRef, setBookingRef] = useState<string | null>(null)


  const searchParams = useSearchParams()
  const departDate = searchParams.get("departDate") || new Date().toISOString().split("T")[0]
  const returnDate = searchParams.get("returnDate") || ""
  const urlClass = searchParams.get("class") as "economy" | "business" | null
  const [selectedClass, setSelectedClass] = useState<"economy" | "business">(urlClass || "economy")


  const t = useMemo(() => (key: string, defaultValue: string) => {
    return getTranslation(currentLocale || null, key) || defaultValue
  }, [currentLocale])


  const currentPrice = selectedClass === "economy" ? priceEconomy : priceBusiness
  const totalPassengers = adultsCount + childrenCount
  const totalPrice = currentPrice * totalPassengers
  const translatedDepartureAirport = translateCity(getCityNameFromCode(departureAirport), currentLocale || null)
  const translatedArrivalAirport = translateCity(getCityNameFromCode(arrivalAirport), currentLocale || null)


  const handleBookingSuccess = useCallback((data: BookingSuccessData) => {
    if (data.scheduleId === scheduleId.toString()) {
      setIsBooked(true)
      setBookingRef(data.bookingRef)
      setShowDetails(false)
    }
  }, [scheduleId])


  usePaymentListener({ onSuccess: handleBookingSuccess })


  // ─── Main booking action ───
  const handleContinueBooking = () => {
    if (roundTripMode === "select-outbound") {
      // Just select outbound, go to return step
      onSelectForRoundTrip?.(selectedClass, totalPrice)
      return
    }


    if (roundTripMode === "select-return" && outboundFlight) {
      // Open payment with both flights as trip booking
      const outbound = outboundFlight.flight
      const outboundPricePerPerson = outboundFlight.class === "economy"
        ? outbound.current_price_economy / 100
        : outbound.current_price_business / 100
      const returnPricePerPerson = currentPrice


      openPaymentTab({
        from: outbound.departure_airport,
        to: outbound.arrival_airport,
        departureTime: outbound.departure_time.substring(0, 5),
        arrivalTime: outbound.arrival_time.substring(0, 5),
        flightNumber: outbound.flight_number,
        selectedClass: outboundFlight.class,
        price: (outboundPricePerPerson + returnPricePerPerson) * totalPassengers,
        currency,
        scheduleId: outbound.schedule_id,
        departDate,
        hasPass,
        passFlightsLeft,
        passengerName: customerName || "Guest",
        passengerEmail: customerEmail || "guest@greenwing.com",
        adultsCount,
        childrenCount,
        isTripBooking: true,
        tripId: `RT-${Date.now()}`,
        redirectAfterSuccess: "/my-flights",
        returnScheduleId: scheduleId,
        returnClass: selectedClass,
        returnTime: departureTime,
        returnArrivalTime: arrivalTime,
        returnFlightNumber: flightNumber,
        returnDate,
        returnPrice: returnPricePerPerson * totalPassengers,
        fromCity: outbound.departure_airport,
        toCity: outbound.arrival_airport,
      })
      return
    }


    // One-way
    openPaymentTab({
      from: departureAirport,
      to: arrivalAirport,
      departureTime,
      arrivalTime,
      flightNumber,
      selectedClass,
      price: totalPrice,
      currency,
      scheduleId,
      departDate,
      hasPass,
      passFlightsLeft,
      passengerName: customerName || "Guest",
      passengerEmail: customerEmail || "guest@greenwing.com",
      adultsCount,
      childrenCount,
    })
  }


  // ─── Button label depending on mode ───
  const bookButtonLabel = () => {
    if (roundTripMode === "select-outbound") return t("flightCard.selectOutbound", "Select outbound →")
    if (roundTripMode === "select-return") return t("flightCard.bookBothFlights", "Book both flights →")
    return t("flightCard.continueBooking", "Continue to booking") + " →"
  }


  if (isBooked) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4 border-2 border-teal-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-lg">{translatedDepartureAirport} → {translatedArrivalAirport}</div>
            <div className="text-gray-500 text-sm mt-0.5">{departureTime} – {arrivalTime} · {selectedClass}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Booking ref</div>
            <div className="font-mono font-bold text-teal-600 text-lg">{bookingRef}</div>
            <div className="text-xs text-green-600 font-medium mt-1">✓ Booked</div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-gray-900">{departureTime}</div>
              <div className="text-sm text-gray-500">{translatedDepartureAirport}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">{duration}</div>
              <div className="w-32 h-0.5 bg-gray-300 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-600 rounded-full"/>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isDirect ? t("flightCard.direct","Direct") : t("flightCard.stop","1 stop")}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{arrivalTime}</div>
              <div className="text-sm text-gray-500">{translatedArrivalAirport}</div>
            </div>
          </div>


          <div className="flex flex-col items-end gap-3">
            <button onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-6 py-2 border-2 border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition font-medium">
              <span>{currency} {totalPassengers > 1 ? totalPrice.toFixed(2) : currentPrice}</span>
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <button onClick={() => setShowDetails(true)}
              className="px-6 py-2 border-2 border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition font-medium">
              {t("flightCard.details","Details")}
            </button>
          </div>
        </div>


        {/* Return flight summary when in select-return mode */}
        {roundTripMode === "select-return" && outboundFlight && (
          <div className="mb-3 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-700 flex items-center justify-between">
            <span>
              ✓ {t("search.outboundSelected","Outbound")}: {outboundFlight.flight.departure_time.substring(0,5)} → {outboundFlight.flight.arrival_time.substring(0,5)} · {outboundFlight.class}
            </span>
            <span className="font-semibold">{currency} {outboundFlight.price.toFixed(2)}</span>
          </div>
        )}


        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSelectedClass("economy")}
                className={`p-4 rounded-xl border-2 transition ${selectedClass === "economy" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}>
                <div className="text-sm font-medium text-gray-700 mb-1">{t("flightCard.economy","Economy")}</div>
                <div className="text-lg font-bold text-teal-600">{currency} {priceEconomy}</div>
              </button>
              <button onClick={() => setSelectedClass("business")}
                className={`p-4 rounded-xl border-2 transition ${selectedClass === "business" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}>
                <div className="text-sm font-medium text-gray-700 mb-1">{t("flightCard.business","Business")}</div>
                <div className="text-lg font-bold text-teal-600">{currency} {priceBusiness}</div>
              </button>
            </div>


            {/* Total summary for return mode */}
            {roundTripMode === "select-return" && outboundFlight && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>{t("bookTrip.outbound.label","Outbound")} × {totalPassengers}</span>
                  <span>{currency} {outboundFlight.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>{t("bookTrip.return.label","Return")} × {totalPassengers}</span>
                  <span>{currency} {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>{t("bookTrip.payment.total","Total")}</span>
                  <span className="text-teal-600">{currency} {(outboundFlight.price + totalPrice).toFixed(2)}</span>
                </div>
              </div>
            )}


            <button onClick={handleContinueBooking}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition">
              {bookButtonLabel()}
            </button>
          </div>
        )}
      </div>


      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-teal-600 text-white p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                    <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl">GreenWing</div>
                  <div className="text-sm text-teal-100">{t("flightCard.flightDetails","Flight Details")}</div>
                </div>
              </div>
              <button onClick={() => setShowDetails(false)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>


            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{translatedDepartureAirport} → {translatedArrivalAirport}</h2>
                  <div className="relative pl-8 mb-8">
                    <div className="absolute left-0 top-2 w-5 h-5 rounded-full border-4 border-teal-600 bg-white"/>
                    <div className="absolute left-[9px] top-7 bottom-0 w-0.5 bg-teal-300"/>
                    <div className="mb-1 text-sm text-gray-500">{t("flightCard.departure","Departure")}</div>
                    <div className="text-3xl font-bold text-teal-600 mb-1">{departureTime}</div>
                    <div className="text-lg font-semibold text-gray-900 mb-3">{departureAirportFull || `${translatedDepartureAirport} Airport`}</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{t("flightCard.flight","Flight")}: <span className="font-semibold">{flightNumber || "GW2071"}</span></div>
                      <div>{t("flightCard.operator","Operator")}: {operator || "GreenWing"}</div>
                      <div>{t("flightCard.duration","Duration")}: {duration}</div>
                    </div>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-2 w-5 h-5 rounded-full border-4 border-teal-600 bg-white"/>
                    <div className="mb-1 text-sm text-gray-500">{t("flightCard.arrival","Arrival")}</div>
                    <div className="text-3xl font-bold text-teal-600 mb-1">{arrivalTime}</div>
                    <div className="text-lg font-semibold text-gray-900">{arrivalAirportFull || `${translatedArrivalAirport} Airport`}</div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-semibold text-gray-700 mb-2">{t("flightCard.flightInformation","Flight Information")}</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>✓ {isDirect ? t("flightCard.directFlight","Direct flight") : t("flightCard.stop","1 stop")}</div>
                      <div>✓ {t("flightCard.aircraft","Aircraft")}: {amenities?.[0] || "Airbus A320"}</div>
                      {co2Emissions && <div>✓ CO₂: {co2Emissions}kg</div>}
                    </div>
                  </div>
                </div>


                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t("flightCard.selectClass","Select your class")}</h3>
                  <div className="space-y-4 mb-6">
                    <button onClick={() => setSelectedClass("economy")}
                      className={`w-full p-5 rounded-xl border-2 transition text-left ${selectedClass === "economy" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{t("flightCard.economy","Economy")}</div>
                          <div className="text-sm text-gray-500">{availableSeatsEconomy || 0} seats available</div>
                        </div>
                        <div className="text-2xl font-bold text-teal-600">{currency} {priceEconomy}</div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>• {t("flightCard.snackRefreshments","Snack and refreshments")}</div>
                        <div>• {t("flightCard.standardSeat","Standard reclining seat")}</div>
                        <div>• {t("flightCard.carryOn","1 carry-on bag")}</div>
                      </div>
                    </button>
                    <button onClick={() => setSelectedClass("business")}
                      className={`w-full p-5 rounded-xl border-2 transition text-left ${selectedClass === "business" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{t("flightCard.business","Business")}</div>
                          <div className="text-sm text-gray-500">{availableSeatsBusiness || 0} seats available</div>
                        </div>
                        <div className="text-2xl font-bold text-teal-600">{currency} {priceBusiness}</div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>• {t("flightCard.premiumMeal","Premium meal service")}</div>
                        <div>• {t("flightCard.extraLegroom","Extra legroom seat")}</div>
                        <div>• {t("flightCard.priorityBoarding","Priority boarding")}</div>
                        <div>• {t("flightCard.checkedBags","2 checked bags")}</div>
                      </div>
                    </button>
                  </div>


                  <div className="p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">{t("flightCard.baseFare","Base fare")} (1 passenger)</span>
                      <span className="font-semibold">{currency} {currentPrice}</span>
                    </div>
                    {totalPassengers > 1 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">× {totalPassengers} passengers</span>
                        <span className="font-semibold text-teal-600">{currency} {totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {roundTripMode === "select-return" && outboundFlight && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">{t("bookTrip.outbound.label","Outbound")}</span>
                        <span className="font-semibold">{currency} {outboundFlight.price.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t("flightCard.total","Total")}</span>
                      <span className="text-2xl font-bold text-teal-600">
                        {currency} {roundTripMode === "select-return" && outboundFlight
                          ? (outboundFlight.price + totalPrice).toFixed(2)
                          : totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>


                  <button onClick={handleContinueBooking}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl">
                    {bookButtonLabel()}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">{t("flightCard.priceIncludes","Price includes all taxes and fees")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



