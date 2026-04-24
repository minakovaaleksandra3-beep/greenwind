"use client"


import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import FlightResultCard from "@modules/layout/components/flight-result-card"
import { searchFlights, Flight } from "@lib/data/flights"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import { getCityNameFromCode } from "@modules/layout/components/flight-search-form/airports-data"
import { openPaymentTab, usePaymentListener, BookingSuccessData } from "@lib/hooks/use-payment-listener"


interface SearchClientProps {
  currentLocale: string | null
  customerName: string
  customerEmail: string
  hasPass?: boolean
  passFlightsLeft?: number
}


export default function SearchClient({
  currentLocale, customerName, customerEmail, hasPass = false, passFlightsLeft = 0
}: SearchClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()


  const from = searchParams.get("from") || "LDN"
  const to = searchParams.get("to") || "PAR"
  const departDate = searchParams.get("departDate") || new Date().toISOString().split("T")[0]
  const returnDate = searchParams.get("returnDate") || ""
  const tripType = searchParams.get("tripType") || "one-way"
  const adultsCount = parseInt(searchParams.get("adults") || "1")
  const childrenCount = parseInt(searchParams.get("children") || "0")
  const isRoundTrip = tripType === "round-trip" && !!returnDate


  // Round-trip state
  const [step, setStep] = useState<"outbound" | "return">("outbound")
  const [selectedOutbound, setSelectedOutbound] = useState<{
    flight: Flight
    class: "economy" | "business"
    price: number
  } | null>(null)


  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([])
  const [returnFlights, setReturnFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [returnLoading, setReturnLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBookingRef, setNewBookingRef] = useState<string | null>(null)


  const t = useMemo(() => (key: string, def: string) => getTranslation(currentLocale, key) || def, [currentLocale])
  const fromCity = translateCity(getCityNameFromCode(from), currentLocale)
  const toCity = translateCity(getCityNameFromCode(to), currentLocale)


  // Load outbound flights
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const results = await searchFlights(from, to, departDate)
        setOutboundFlights(results)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [from, to, departDate])


  // Load return flights when step changes to return
  useEffect(() => {
    if (step !== "return" || !returnDate) return
    async function load() {
      try {
        setReturnLoading(true)
        const results = await searchFlights(to, from, returnDate)
        setReturnFlights(results)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setReturnLoading(false)
      }
    }
    load()
  }, [step, to, from, returnDate])


  // Listen for booking success on return flight
  const handleBookingSuccess = useCallback((data: BookingSuccessData) => {
    setNewBookingRef(data.bookingRef)
    setTimeout(() => setNewBookingRef(null), 6000)
  }, [])
  usePaymentListener({ onSuccess: handleBookingSuccess })


  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(currentLocale || "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 animate-spin">
              <svg className="w-20 h-20 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700">{t("search.loading.title","Searching for flights...")}</p>
          <p className="text-gray-500 mt-2">{t("search.loading.subtitle","Finding the best routes for you")}</p>
        </div>
      </div>
    )
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("search.error.title","Something went wrong")}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold transition">
            {t("search.error.tryAgain","Try again")}
          </button>
        </div>
      </div>
    )
  }


  const flights = step === "outbound" ? outboundFlights : returnFlights
  const currentFrom = step === "outbound" ? from : to
  const currentTo = step === "outbound" ? to : from
  const currentFromCity = step === "outbound" ? fromCity : toCity
  const currentToCity = step === "outbound" ? toCity : fromCity
  const currentDate = step === "outbound" ? departDate : returnDate


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">


        {/* New booking notification */}
        {newBookingRef && (
          <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-800">{t("myFlights.newBooking","Booking confirmed!")}</div>
              <div className="text-sm text-green-600 font-mono">{newBookingRef}</div>
            </div>
          </div>
        )}


        {/* Round-trip steps indicator */}
        {isRoundTrip && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-4">
              {/* Step 1 */}
              <div className={`flex items-center gap-2 flex-1 ${step === "outbound" ? "" : "opacity-60"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  selectedOutbound ? "bg-teal-500 text-white" : step === "outbound" ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-gray-100 text-gray-400"
                }`}>
                  {selectedOutbound ? "✓" : "1"}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${step === "outbound" ? "text-teal-700" : "text-gray-500"}`}>
                    {fromCity} → {toCity}
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(departDate)}</div>
                </div>
              </div>


              {/* Connector */}
              <div className={`flex-1 h-0.5 mx-2 rounded-full ${selectedOutbound ? "bg-teal-400" : "bg-gray-200"}`}/>


              {/* Step 2 */}
              <div className={`flex items-center gap-2 flex-1 ${step === "return" ? "" : "opacity-60"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  step === "return" ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-gray-100 text-gray-400"
                }`}>
                  2
                </div>
                <div>
                  <div className={`text-sm font-semibold ${step === "return" ? "text-teal-700" : "text-gray-500"}`}>
                    {toCity} → {fromCity}
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(returnDate)}</div>
                </div>
              </div>
            </div>


            {/* Selected outbound summary */}
            {selectedOutbound && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  ✓ {t("search.outboundSelected","Outbound selected")}: {selectedOutbound.flight.departure_time.substring(0,5)} – {selectedOutbound.flight.arrival_time.substring(0,5)} · {selectedOutbound.class}
                </div>
                <button onClick={() => { setStep("outbound"); setSelectedOutbound(null) }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  {t("search.change","Change")}
                </button>
              </div>
            )}
          </div>
        )}


        {/* Header */}
        <div className="mb-8">
          <button onClick={() => {
            if (step === "return") { setStep("outbound"); setSelectedOutbound(null) }
            else router.back()
          }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            {step === "return" ? t("search.backToOutbound","← Back to outbound") : t("search.backToSearch","Back to search")}
          </button>


          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {currentFromCity}
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
                {currentToCity}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {formatDate(currentDate)}
                {isRoundTrip && (
                  <span className="ml-2 text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                    {step === "outbound" ? t("search.selectOutbound","Select outbound flight") : t("search.selectReturn","Select return flight")}
                  </span>
                )}
              </p>
            </div>
            {(step === "outbound" ? outboundFlights : returnFlights).length > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">{flights.length}</p>
                <p className="text-sm text-gray-500">{t("search.flightsFound","flights found")}</p>
              </div>
            )}
          </div>
        </div>


        {/* Return loading */}
        {step === "return" && returnLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        )}


        {/* Flights list */}
        {!returnLoading && flights.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-3">{t("search.noFlights.title","No flights found")}</h2>
              <p className="text-teal-100 text-lg">
                {currentFromCity} → {currentToCity}
              </p>
            </div>
            <div className="p-8 text-center">
              <button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700 text-white py-4 px-8 rounded-xl font-bold transition">
                {t("search.noFlights.searchNew","Search new flights")}
              </button>
            </div>
          </div>
        )}


        {!returnLoading && flights.length > 0 && (
          <div className="space-y-4">
            {flights.map(flight => {
              // For round-trip outbound — clicking "Book" selects outbound and goes to return step
              // For round-trip return — opens payment with both flights
              // For one-way — opens payment normally
              if (isRoundTrip && step === "outbound") {
                return (
                  <FlightResultCard
                    key={flight.schedule_id}
                    scheduleId={flight.schedule_id}
                    departureTime={flight.departure_time.substring(0,5)}
                    arrivalTime={flight.arrival_time.substring(0,5)}
                    departureAirport={flight.departure_airport}
                    arrivalAirport={flight.arrival_airport}
                    duration={flight.duration}
                    isDirect={flight.is_direct}
                    priceEconomy={flight.current_price_economy / 100}
                    priceBusiness={flight.current_price_business / 100}
                    co2Emissions={flight.co2_emissions}
                    hasMembership={false}
                    flightNumber={flight.flight_number}
                    departureAirportFull={flight.departure_airport_full}
                    arrivalAirportFull={flight.arrival_airport_full}
                    operator={flight.operator}
                    amenities={flight.amenities}
                    availableSeatsEconomy={flight.available_seats_economy}
                    availableSeatsBusiness={flight.available_seats_business}
                    currentLocale={currentLocale}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    hasPass={hasPass}
                    passFlightsLeft={passFlightsLeft}
                    adultsCount={adultsCount}
                    childrenCount={childrenCount}
                    // Round-trip outbound: override button to select → go to return step
                    onSelectForRoundTrip={(selectedClass, price) => {
                      setSelectedOutbound({ flight, class: selectedClass, price })
                      setStep("return")
                    }}
                    roundTripMode="select-outbound"
                  />
                )
              }


              if (isRoundTrip && step === "return" && selectedOutbound) {
                return (
                  <FlightResultCard
                    key={flight.schedule_id}
                    scheduleId={flight.schedule_id}
                    departureTime={flight.departure_time.substring(0,5)}
                    arrivalTime={flight.arrival_time.substring(0,5)}
                    departureAirport={flight.departure_airport}
                    arrivalAirport={flight.arrival_airport}
                    duration={flight.duration}
                    isDirect={flight.is_direct}
                    priceEconomy={flight.current_price_economy / 100}
                    priceBusiness={flight.current_price_business / 100}
                    co2Emissions={flight.co2_emissions}
                    hasMembership={false}
                    flightNumber={flight.flight_number}
                    departureAirportFull={flight.departure_airport_full}
                    arrivalAirportFull={flight.arrival_airport_full}
                    operator={flight.operator}
                    amenities={flight.amenities}
                    availableSeatsEconomy={flight.available_seats_economy}
                    availableSeatsBusiness={flight.available_seats_business}
                    currentLocale={currentLocale}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    hasPass={hasPass}
                    passFlightsLeft={passFlightsLeft}
                    adultsCount={adultsCount}
                    childrenCount={childrenCount}
                    roundTripMode="select-return"
                    outboundFlight={selectedOutbound}
                  />
                )
              }


              // One-way — normal
              return (
                <FlightResultCard
                  key={flight.schedule_id}
                  scheduleId={flight.schedule_id}
                  departureTime={flight.departure_time.substring(0,5)}
                  arrivalTime={flight.arrival_time.substring(0,5)}
                  departureAirport={flight.departure_airport}
                  arrivalAirport={flight.arrival_airport}
                  duration={flight.duration}
                  isDirect={flight.is_direct}
                  priceEconomy={flight.current_price_economy / 100}
                  priceBusiness={flight.current_price_business / 100}
                  co2Emissions={flight.co2_emissions}
                  hasMembership={false}
                  flightNumber={flight.flight_number}
                  departureAirportFull={flight.departure_airport_full}
                  arrivalAirportFull={flight.arrival_airport_full}
                  operator={flight.operator}
                  amenities={flight.amenities}
                  availableSeatsEconomy={flight.available_seats_economy}
                  availableSeatsBusiness={flight.available_seats_business}
                  currentLocale={currentLocale}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  hasPass={hasPass}
                  passFlightsLeft={passFlightsLeft}
                  adultsCount={adultsCount}
                  childrenCount={childrenCount}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



