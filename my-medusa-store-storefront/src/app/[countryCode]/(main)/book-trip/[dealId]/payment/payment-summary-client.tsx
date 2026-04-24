"use client"


import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import { openPaymentTab, usePaymentListener, BookingSuccessData } from "@lib/hooks/use-payment-listener"
import TripSteps from "@modules/trips/components/trip-steps"


interface Hotel {
  id: number; name: string; price_per_night: number; currency: string
  image: string; stars: number; room_type: string
}


interface Props {
  deal: DealFlight; currentLocale: string | null
  customerName: string; customerEmail: string
  outboundScheduleId: string; outboundClass: string
  outboundTime: string; outboundArrivalTime: string; outboundFlightNumber: string; outboundPrice: string
  returnScheduleId: string; returnClass: string
  returnTime: string; returnArrivalTime: string; returnFlightNumber: string; returnPrice: string
  hotelId: string; adults: number; children: number
  hasPass?: boolean; passFlightsLeft?: number
}


function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < stars ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}


export default function PaymentSummaryClient({
  deal, currentLocale, customerName, customerEmail,
  outboundScheduleId, outboundClass, outboundTime, outboundArrivalTime, outboundFlightNumber, outboundPrice,
  returnScheduleId, returnClass, returnTime, returnArrivalTime, returnFlightNumber, returnPrice,
  hotelId, adults, children, hasPass = false, passFlightsLeft = 0,
}: Props) {
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)


  // Слухаємо успішну оплату з вікна payment
  const handleBookingSuccess = useCallback((data: BookingSuccessData) => {
    setBookingSuccess(true)
    // Redirect на my-trips після короткої затримки
    setTimeout(() => {
      router.push("/my-trips")
    }, 1500)
  }, [router])


  usePaymentListener({ onSuccess: handleBookingSuccess })
  const t = useMemo(() => (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback, [currentLocale])


  const fromCity = translateCity(deal.fromCity, currentLocale)
  const toCity = translateCity(deal.toCity, currentLocale)
  const totalPassengers = adults + children
  const nightsCount = Math.max(1, Math.round(
    (new Date(deal.returnDate).getTime() - new Date(deal.departDate).getTime()) / 86400000
  ))
  const ppOut = parseFloat(outboundPrice)
  const ppRet = parseFloat(returnPrice)
  const outboundTotal = ppOut * totalPassengers
  const returnTotal = ppRet * totalPassengers
  const hotelTotal = hotel ? hotel.price_per_night * nightsCount : 0
  const grandTotal = outboundTotal + returnTotal + hotelTotal


  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(currentLocale || "en-GB", { day: "numeric", month: "short", year: "numeric" })


  useEffect(() => {
    if (!hotelId) return
    fetch(`/api/hotels/${hotelId}`).then(r => r.json()).then(d => setHotel(d.hotel)).catch(console.error)
  }, [hotelId])


  const handlePayNow = () => {
    openPaymentTab({
      from: deal.from, to: deal.to,
      departureTime: outboundTime.substring(0, 5),
      arrivalTime: outboundArrivalTime.substring(0, 5),
      flightNumber: outboundFlightNumber || deal.flightNumber.replace(" ", ""),
      selectedClass: outboundClass as "economy" | "business",
      price: grandTotal, currency: "GBP",
      scheduleId: parseInt(outboundScheduleId),
      departDate: deal.departDate,
      hasPass, passFlightsLeft,
      passengerName: customerName, passengerEmail: customerEmail,
      adultsCount: adults, childrenCount: children,
      isTripBooking: true,
      tripId: `TRIP-${Date.now()}`,
      returnScheduleId, returnClass,
      returnTime: returnTime.substring(0, 5),
      returnArrivalTime: returnArrivalTime.substring(0, 5),
      returnFlightNumber, returnDate: deal.returnDate,
      returnPrice: ppRet * totalPassengers,
      fromCity: deal.from, toCity: deal.to,
    })
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <TripSteps currentStep={5} />
      <div className="container mx-auto px-4 max-w-3xl py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            {t("search.backToSearch", "Back")}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t("bookTrip.payment.title", "Trip summary")}</h1>
          <p className="text-gray-500 mt-1">{formatDate(deal.departDate)} – {formatDate(deal.returnDate)}</p>
        </div>


        <div className="space-y-4 mb-6">
          {/* Passengers — read-only */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{totalPassengers} {totalPassengers === 1 ? t("bookTrip.passenger", "passenger") : t("bookTrip.passengers", "passengers")}</div>
                <div className="text-xs text-gray-400">{adults} adult{children > 0 ? ` · ${children} child` : ""}</div>
              </div>
            </div>
            <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{t("bookTrip.namesAtPayment", "Names at payment")}</span>
          </div>


          {/* Outbound */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold mb-3 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              {t("bookTrip.outbound.label", "Outbound flight")}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg">{fromCity} → {toCity}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(deal.departDate)} · {outboundTime.substring(0, 5)} · {outboundClass}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">£{outboundTotal.toFixed(0)}</p>
                <p className="text-xs text-gray-400">£{ppOut.toFixed(0)} × {totalPassengers}</p>
              </div>
            </div>
          </div>


          {/* Return */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold mb-3 uppercase tracking-wider">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              {t("bookTrip.return.label", "Return flight")}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg">{toCity} → {fromCity}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(deal.returnDate)} · {returnTime.substring(0, 5)} · {returnClass}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">£{returnTotal.toFixed(0)}</p>
                <p className="text-xs text-gray-400">£{ppRet.toFixed(0)} × {totalPassengers}</p>
              </div>
            </div>
          </div>


          {/* Hotel */}
          {hotel ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold mb-3 uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                {t("bookTrip.hotel.label", "Hotel")}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${hotel.image}')` }}/>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{hotel.name}</p>
                  <StarRating stars={hotel.stars}/>
                  <p className="text-xs text-gray-500 mt-0.5">{hotel.room_type} · {nightsCount} {nightsCount === 1 ? t("hotelSearch.night","night") : t("hotelSearch.nights","nights")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">£{hotelTotal.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">{t("hotelSearch.results.total","total")}</p>
                </div>
              </div>
            </div>
          ) : !hotelId ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-400">{t("bookTrip.payment.noHotel","No hotel added")}</div>
          ) : null}


          {/* Grand total */}
          <div className="bg-teal-600 rounded-2xl p-5 text-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-teal-100"><span>{t("bookTrip.outbound.label","Outbound")} × {totalPassengers}</span><span>£{outboundTotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-sm text-teal-100"><span>{t("bookTrip.return.label","Return")} × {totalPassengers}</span><span>£{returnTotal.toFixed(0)}</span></div>
              {hotel && <div className="flex justify-between text-sm text-teal-100"><span>{t("bookTrip.hotel.label","Hotel")} ({nightsCount} {t("hotelSearch.nights","nights")})</span><span>£{hotelTotal.toFixed(0)}</span></div>}
            </div>
            <div className="border-t border-teal-500 pt-4 flex items-center justify-between">
              <div><span className="font-bold text-lg">{t("bookTrip.payment.total","Total")}</span><div className="text-xs text-teal-200 mt-0.5">{totalPassengers} {t("bookTrip.passengers","passengers")}</div></div>
              <span className="text-3xl font-bold">£{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>


        {/* Success state after payment */}
        {bookingSuccess && (
          <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-800">Trip booked! Redirecting to My Trips...</div>
              <div className="text-sm text-green-600 mt-0.5">Your booking has been confirmed.</div>
            </div>
            <div className="ml-auto">
              <div className="w-6 h-6 border-2 border-green-400 border-t-green-600 rounded-full animate-spin"/>
            </div>
          </div>
        )}


        <button onClick={handlePayNow} className="w-full py-4 rounded-xl font-bold text-lg bg-teal-500 hover:bg-teal-600 text-white transition shadow-lg hover:shadow-xl">
          {t("bookTrip.payment.payNow","Pay now")} — £{grandTotal.toFixed(0)}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          {t("bookTrip.payment.secure","Secure 256-bit SSL encrypted payment")}
        </p>
      </div>
    </div>
  )
}



