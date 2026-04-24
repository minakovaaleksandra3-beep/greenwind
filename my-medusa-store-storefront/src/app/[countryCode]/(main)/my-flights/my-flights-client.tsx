"use client"


import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { usePaymentListener, BookingSuccessData } from "@lib/hooks/use-payment-listener"
import { getTranslation } from "@lib/util/translations"


type Booking = {
  id: number
  reference: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  departureDate: string
  duration: string
  isDirect: boolean
  operator: string
  class: "economy" | "business"
  pricePaid: number
  status: "confirmed" | "pending" | "cancelled"
  paidWithPass: boolean
  bookedAt: string
}


type Props = {
  customerEmail: string | null
  customerName: string
  currentLocale: string | null
  isLoggedIn: boolean
}


export default function MyFlightsClient({ customerEmail, customerName, currentLocale, isLoggedIn }: Props) {
  const router = useRouter()
  const t = useMemo(() => (key: string, def: string) => getTranslation(currentLocale, key) || def, [currentLocale])


  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming")
  const [newBookingRef, setNewBookingRef] = useState<string | null>(null)


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("gw_redirect", window.location.pathname)
      router.push(`/account?redirect_to=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isLoggedIn, router])


  const statusConfig = {
    confirmed: { label: t("myFlights.status.confirmed", "Confirmed"), color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
    pending:   { label: t("myFlights.status.pending",   "Pending"),   color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" },
    cancelled: { label: t("myFlights.status.cancelled", "Cancelled"), color: "text-red-700",   bg: "bg-red-100",    dot: "bg-red-500" },
  }


  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/flights/my-bookings?email=${encodeURIComponent(customerEmail || "")}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to load bookings")
      }
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerEmail])


  useEffect(() => {
    if (isLoggedIn) fetchBookings()
  }, [fetchBookings, isLoggedIn])


  // Show loading spinner while redirecting
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }


  const handleNewBooking = useCallback((data: BookingSuccessData) => {
    setNewBookingRef(data.bookingRef)
    fetchBookings()
    setTimeout(() => setNewBookingRef(null), 6000)
  }, [fetchBookings])


  usePaymentListener({ onSuccess: handleNewBooking })


  const now = new Date()
  const filteredBookings = bookings.filter((b) => {
    const flightDate = new Date(b.departureDate)
    if (activeTab === "upcoming") return flightDate >= now && b.status !== "cancelled"
    if (activeTab === "past") return flightDate < now || b.status === "cancelled"
    return true
  })


  const upcomingCount = bookings.filter(b => new Date(b.departureDate) >= now && b.status !== "cancelled").length
  const pastCount = bookings.filter(b => new Date(b.departureDate) < now || b.status === "cancelled").length


  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(currentLocale || "en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    } catch { return dateStr }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-100 hover:text-white mb-6 text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            {t("myFlights.back", "Back")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{t("myFlights.title", "My Flights")}</h1>
              <p className="text-teal-100 text-sm">{customerEmail}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{bookings.length}</div>
              <div className="text-teal-100 text-sm">{t("myFlights.totalBookings", "total bookings")}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-8">
            {[
              { key: "upcoming", label: t("myFlights.tabs.upcoming", "Upcoming"), count: upcomingCount },
              { key: "past",     label: t("myFlights.tabs.past",     "Past"),     count: pastCount },
              { key: "all",      label: t("myFlights.tabs.all",      "All"),      count: bookings.length },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.key ? "bg-white text-teal-700 shadow-md" : "bg-teal-500/40 text-white hover:bg-teal-500/60"
                }`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-white/20"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* New booking notification */}
        {newBookingRef && (
          <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-800">{t("myFlights.newBooking", "New booking confirmed!")}</div>
              <div className="text-sm text-green-600 font-mono">{newBookingRef}</div>
            </div>
          </div>
        )}


        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"/>
            <p className="text-gray-500">{t("myFlights.loading", "Loading your flights...")}</p>
          </div>
        )}


        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 rounded-2xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchBookings} className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition">
              {t("myFlights.tryAgain", "Try again")}
            </button>
          </div>
        )}


        {/* Empty state */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "upcoming"
                ? t("myFlights.empty.upcoming", "No upcoming flights")
                : activeTab === "past"
                ? t("myFlights.empty.past", "No past flights")
                : t("myFlights.empty.all", "No flights yet")}
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              {activeTab !== "past"
                ? t("myFlights.empty.cta", "Book your next adventure with GreenWing")
                : t("myFlights.empty.pastDesc", "Your completed flights will appear here")}
            </p>
            {activeTab !== "past" && (
              <button onClick={() => router.push("/book")} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg">
                {t("myFlights.searchFlights", "Search flights")}
              </button>
            )}
          </div>
        )}


        {/* Bookings list */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isPast = new Date(booking.departureDate) < now
              const status = statusConfig[booking.status] || statusConfig.confirmed


              return (
                <div key={booking.id}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md ${isPast ? "opacity-75" : ""} ${booking.reference === newBookingRef ? "ring-2 ring-teal-500" : ""}`}>
                  <div className={`h-1 ${booking.status === "confirmed" ? "bg-gradient-to-r from-teal-500 to-teal-400" : booking.status === "cancelled" ? "bg-red-400" : "bg-yellow-400"}`}/>


                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{booking.flightNumber}</div>
                          <div className="text-sm text-gray-500">{booking.operator || "GreenWing"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.paidWithPass && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">✈️ Pass</span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>
                          {status.label}
                        </span>
                      </div>
                    </div>


                    {/* Route */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{booking.departureTime}</div>
                        <div className="text-base font-semibold text-gray-700 mt-0.5">{booking.departure}</div>
                      </div>
                      <div className="flex-1 mx-6 flex flex-col items-center">
                        <div className="text-xs text-gray-400 mb-2">{booking.duration || "—"}</div>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px bg-gray-200"/>
                          <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                          </svg>
                          <div className="flex-1 h-px bg-gray-200"/>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{booking.isDirect ? t("myFlights.direct", "Direct") : t("myFlights.stop", "1 stop")}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{booking.arrivalTime}</div>
                        <div className="text-base font-semibold text-gray-700 mt-0.5">{booking.arrival}</div>
                      </div>
                    </div>


                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {formatDate(booking.departureDate)}
                        </div>
                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                          {booking.class === "economy" ? t("myFlights.economy", "Economy") : t("myFlights.business", "Business")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono text-xs text-gray-400">REF</div>
                          <div className="font-mono font-bold text-teal-600">{booking.reference}</div>
                        </div>
                        {booking.paidWithPass ? (
                          <div className="text-right">
                            <div className="text-xs text-gray-400 line-through">GBP {booking.pricePaid}</div>
                            <div className="font-bold text-green-600">{t("myFlights.free", "Free")}</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-xs text-gray-400">{t("myFlights.paid", "Paid")}</div>
                            <div className="font-bold text-gray-900">GBP {booking.pricePaid}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}


        {!loading && bookings.length > 0 && (
          <div className="mt-8 text-center">
            <button onClick={() => router.push("/book")} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg inline-flex items-center gap-2">
              {t("myFlights.bookAnother", "Book another flight")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}



