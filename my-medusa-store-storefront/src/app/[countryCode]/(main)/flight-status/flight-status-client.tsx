"use client"


import { useState, useEffect, useMemo, useCallback } from "react"
import { getTranslation } from "@lib/util/translations"


type Props = {
  currentLocale: string | null
  customerName: string | null
  customerEmail: string | null
  isLoggedIn: boolean
}


type FlightStatus = {
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  scheduledDeparture: string
  scheduledArrival: string
  estimatedDeparture: string
  estimatedArrival: string
  actualDeparture: string | null
  actualArrival: string | null
  delayMinutes: number
  status: "scheduled" | "delayed" | "in_air" | "landed" | "cancelled"
  gate: string | null
  terminal: string | null
  aircraft: string
  durationMinutes: number
  availableSeatsEconomy: number
  availableSeatsBusiness: number
  progress: number
}


type BoardFlight = {
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  scheduledTime: string
  estimatedTime: string
  delayMinutes: number
  status: string
  gate: string | null
  terminal: string | null
  aircraft: string
  operator: string
  scheduleId: number
}


const STATUS_KEYS: Record<string, string> = {
  scheduled: "flightStatus.status.scheduled",
  delayed:   "flightStatus.status.delayed",
  in_air:    "flightStatus.status.in_air",
  landed:    "flightStatus.status.landed",
  cancelled: "flightStatus.status.cancelled",
}


const STATUS_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  scheduled: { color: "text-blue-600",   bg: "bg-blue-50",   dot: "bg-blue-400" },
  delayed:   { color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-400" },
  in_air:    { color: "text-teal-600",   bg: "bg-teal-50",   dot: "bg-teal-400" },
  landed:    { color: "text-green-600",  bg: "bg-green-50",  dot: "bg-green-400" },
  cancelled: { color: "text-red-600",    bg: "bg-red-50",    dot: "bg-red-400" },
}


const AIRPORTS = ["LDN","PAR","BER","AMS","MAD","BCN","ROM","VIE","KBP","WAW","BUD","DUB","ZUR","BRU","LIS","ATH","PRG","STO","CPH","OSL","HEL"]


// ─── Live Board ───────────────────────────────────────────────────────────────
function LiveBoard({ t }: { t: (key: string, def: string) => string }) {
  const [boardType, setBoardType] = useState<"departures" | "arrivals">("departures")
  const [airport, setAirport] = useState("LDN")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [flights, setFlights] = useState<BoardFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [secondsLeft, setSecondsLeft] = useState(30)


  const fetchBoard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`/api/flights/board?type=${boardType}&airport=${airport}&date=${date}`)
      const data = await res.json()
      if (data.flights) {
        setFlights(data.flights)
        setLastUpdate(new Date())
        setSecondsLeft(30)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [boardType, airport, date])


  useEffect(() => { fetchBoard() }, [fetchBoard])
  useEffect(() => {
    const interval = setInterval(() => fetchBoard(true), 30000)
    return () => clearInterval(interval)
  }, [fetchBoard])
  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [lastUpdate])


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("flightStatus.liveBoard.title", "Live departures & arrivals")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("flightStatus.liveBoard.subtitle", "All GreenWing flights · updates every 30 seconds")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{t("flightStatus.liveBoard.live", "Live")} · {secondsLeft}s</span>
        </div>
      </div>


      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {(["departures","arrivals"] as const).map(type => (
            <button key={type} onClick={() => setBoardType(type)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${boardType === type ? "bg-teal-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
              ✈ {type === "departures" ? t("flightStatus.liveBoard.departures", "Departures") : t("flightStatus.liveBoard.arrivals", "Arrivals")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">{t("flightStatus.liveBoard.airport", "Airport")}</span>
          <select value={airport} onChange={e => setAirport(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer">
            {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">{t("flightStatus.liveBoard.date", "Date")}</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer" />
        </div>
        <button onClick={() => fetchBoard()}
          className="ml-auto flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t("flightStatus.liveBoard.refresh", "Refresh")}
        </button>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-2">{t("flightStatus.liveBoard.time", "Time")}</div>
          <div className="col-span-3">{boardType === "departures" ? t("flightStatus.liveBoard.destination", "Destination") : t("flightStatus.liveBoard.origin", "Origin")}</div>
          <div className="col-span-2">{t("flightStatus.liveBoard.flight", "Flight")}</div>
          <div className="col-span-2">{t("flightStatus.liveBoard.aircraft", "Aircraft")}</div>
          <div className="col-span-1 text-center">{t("flightStatus.liveBoard.gate", "Gate")}</div>
          <div className="col-span-1 text-center">{t("flightStatus.liveBoard.delay", "Delay")}</div>
          <div className="col-span-1 text-right">{t("flightStatus.liveBoard.status", "Status")}</div>
        </div>


        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 opacity-20">✈</div>
            <div className="font-medium text-gray-400">{t("flightStatus.liveBoard.noFlights", "No flights for this selection")}</div>
            <div className="text-sm text-gray-300 mt-1">{t("flightStatus.liveBoard.noFlightsSub", "Try a different airport or date")}</div>
          </div>
        ) : (
          flights.map((flight, i) => {
            const style = STATUS_STYLE[flight.status] || STATUS_STYLE.scheduled
            const statusLabel = t(STATUS_KEYS[flight.status] || "flightStatus.status.scheduled", flight.status)
            const isDep = boardType === "departures"
            const destination = isDep ? flight.arrivalAirport : flight.departureAirport
            const estimatedFmt = new Date(flight.estimatedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
            const isDelayed = flight.delayMinutes > 0
            return (
              <div key={i} className={`grid grid-cols-12 items-center px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition ${i === flights.length - 1 ? "border-b-0" : ""}`}>
                <div className="col-span-2">
                  <div className={`font-bold text-base font-mono ${isDelayed ? "text-orange-500" : "text-gray-900"}`}>
                    {isDelayed ? estimatedFmt : flight.scheduledTime}
                  </div>
                  {isDelayed && <div className="text-xs text-gray-400 line-through font-mono">{flight.scheduledTime}</div>}
                </div>
                <div className="col-span-3"><div className="font-semibold text-gray-900 text-sm">{destination}</div></div>
                <div className="col-span-2"><div className="font-mono font-bold text-teal-700 text-sm">{flight.flightNumber}</div></div>
                <div className="col-span-2"><div className="text-sm text-gray-500">{flight.aircraft}</div></div>
                <div className="col-span-1 text-center"><div className="font-bold text-gray-900 text-sm">{flight.gate || "—"}</div></div>
                <div className="col-span-1 text-center">
                  {isDelayed
                    ? <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">+{flight.delayMinutes}m</span>
                    : <span className="text-xs text-gray-300">{t("flightStatus.liveBoard.onTime", "On time")}</span>}
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className={`text-xs font-semibold flex items-center gap-1.5 ${style.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${flight.status === "in_air" ? "animate-pulse" : ""}`} />
                    {statusLabel}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="text-xs text-gray-400 mt-2 text-right">
        {flights.length} {t("flightStatus.liveBoard.flight", "flights")} · {t("flightStatus.liveBoard.lastUpdated", "Last updated")} {lastUpdate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
    </div>
  )
}


// ─── Flight Progress Map ──────────────────────────────────────────────────────
function FlightProgressMap({ flight, t }: { flight: FlightStatus; t: (k: string, d: string) => string }) {
  const isInAir = flight.status === "in_air"
  const isLanded = flight.status === "landed"
  return (
    <div className="py-6 px-2">
      <div className="flex items-center">
        <div className="flex flex-col items-center flex-shrink-0 w-20">
          <div className={`w-3 h-3 rounded-full border-2 ${isInAir || isLanded ? "border-teal-600 bg-teal-600" : "border-gray-300 bg-white"}`} />
          <div className="font-bold text-gray-900 mt-2 text-sm">{flight.departureAirport}</div>
          <div className="text-xs text-gray-400">{flight.scheduledDeparture}</div>
          {flight.delayMinutes > 0 && <div className="text-xs text-orange-500 font-medium">+{flight.delayMinutes}m</div>}
        </div>
        <div className="flex-1 mx-2 relative">
          <div className="h-0.5 bg-gray-200 w-full rounded" />
          {(isInAir || isLanded) && (
            <div className="absolute top-0 left-0 h-0.5 bg-teal-500 rounded transition-all duration-1000" style={{ width: `${flight.progress}%` }} />
          )}
          {isInAir && (
            <div className="absolute -top-3 transition-all duration-1000" style={{ left: `calc(${flight.progress}% - 10px)` }}>
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
              </svg>
            </div>
          )}
          {isInAir && (
            <div className="text-center mt-3 text-xs text-teal-600 font-semibold">{flight.progress}% {t("flightStatus.flightCard.complete", "complete")}</div>
          )}
        </div>
        <div className="flex flex-col items-center flex-shrink-0 w-20 text-right">
          <div className={`w-3 h-3 rounded-full border-2 ${isLanded ? "border-green-600 bg-green-600" : "border-gray-300 bg-white"}`} />
          <div className="font-bold text-gray-900 mt-2 text-sm">{flight.arrivalAirport}</div>
          <div className="text-xs text-gray-400">{flight.scheduledArrival}</div>
          {flight.actualArrival && <div className="text-xs text-green-500 font-medium">Actual: {flight.actualArrival}</div>}
        </div>
      </div>
    </div>
  )
}


// ─── Flight Card ──────────────────────────────────────────────────────────────
function FlightCard({ flight, t }: { flight: FlightStatus; t: (k: string, d: string) => string }) {
  const [now, setNow] = useState(new Date())
  const style = STATUS_STYLE[flight.status] || STATUS_STYLE.scheduled
  const statusLabel = t(STATUS_KEYS[flight.status] || "flightStatus.status.scheduled", flight.status)


  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])


  const timeUntil = useMemo(() => {
    const dep = new Date(flight.estimatedDeparture)
    const diff = dep.getTime() - now.getTime()
    if (diff <= 0) return null
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }, [flight.estimatedDeparture, now])


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`h-1 ${flight.status === "in_air" ? "bg-gradient-to-r from-teal-400 to-teal-600" : flight.status === "landed" ? "bg-green-500" : flight.status === "delayed" ? "bg-orange-500" : flight.status === "cancelled" ? "bg-red-500" : "bg-blue-400"}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900">{flight.flightNumber}</div>
            <div className="text-sm text-gray-400">{flight.aircraft}</div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${style.bg} ${style.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${flight.status === "in_air" ? "animate-pulse" : ""}`} />
            {statusLabel}
          </span>
        </div>
        <FlightProgressMap flight={flight} t={t} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-400 mb-1">{t("flightStatus.flightCard.date", "Date")}</div>
            <div className="font-semibold text-gray-900 text-sm">
              {new Date(flight.departureDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">{t("flightStatus.flightCard.duration", "Duration")}</div>
            <div className="font-semibold text-gray-900 text-sm">
              {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60 > 0 ? flight.durationMinutes % 60 + "m" : ""}
            </div>
          </div>
          {flight.terminal && <div><div className="text-xs text-gray-400 mb-1">{t("flightStatus.flightCard.terminal", "Terminal")}</div><div className="font-bold text-gray-900">{flight.terminal}</div></div>}
          {flight.gate && <div><div className="text-xs text-gray-400 mb-1">{t("flightStatus.flightCard.gate", "Gate")}</div><div className="font-bold text-teal-600">{flight.gate}</div></div>}
        </div>
        {flight.delayMinutes > 0 && flight.status !== "landed" && (
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="text-sm text-orange-700">
              {t("flightStatus.flightCard.delayedBy", "Delayed by")} {flight.delayMinutes} {t("flightStatus.flightCard.min", "min")} · {t("flightStatus.flightCard.newDeparture", "New departure")}: {new Date(flight.estimatedDeparture).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )}
        {flight.status === "scheduled" && timeUntil && (
          <div className="mt-4 bg-teal-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-teal-700 font-medium">{t("flightStatus.flightCard.departsIn", "Departs in")}</span>
            <span className="text-lg font-bold text-teal-600">{timeUntil}</span>
          </div>
        )}
        {flight.status === "cancelled" && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            <div className="text-sm text-red-700">{t("flightStatus.flightCard.cancelled", "This flight has been cancelled. Contact GreenWing support.")}</div>
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Notify Section ───────────────────────────────────────────────────────────
function FlightNotifySection({ isLoggedIn, customerEmail, t }: { isLoggedIn: boolean; customerEmail: string | null; t: (k: string, d: string) => string }) {
  const [email, setEmail] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")


  useEffect(() => {
    if (customerEmail) setEmail(customerEmail)
  }, [customerEmail])


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/flights/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, flightNumber: flightNumber.trim().toUpperCase(), flightDate }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error === "Flight not found for this date" ? t("flightStatus.notify.notFound", "Flight not found for this date") : t("flightStatus.notify.error", "Something went wrong. Try again.")); return }
      setSuccess(true)
    } catch {
      setError(t("flightStatus.notify.error", "Something went wrong. Try again."))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("flightStatus.notify.title", "Get flight notifications")}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t("flightStatus.notify.subtitle", "We'll email you if your flight is delayed or cancelled")}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-base">{t("flightStatus.notify.alertTitle", "Real-time alerts")}</div>
            <div className="text-teal-100 text-sm mt-0.5">{t("flightStatus.notify.alertDesc", "Get notified instantly when your flight status changes")}</div>
          </div>
        </div>
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-1">{t("flightStatus.notify.successTitle", "You're subscribed!")}</div>
              <div className="text-sm text-gray-500">{t("flightStatus.notify.successDesc", "We'll send updates to")} <strong>{email}</strong> {t("flightStatus.notify.successFlight", "for flight")} <strong>{flightNumber}</strong></div>
              <button onClick={() => { setSuccess(false); setFlightNumber("") }}
                className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t("flightStatus.notify.trackAnother", "Track another flight →")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.notify.flightNumber", "Flight number")}</label>
                  <input type="text" value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())}
                    placeholder={t("flightStatus.notify.flightNumberPlaceholder", "e.g. GW100")} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.notify.flightDate", "Flight date")}</label>
                  <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {t("flightStatus.notify.email", "Email address")}
                  {isLoggedIn && <span className="ml-2 text-teal-600">{t("flightStatus.notify.emailFromAccount", "· from your account")}</span>}
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
              </div>
              {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("flightStatus.notify.hint", "You'll receive an email when the flight status changes")}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {t("flightStatus.notify.subscribing", "Subscribing...")}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {t("flightStatus.notify.submitBtn", "Notify me about this flight")}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FlightStatusClient({ currentLocale, customerName, customerEmail, isLoggedIn }: Props) {
  const t = useMemo(() => (key: string, def: string) => getTranslation(currentLocale, key) || def, [currentLocale])


  const [searchType, setSearchType] = useState<"number" | "route">("number")
  const [flightNumber, setFlightNumber] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState<FlightStatus[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSearched(true)
    try {
      let url = `/api/flights/status?date=${date}`
      if (searchType === "number") {
        if (!flightNumber.trim()) { setError(t("flightStatus.search.enterFlight", "Enter a flight number")); setLoading(false); return }
        url += `&flightNumber=${encodeURIComponent(flightNumber.trim())}`
      } else {
        if (!from.trim() || !to.trim()) { setError(t("flightStatus.search.enterAirports", "Enter airports")); setLoading(false); return }
        url += `&from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); return }
      setFlights(data.flights || [])
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-700 text-white px-6 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3 text-teal-200 text-xs tracking-widest uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t("flightStatus.badge", "Flight Status")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-2 tracking-tight">{t("flightStatus.heroTitle", "Track your flight")}</h1>
          <p className="text-teal-200 text-sm">{t("flightStatus.heroSub", "Real-time updates for all GreenWing flights")}</p>
        </div>
      </div>


      <div className="px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-12">


          <LiveBoard t={t} />


          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t("flightStatus.search.title", "Search specific flight")}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t("flightStatus.search.subtitle", "Track by flight number, booking reference or route")}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
                {[{ key: "number", label: t("flightStatus.search.byNumber", "By flight number") }, { key: "route", label: t("flightStatus.search.byRoute", "By route") }].map(tab => (
                  <button key={tab.key} onClick={() => setSearchType(tab.key as any)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${searchType === tab.key ? "bg-white text-teal-700 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="space-y-4">
                {searchType === "number" ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.search.flightNumberLabel", "Flight number or booking reference")}</label>
                    <input type="text" value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())}
                      placeholder={t("flightStatus.search.flightNumberPlaceholder", "e.g. GW100 or GW-DKR5K")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-mono" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.search.from", "From")}</label>
                      <input type="text" value={from} onChange={e => setFrom(e.target.value.toUpperCase())} placeholder="LDN" maxLength={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-mono uppercase" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.search.to", "To")}</label>
                      <input type="text" value={to} onChange={e => setTo(e.target.value.toUpperCase())} placeholder="PAR" maxLength={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-mono uppercase" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("flightStatus.search.dateLabel", "Date")}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
                {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-4 rounded-xl transition">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {t("flightStatus.search.searching", "Searching...")}
                    </span>
                  ) : t("flightStatus.search.trackBtn", "Track flight →")}
                </button>
              </form>
            </div>
            {searched && !loading && (
              <div className="mt-6">
                {flights.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-5xl mb-3 opacity-20">✈</div>
                    <div className="font-semibold text-gray-700">{t("flightStatus.search.noFlights", "No flights found")}</div>
                    <div className="text-sm text-gray-400 mt-1">{t("flightStatus.search.noFlightsSub", "Check the flight number or route and try again")}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400">{flights.length} {t("flightStatus.search.flightsFound", "flight found")}</div>
                    {flights.map((flight, i) => <FlightCard key={i} flight={flight} t={t} />)}
                  </div>
                )}
              </div>
            )}
          </div>


          <FlightNotifySection isLoggedIn={isLoggedIn} customerEmail={customerEmail} t={t} />


        </div>
      </div>
    </div>
  )
}

