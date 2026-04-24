"use client"


import { useState, useEffect, useMemo } from "react"
import { getTranslation } from "@lib/util/translations"


type Props = {
  currentLocale: string | null
  customerName: string | null
  customerEmail: string | null
  isLoggedIn: boolean
}


type PassengerData = {
  id: number
  firstName: string
  lastName: string
  middleName: string | null
  type: "adult" | "child"
  seat: string | null
  checkedIn: boolean
}


type BookingData = {
  id: number
  reference: string
  passengerName: string
  passengerEmail: string
  class: "economy" | "business"
  pricePaid: number
  status: string
  paidWithPass: boolean
  seat: string | null
  scheduleId: number
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  departureTime: string
  arrivalTime: string
  aircraftType: string
  departureDateTime: string
  hoursUntilDeparture: number
  canCheckIn: boolean
  checkInOpenAt: string
  checkInCloseAt: string
  gateCloseAt: string
  passengers: PassengerData[]
}


// ─── Seat Map ────────────────────────────────────────────────────────────────
const COLS_ECONOMY = ["A", "B", "C", "D", "E", "F"]
const COLS_BUSINESS = ["A", "B", "C", "D"]


function SeatMap({ flightClass, takenSeats, selectedSeat, onSelect }: {
  flightClass: "economy" | "business"
  takenSeats: string[]
  selectedSeat: string | null
  onSelect: (seat: string) => void
}) {
  const totalRows = flightClass === "business" ? 4 : 26
  const cols = flightClass === "business" ? COLS_BUSINESS : COLS_ECONOMY
  const startRow = flightClass === "business" ? 1 : 5


  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-6 mb-4 flex-wrap">
        {[
          { cls: "bg-teal-50 border-teal-300", label: "Available" },
          { cls: "bg-teal-600 border-teal-700", label: "Selected" },
          { cls: "bg-gray-200 border-gray-300", label: "Taken" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded border ${item.cls}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>


      <div className="flex justify-center mb-2">
        <div className="w-16 h-8 bg-teal-100 border border-teal-200 rounded-t-full flex items-center justify-center">
          <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
            <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
          </svg>
        </div>
      </div>


      <div className="flex items-center gap-1 mb-1 pl-8">
        {cols.map((col, i) => (
          <div key={col} className="flex items-center gap-1">
            {((flightClass === "economy" && i === 3) || (flightClass === "business" && i === 2)) && (
              <div className="w-5" />
            )}
            <div className="w-7 text-center text-xs font-semibold text-gray-400">{col}</div>
          </div>
        ))}
      </div>


      <div className="space-y-1">
        {Array.from({ length: totalRows }).map((_, i) => {
          const rowNum = startRow + i
          return (
            <div key={rowNum} className="flex items-center gap-1">
              <div className="w-7 text-right text-xs text-gray-400 pr-1 flex-shrink-0">{rowNum}</div>
              {cols.map((col, colIdx) => {
                const seatId = `${rowNum}${col}`
                const isTaken = takenSeats.includes(seatId)
                const isSelected = selectedSeat === seatId
                const showAisle = (flightClass === "economy" && colIdx === 2) || (flightClass === "business" && colIdx === 1)
                return (
                  <div key={seatId} className="flex items-center gap-1">
                    <button
                      disabled={isTaken}
                      onClick={() => onSelect(seatId)}
                      title={seatId}
                      className={`w-7 h-7 rounded border text-xs font-medium transition flex-shrink-0
                        ${isSelected ? "bg-teal-600 border-teal-700 text-white"
                          : isTaken ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                          : "bg-teal-50 border-teal-300 hover:bg-teal-200 hover:border-teal-500 cursor-pointer"}`}
                    />
                    {showAisle && <div className="w-5 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ─── Dynamic Timeline ─────────────────────────────────────────────────────────
function DynamicTimeline({ booking, t }: { booking: BookingData | null, t: (k: string, d: string) => string }) {
  const [now, setNow] = useState(new Date())


  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])


  const formatLeft = (iso: string) => {
    const diff = new Date(iso).getTime() - now.getTime()
    if (diff <= 0) return null
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h > 48) return `${Math.floor(h / 24)}d ${h % 24}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }


  const fmt = (iso: string) => new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  })


  if (!booking) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {[
          { time: t("checkIn.tl1time", "48h before"), label: t("checkIn.tl1label", "Online check-in opens"), sub: t("checkIn.tl1sub", "Choose your seat and check in from anywhere"), red: false },
          { time: t("checkIn.tl2time", "3h before"), label: t("checkIn.tl2label", "Airport check-in opens"), sub: t("checkIn.tl2sub", "Desks open at the departure terminal"), red: false },
          { time: t("checkIn.tl3time", "1h before"), label: t("checkIn.tl3label", "Check-in closes"), sub: t("checkIn.tl3sub", "All check-in methods close"), red: true },
          { time: t("checkIn.tl4time", "45min before"), label: t("checkIn.tl4label", "Gate closes"), sub: t("checkIn.tl4sub", "Board before the gate closes"), red: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="text-teal-700 font-medium text-sm w-28 flex-shrink-0">{item.time}</div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.red ? "bg-red-400" : "bg-teal-500"}`} />
            <div>
              <div className={`text-sm font-medium ${item.red ? "text-red-500" : "text-gray-900"}`}>{item.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }


  const items = [
    { iso: booking.checkInOpenAt, label: t("checkIn.tl1label", "Online check-in opens"), red: false },
    { iso: booking.departureDateTime, label: "Departure", red: false },
    { iso: booking.checkInCloseAt, label: t("checkIn.tl3label", "Check-in closes"), red: true },
    { iso: booking.gateCloseAt, label: t("checkIn.tl4label", "Gate closes"), red: true },
  ]


  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
      {items.map((item, i) => {
        const isPast = now > new Date(item.iso)
        const left = formatLeft(item.iso)
        return (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${isPast ? "opacity-40" : ""}`}>
            <div className="text-teal-700 font-medium text-xs w-28 flex-shrink-0">{fmt(item.iso)}</div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPast ? "bg-gray-300" : item.red ? "bg-red-400" : "bg-teal-500"}`} />
            <div className="flex-1">
              <div className={`text-sm font-medium ${isPast ? "text-gray-400" : item.red ? "text-red-500" : "text-gray-900"}`}>{item.label}</div>
            </div>
            {!isPast && left && (
              <div className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${item.red ? "bg-red-50 text-red-500" : "bg-teal-50 text-teal-600"}`}>
                {left}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CheckInClient({ currentLocale, customerName, isLoggedIn }: Props) {
  const t = useMemo(() => (key: string, def: string) => getTranslation(currentLocale, key) || def, [currentLocale])


  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bookingRef, setBookingRef] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [takenSeats, setTakenSeats] = useState<string[]>([])
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [seatLoading, setSeatLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentPassengerIdx, setCurrentPassengerIdx] = useState(0)


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/check-in/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingRef, lastName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === "Booking not found"
          ? t("checkIn.notFound", "Booking not found. Check your reference and last name.")
          : t("checkIn.serverError", "Something went wrong. Please try again."))
        return
      }
      setBooking({ ...data.booking, passengers: data.booking.passengers || [] })
      if (!data.booking.canCheckIn) {
        const h = data.booking.hoursUntilDeparture
        setError(h > 48
          ? `Check-in is not open yet. Opens in ${Math.round(h - 48)}h.`
          : "Check-in is closed for this flight.")
        return
      }
      if (data.booking.status === "checked_in") { setStep(3); return }
      const seatsRes = await fetch(`/api/check-in/seat?scheduleId=${data.booking.scheduleId}`)
      const seatsData = await seatsRes.json()
      setTakenSeats(seatsData.takenSeats || [])
      setStep(2)
    } catch { setError(t("checkIn.serverError", "Something went wrong.")) }
    finally { setLoading(false) }
  }


  const handleConfirmSeat = async () => {
    if (!selectedSeat || !booking) return
    setSeatLoading(true)


    const passengers = booking.passengers || []
    const currentPassenger = passengers[currentPassengerIdx]
    const passengerId = currentPassenger?.id


    try {
      const res = await fetch("/api/check-in/seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          passengerId: passengerId || null,
          seat: selectedSeat,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === "Seat already taken") {
          setTakenSeats(prev => [...prev, selectedSeat])
          setSelectedSeat(null)
          setError(t("checkIn.seatTaken", "This seat was just taken. Choose another."))
        } else { setError(t("checkIn.serverError", "Something went wrong.")) }
        return
      }


      // Оновлюємо місце поточного пасажира
      setBooking(prev => {
        if (!prev) return prev
        const updatedPassengers = prev.passengers.map((p, i) =>
          i === currentPassengerIdx ? { ...p, seat: selectedSeat, checkedIn: true } : p
        )
        const allChecked = updatedPassengers.every(p => p.checkedIn)
        return {
          ...prev,
          seat: selectedSeat,
          status: allChecked ? "checked_in" : prev.status,
          passengers: updatedPassengers
        }
      })


      const nextIdx = currentPassengerIdx + 1
      if (nextIdx < passengers.length) {
        // Є ще пасажири — реєструємо наступного
        setCurrentPassengerIdx(nextIdx)
        setSelectedSeat(null)
        setError("")
      } else {
        // Всі зареєстровані
        setStep(3)
      }
    } catch { setError(t("checkIn.serverError", "Something went wrong.")) }
    finally { setSeatLoading(false) }
  }


  const faqItems = [
    { q: t("checkIn.faq1", "Can I change my seat after check-in?"), a: "Yes, you can change your seat up to 1 hour before departure by checking in again." },
    { q: t("checkIn.faq2", "What if I miss the check-in window?"), a: "You can still check in at the airport up to 1 hour before departure." },
    { q: t("checkIn.faq3", "How do I get my boarding pass?"), a: "After selecting your seat, your boarding pass will be shown on screen and emailed to you." },
    { q: t("checkIn.faq4", "Can I check in for someone else?"), a: "Yes, enter the booking reference and the passenger's last name." },
  ]


  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-teal-700 text-white px-6 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4 text-teal-200 text-sm tracking-widest uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("checkIn.badge", "Online check-in")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-3 tracking-tight leading-tight">
            {t("checkIn.heroTitle", "Skip the queue.")}<br />
            {t("checkIn.heroTitle2", "Check in online.")}
          </h1>
          <p className="text-teal-200">{t("checkIn.heroSub", "Available from 48 hours to 1 hour before departure")}</p>
        </div>
      </div>


      <div className="px-4 sm:px-6">
        {/* MAIN CARD */}
        <div className="max-w-3xl mx-auto -mt-10 relative z-10 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">


          {/* Steps */}
          <div className="flex items-center mb-8">
            {[t("checkIn.step1","Find booking"), t("checkIn.step2","Choose seat"), t("checkIn.step3","Boarding pass")].map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                {i > 0 && <div className={`flex-1 h-px mx-2 ${step > i ? "bg-teal-500" : "bg-gray-200"}`} />}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${step === i+1 ? "bg-teal-700 text-white" : step > i+1 ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"}`}>
                    {step > i+1 ? "✓" : i+1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? "text-teal-700" : "text-gray-400"}`}>{label}</span>
                </div>
              </div>
            ))}
          </div>


          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("checkIn.bookingRef","Booking reference")}</label>
                  <input type="text" value={bookingRef} onChange={e => setBookingRef(e.target.value.toUpperCase())}
                    placeholder="GW-XXXXXX" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-mono" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("checkIn.lastName","Last name")}</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder={t("checkIn.lastNamePlaceholder","As on your passport")} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
              </div>


              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}


              <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("checkIn.hint","Check-in opens 48h and closes 1h before departure")}
              </div>


              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-4 rounded-xl transition text-base">
                {loading ? "Searching..." : t("checkIn.searchBtn","Find my booking →")}
              </button>


              {isLoggedIn && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  {t("checkIn.loggedInHint","Signed in as")} <span className="text-teal-600 font-medium">{customerName}</span>
                </p>
              )}
            </form>
          )}


          {/* STEP 2 */}
          {step === 2 && booking && (
            <div>
              <div className="bg-teal-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-teal-600 font-medium mb-1">{booking.flightNumber}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">{booking.departureAirport}</span>
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="text-2xl font-bold text-gray-900">{booking.arrivalAirport}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(booking.departureDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{booking.departureTime.slice(0,5)} – {booking.arrivalTime.slice(0,5)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{booking.passengerName}</div>
                    <div className="text-sm font-semibold text-teal-700 capitalize mt-1">{booking.class}</div>
                    <div className="text-xs text-gray-400">{booking.aircraftType}</div>
                  </div>
                </div>
              </div>


              {/* Показуємо прогрес по пасажирах якщо їх більше 1 */}
              {booking.passengers && booking.passengers.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xs text-blue-700 font-medium mb-2">
                    Passenger {currentPassengerIdx + 1} of {booking.passengers.length}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {booking.passengers[currentPassengerIdx]?.firstName} {booking.passengers[currentPassengerIdx]?.lastName}
                    {booking.passengers[currentPassengerIdx]?.type === "child" && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Child</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {booking.passengers.map((p, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentPassengerIdx ? "bg-teal-500" : i === currentPassengerIdx ? "bg-teal-300" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              )}


              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("checkIn.selectSeat","Select your seat")}</h3>


              <SeatMap flightClass={booking.class} takenSeats={takenSeats} selectedSeat={selectedSeat} onSelect={setSelectedSeat} />


              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mt-4">{error}</div>}


              <div className="flex gap-3 mt-6">
                <button onClick={() => { setStep(1); setError("") }}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">
                  ← {t("checkIn.back","Back")}
                </button>
                <button onClick={handleConfirmSeat} disabled={!selectedSeat || seatLoading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 text-white font-semibold py-3 rounded-xl transition text-sm">
                  {seatLoading ? t("checkIn.confirming","Confirming...") : selectedSeat ? `${t("checkIn.confirmSeat","Confirm seat")} ${selectedSeat}` : t("checkIn.selectSeatBtn","Select a seat to continue")}
                </button>
              </div>
            </div>
          )}


          {/* STEP 3 — BOARDING PASS */}
          {step === 3 && booking && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t("checkIn.checkedIn","You're checked in!")}</h2>
                <p className="text-sm text-gray-500">{t("checkIn.boardingPassReady","Your boarding pass is ready")}</p>
              </div>


              {/* Якщо є кілька пасажирів — окремий boarding pass для кожного */}
              {booking.passengers && booking.passengers.length > 1 ? (
                <div className="space-y-4">
                  {booking.passengers.map((passenger, idx) => (
                    <div key={idx} className="bg-teal-700 rounded-3xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="text-teal-200 text-xs uppercase tracking-wider">GreenWing · {booking.flightNumber}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-teal-200 text-xs">{passenger.type === "child" ? "Child" : `Adult ${idx + 1}`}</span>
                          <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-semibold">Boarding Pass</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div>
                          <div className="text-4xl font-bold">{booking.departureAirport}</div>
                          <div className="text-teal-200 text-sm mt-1">{booking.departureTime.slice(0,5)}</div>
                        </div>
                        <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                          <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                        </svg>
                        <div className="text-right">
                          <div className="text-4xl font-bold">{booking.arrivalAirport}</div>
                          <div className="text-teal-200 text-sm mt-1">{booking.arrivalTime.slice(0,5)}</div>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-white/30 mb-4" />
                      <div className="grid grid-cols-3 gap-4 relative z-10 text-sm">
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.passenger","Passenger")}</div><div className="font-semibold text-sm">{passenger.firstName} {passenger.lastName}</div></div>
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.date","Date")}</div><div className="font-semibold text-sm">{new Date(booking.departureDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div></div>
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.seat","Seat")}</div><div className="font-bold text-xl">{passenger.seat || "—"}</div></div>
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.class","Class")}</div><div className="font-semibold capitalize">{booking.class}</div></div>
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.ref","Booking ref")}</div><div className="font-mono font-semibold">{booking.reference}</div></div>
                        <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.status","Status")}</div><div className={`font-semibold ${passenger.checkedIn ? "text-green-300" : "text-yellow-300"}`}>{passenger.checkedIn ? "✓ Checked in" : "⏳ Pending"}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-teal-700 rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="text-teal-200 text-xs uppercase tracking-wider">GreenWing · {booking.flightNumber}</div>
                    <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-semibold">Boarding Pass</div>
                  </div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                      <div className="text-4xl font-bold">{booking.departureAirport}</div>
                      <div className="text-teal-200 text-sm mt-1">{booking.departureTime.slice(0,5)}</div>
                    </div>
                    <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                      <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                    </svg>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{booking.arrivalAirport}</div>
                      <div className="text-teal-200 text-sm mt-1">{booking.arrivalTime.slice(0,5)}</div>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-white/30 mb-4" />
                  <div className="grid grid-cols-3 gap-4 relative z-10 text-sm">
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.passenger","Passenger")}</div><div className="font-semibold text-sm">{booking.passengerName}</div></div>
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.date","Date")}</div><div className="font-semibold text-sm">{new Date(booking.departureDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div></div>
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.seat","Seat")}</div><div className="font-bold text-xl">{booking.seat || "—"}</div></div>
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.class","Class")}</div><div className="font-semibold capitalize">{booking.class}</div></div>
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.ref","Booking ref")}</div><div className="font-mono font-semibold">{booking.reference}</div></div>
                    <div><div className="text-teal-300 text-xs mb-1">{t("checkIn.status","Status")}</div><div className="font-semibold text-green-300">✓ Checked in</div></div>
                  </div>
                </div>
              )}


              <button
                onClick={() => {
                  const win = window.open("", "_blank", "width=720,height=860")
                  if (!win) return
                  // Генеруємо HTML для кожного пасажира
                  const passengersToPrint = booking.passengers && booking.passengers.length > 0
                    ? booking.passengers
                    : [{ firstName: booking.passengerName.split(" ")[0], lastName: booking.passengerName.split(" ").slice(1).join(" "), seat: booking.seat, checkedIn: true, type: "adult" as const, id: 0, middleName: null }]


                  const passesHTML = passengersToPrint.map((p, idx) => `
  <div class="pass" style="${idx > 0 ? 'margin-top: 2rem; page-break-before: auto;' : ''}">
    <div class="pass-top">
      <span>GREENWING · ${booking.flightNumber}</span>
      <span class="badge">Boarding Pass ${passengersToPrint.length > 1 ? `· ${idx + 1}/${passengersToPrint.length}` : ''}</span>
    </div>
    <div class="route">
      <div>
        <div class="airport-code">${booking.departureAirport}</div>
        <div class="airport-time">${booking.departureTime.slice(0,5)}</div>
      </div>
      <div class="plane">✈</div>
      <div class="right">
        <div class="airport-code">${booking.arrivalAirport}</div>
        <div class="airport-time">${booking.arrivalTime.slice(0,5)}</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="details">
      <div><div class="lbl">Passenger</div><div class="val">${p.firstName} ${p.lastName}</div></div>
      <div><div class="lbl">Date</div><div class="val">${new Date(booking.departureDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div></div>
      <div><div class="lbl">Seat</div><div class="val val-seat">${p.seat || "—"}</div></div>
      <div><div class="lbl">Class</div><div class="val" style="text-transform:capitalize">${booking.class}</div></div>
      <div><div class="lbl">Booking ref</div><div class="val val-mono">${booking.reference}</div></div>
      <div><div class="lbl">Status</div><div class="val val-status">${p.checkedIn ? "✓ Checked in" : "⏳ Pending"}</div></div>
    </div>
  </div>`).join("")


                  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Boarding Pass | GreenWing</title>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f9fafb; padding: 2rem; }
    .header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .logo { color: #075951; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
    .tagline { color: #6b7280; font-size: 0.82rem; }
    .pass { background: #075951; border-radius: 20px; padding: 1.75rem 2rem; color: white; }
    .pass-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.7); }
    .badge { background: rgba(255,255,255,0.2); border-radius: 8px; padding: 4px 14px; font-weight: 600; color: white; font-size: 0.75rem; }
    .route { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .airport-code { font-size: 3.5rem; font-weight: 700; line-height: 1; }
    .airport-time { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 6px; }
    .plane { font-size: 2rem; color: rgba(255,255,255,0.5); }
    .right { text-align: right; }
    .divider { border-top: 1px dashed rgba(255,255,255,0.3); margin: 0 0 1.25rem; }
    .details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .lbl { color: rgba(255,255,255,0.6); font-size: 0.7rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .val { font-weight: 600; font-size: 0.95rem; }
    .val-seat { font-size: 1.6rem; font-weight: 700; }
    .val-mono { font-family: monospace; }
    .val-status { color: #86efac; }
    .footer { text-align: center; margin-top: 1.75rem; color: #9ca3af; font-size: 0.78rem; line-height: 1.8; }
    @media print { body { padding: 1rem; } .pass { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">✈ GreenWing — Online Check-in</div>
    <div class="tagline">Без черг. Реєструйся онлайн. | greenwing.com</div>
  </div>
  ${passesHTML}
  <div class="footer">
    <p>Будьте біля гейту щонайменше за 45 хвилин до вильоту.</p>
    <p>Роздруковано: ${new Date().toLocaleDateString("uk-UA")} · greenwing.com</p>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`)
                  win.document.close()
                }}
                className="w-full mt-4 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition text-sm"
              >
                {t("checkIn.print","Print boarding pass")}
              </button>
            </div>
          )}
        </div>


        {/* TIMELINE */}
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("checkIn.timelineTitle","Check-in timeline")}</h2>
          <DynamicTimeline booking={booking} t={t} />
        </div>


        {/* WHAT YOU NEED */}
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("checkIn.needTitle","What you need to check in")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "📋", title: t("checkIn.need1","Booking reference"), desc: t("checkIn.need1desc","Your GW- code from the confirmation email") },
              { icon: "🪪", title: t("checkIn.need2","Passport or ID"), desc: t("checkIn.need2desc","Valid document matching the name on booking") },
              { icon: "🛂", title: t("checkIn.need3","Visa (if required)"), desc: t("checkIn.need3desc","Check visa requirements for your destination") },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>


        {/* BAGGAGE */}
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("checkIn.baggageTitle","Baggage allowance")}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500">
              <span>{t("checkIn.bagItem","Item")}</span>
              <span>{t("checkIn.bagEconomy","Economy")}</span>
              <span>{t("checkIn.bagBusiness","Business")}</span>
            </div>
            {[
              { label: t("checkIn.bagCarry","Carry-on"), eco: "1 × 10kg", biz: "2 × 10kg" },
              { label: t("checkIn.bagChecked","Checked bag"), eco: "1 × 23kg", biz: "2 × 32kg" },
              { label: "GreenWing Pass", eco: "+20kg free", biz: "+20kg free", hl: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 px-5 py-3.5 border-t border-gray-100 text-sm">
                <span className="font-medium text-gray-900">{row.label}</span>
                <span className={row.hl ? "text-teal-600 font-semibold" : "text-gray-600"}>{row.eco}</span>
                <span className={row.hl ? "text-teal-600 font-semibold" : "text-gray-600"}>{row.biz}</span>
              </div>
            ))}
          </div>
        </div>


        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("checkIn.faqTitle","Common questions")}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {faqItems.map((item, i) => (
              <div key={i}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left">
                  <span className="text-sm font-medium text-gray-900">{item.q}</span>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

