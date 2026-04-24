"use client"


import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getTranslation } from "@lib/util/translations"


type TripFlight = {
  ref: string
  flightNumber: string
  from: string
  to: string
  date: string
  depTime: string
  arrTime: string
  class: "economy" | "business"
  price: number
  status: string
}


type Trip = {
  id: number
  tripId: string
  passengerName: string
  passengerEmail: string
  adultsCount: number
  childrenCount: number
  totalPrice: number
  paidWithPass: boolean
  status: string
  createdAt: string
  outbound: TripFlight
  return: TripFlight | null
}


type Props = {
  customerEmail: string | null
  customerName: string
  currentLocale: string | null
  isLoggedIn: boolean
}


function FlightLeg({ leg, label, onCheckIn, t }: {
  leg: TripFlight
  label: string
  onCheckIn: () => void
  t: (key: string, def: string) => string
}) {
  const isPast = new Date(leg.date) < new Date()
  const isCheckedIn = leg.status === "checked_in"


  return (
    <div className={`p-4 rounded-xl border ${isPast ? "border-gray-100 bg-gray-50" : "border-teal-100 bg-teal-50/40"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          {isCheckedIn && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              ✓ {t("myTrips.checkedIn", "Checked in")}
            </span>
          )}
          <span className="font-mono text-xs text-gray-400">{leg.ref}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{leg.depTime}</div>
          <div className="text-sm font-semibold text-gray-600">{leg.from}</div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
          </svg>
          <div className="text-xs text-gray-400 mt-1 capitalize">{leg.class}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{leg.arrTime}</div>
          <div className="text-sm font-semibold text-gray-600">{leg.to}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          {new Date(leg.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          {" · "}{leg.flightNumber}
        </div>
        {!isCheckedIn && !isPast && (
          <button onClick={onCheckIn}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
            {t("myTrips.checkIn", "Check in →")}
          </button>
        )}
      </div>
    </div>
  )
}


function CheckInPanel({ bookingRef, onClose, onSuccess, t }: {
  bookingRef: string
  onClose: () => void
  onSuccess: () => void
  t: (key: string, def: string) => string
}) {
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  const handleGo = async () => {
    if (!lastName.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/check-in/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingRef, lastName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t("myTrips.checkInNotFound", "Not found")); return }
      if (!data.booking.canCheckIn) {
        const h = data.booking.hoursUntilDeparture
        setError(h > 48
          ? `${t("myTrips.checkInOpensIn", "Check-in opens in")} ${Math.round(h - 48)}h`
          : t("myTrips.checkInClosed", "Check-in is closed"))
        return
      }
      window.location.href = `/check-in?ref=${bookingRef}&lastName=${encodeURIComponent(lastName)}`
    } catch {
      setError(t("myTrips.checkInError", "Something went wrong"))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="mt-4 p-4 bg-teal-700 rounded-xl text-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">{t("myTrips.checkInTitle", "Online Check-in")}</span>
        <button onClick={onClose} className="text-teal-200 hover:text-white text-xs">
          ✕ {t("myTrips.checkInClose", "Close")}
        </button>
      </div>
      <div className="text-xs text-teal-200 mb-3">
        {t("myTrips.bookingRef", "Booking ref")}: <span className="font-mono text-white">{bookingRef}</span>
      </div>
      <div className="flex gap-2">
        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
          placeholder={t("checkIn.lastName", "Last name")}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-teal-300 focus:outline-none focus:border-white/50" />
        <button onClick={handleGo} disabled={loading || !lastName.trim()}
          className="bg-white text-teal-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-teal-50 disabled:opacity-50 transition">
          {loading ? "..." : t("myTrips.checkInGo", "Go →")}
        </button>
      </div>
      {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
    </div>
  )
}


export default function MyTripsClient({ customerEmail, customerName, currentLocale, isLoggedIn }: Props) {
  const router = useRouter()
  const t = useMemo(() => (key: string, def: string) => getTranslation(currentLocale, key) || def, [currentLocale])


  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming")
  const [checkInPanel, setCheckInPanel] = useState<string | null>(null)


  useEffect(() => {
    if (!isLoggedIn) {
    localStorage.setItem("gw_redirect", window.location.pathname)
      router.push("/account")
    }
  }, [isLoggedIn, router])


  const fetchTrips = useCallback(async () => {
    if (!customerEmail) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/trips/my-trips?email=${encodeURIComponent(customerEmail)}`, { cache: "no-store" })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      const data = await res.json()
      setTrips(data.trips || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerEmail])


  useEffect(() => { if (isLoggedIn) fetchTrips() }, [fetchTrips, isLoggedIn])


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-500 text-sm">{t("myTrips.redirecting", "Redirecting to login...")}</p>
        </div>
      </div>
    )
  }


  const now = new Date()
  const filteredTrips = trips.filter(trip => {
    const outDate = new Date(trip.outbound.date)
    if (activeTab === "upcoming") return outDate >= now && trip.status !== "cancelled"
    if (activeTab === "past") return outDate < now || trip.status === "cancelled"
    return true
  })


  const upcomingCount = trips.filter(t => new Date(t.outbound.date) >= now && t.status !== "cancelled").length
  const pastCount = trips.filter(t => new Date(t.outbound.date) < now || t.status === "cancelled").length


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-100 hover:text-white mb-6 text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            {t("myTrips.back", "Back")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{t("myTrips.title", "My Trips")}</h1>
              <p className="text-teal-100 text-sm">{customerEmail}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{trips.length}</div>
              <div className="text-teal-100 text-sm">{t("myTrips.totalTrips", "total trips")}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-8">
            {[
              { key: "upcoming", label: t("myTrips.tabs.upcoming", "Upcoming"), count: upcomingCount },
              { key: "past",     label: t("myTrips.tabs.past",     "Past"),     count: pastCount },
              { key: "all",      label: t("myTrips.tabs.all",      "All"),      count: trips.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${activeTab === tab.key ? "bg-white text-teal-700 shadow-md" : "bg-teal-500/40 text-white hover:bg-teal-500/60"}`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-white/20"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"/>
            <p className="text-gray-500">{t("myTrips.loading", "Loading your trips...")}</p>
          </div>
        )}


        {error && !loading && (
          <div className="bg-red-50 rounded-2xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchTrips} className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition">
              {t("myTrips.tryAgain", "Try again")}
            </button>
          </div>
        )}


        {!loading && !error && filteredTrips.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "upcoming"
                ? t("myTrips.empty.upcoming", "No upcoming trips")
                : activeTab === "past"
                ? t("myTrips.empty.past", "No past trips")
                : t("myTrips.empty.all", "No trips yet")}
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t("myTrips.empty.cta", "Book a deal to see your trips here")}</p>
            {activeTab !== "past" && (
              <button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg">
                {t("myTrips.browseDeals", "Browse deals")}
              </button>
            )}
          </div>
        )}


        {!loading && !error && filteredTrips.length > 0 && (
          <div className="space-y-6">
            {filteredTrips.map(trip => {
              const totalPax = trip.adultsCount + trip.childrenCount
              const isPast = new Date(trip.outbound.date) < now


              return (
                <div key={trip.tripId} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md ${isPast ? "opacity-80" : ""}`}>
                  <div className={`h-1 ${trip.status === "confirmed" ? "bg-gradient-to-r from-teal-500 to-teal-400" : "bg-gray-300"}`}/>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">{trip.outbound.from} ⇄ {trip.outbound.to}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(trip.outbound.date).toLocaleDateString(currentLocale || "en-GB", { day: "numeric", month: "short" })}
                          {trip.return && " – " + new Date(trip.return.date).toLocaleDateString(currentLocale || "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{totalPax} {totalPax === 1 ? t("myTrips.passenger", "passenger") : t("myTrips.passengers", "passengers")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {trip.paidWithPass && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">✈️ Pass</span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${trip.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {trip.status === "confirmed"
                            ? `✓ ${t("myTrips.status.confirmed", "Confirmed")}`
                            : t("myTrips.status.cancelled", "Cancelled")}
                        </span>
                      </div>
                    </div>


                    <div className="space-y-3 mb-4">
                      <FlightLeg
                        leg={trip.outbound}
                        label={`↗ ${t("myTrips.outbound", "Outbound")}`}
                        onCheckIn={() => setCheckInPanel(trip.outbound.ref === checkInPanel ? null : trip.outbound.ref)}
                        t={t}
                      />
                      {trip.return && (
                        <FlightLeg
                          leg={trip.return}
                          label={`↙ ${t("myTrips.return", "Return")}`}
                          onCheckIn={() => setCheckInPanel(trip.return!.ref === checkInPanel ? null : trip.return!.ref)}
                          t={t}
                        />
                      )}
                    </div>


                    {checkInPanel && (checkInPanel === trip.outbound.ref || checkInPanel === trip.return?.ref) && (
                      <CheckInPanel
                        bookingRef={checkInPanel}
                        onClose={() => setCheckInPanel(null)}
                        onSuccess={() => { setCheckInPanel(null); fetchTrips() }}
                        t={t}
                      />
                    )}


                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-400">
                        {t("myTrips.tripId", "Trip ID")}: <span className="font-mono">{trip.tripId}</span>
                      </div>
                      <div className="text-right">
                        {trip.paidWithPass
                          ? <div className="font-bold text-green-600">{t("myTrips.free", "Free (Pass)")}</div>
                          : <div className="font-bold text-gray-900">£{trip.totalPrice.toFixed(0)}</div>}
                        <div className="text-xs text-gray-400">{t("myTrips.totalPaid", "total paid")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}


        {!loading && trips.length > 0 && (
          <div className="mt-8 text-center">
            <button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg">
              {t("myTrips.browseDeals", "Browse more deals")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}



