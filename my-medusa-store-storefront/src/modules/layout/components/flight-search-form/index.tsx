"use client"


import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Airport, searchAirports } from "./airports-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"


// ── Autocomplete ──────────────────────────────────────────────
interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  currentLocale: string | null
  externalReset?: number
  className?: string
}


function AutocompleteInput({ value, onChange, placeholder, currentLocale, externalReset, className = "" }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (value) {
      const airport = searchAirports("").find(a => a.code === value)
      if (airport) setSearchQuery(translateCity(airport.city, currentLocale))
    } else {
      setSearchQuery("")
    }
  }, [value, externalReset])


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  useEffect(() => {
    setFilteredAirports(searchAirports(searchQuery).slice(0, 8))
  }, [searchQuery])


  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M8.90723 5.00782L10.4042 9.28154L15.0654 9.36373L11.7309 5.65945C11.3494 5.27787 10.9795 4.9726 10.6566 5.00195H8.90723V5.00782Z" fill="#075951" />
          <path d="M1 8.1543H2.59677C3.58302 8.5124 4.15832 9.45755 4.59861 10.5084H20.719C23.572 11.0954 23.8714 12.9211 20.9186 13.4671H16.3102L11.7195 18.9501C11.379 19.2789 11.0327 19.502 10.6922 19.5548H8.90755L10.9622 13.4612L4.45185 13.4964C3.50083 13.379 2.72005 12.5572 2.00972 11.4124L1 8.1543Z" fill="#075951" />
        </svg>
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        className="bg-white/60 border-0 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition placeholder-gray-500 text-gray-800"
      />
      {isOpen && filteredAirports.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto">
          {filteredAirports.map(airport => (
            <button key={airport.code} type="button"
              onClick={() => { onChange(airport.code); setSearchQuery(translateCity(airport.city, currentLocale)); setIsOpen(false) }}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition flex items-center justify-between group">
              <div>
                <div className="font-medium text-gray-900 group-hover:text-teal-700">{translateCity(airport.city, currentLocale)}</div>
                <div className="text-sm text-gray-500">{airport.country}</div>
              </div>
              <div className="text-sm font-mono text-gray-400 group-hover:text-teal-600">{airport.code}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Hotel City Input ──────────────────────────────────────────
function HotelCityInput({ value, onChange, placeholder, currentLocale }: { value: string; onChange: (v: string) => void; placeholder: string; currentLocale: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const [filtered, setFiltered] = useState<Airport[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)


  useEffect(() => { setSearchQuery(value ? value : "") }, [value])
  useEffect(() => {
    const handle = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false) }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])
  useEffect(() => { setFiltered(searchAirports(searchQuery).slice(0, 8)) }, [searchQuery])


  return (
    <div ref={wrapperRef} className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </span>
      <input type="text" placeholder={placeholder} value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        className="bg-white/60 border-0 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition placeholder-gray-500 text-gray-800"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto">
          {filtered.map(airport => (
            <button key={airport.code} type="button"
              onClick={() => { onChange(airport.code); setSearchQuery(translateCity(airport.city, currentLocale)); setIsOpen(false) }}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition flex items-center gap-3 group">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-teal-700">{translateCity(airport.city, currentLocale)}</div>
                <div className="text-xs text-gray-500">{airport.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Multi-city: just array of airport codes ───────────────────
type Segment = { from: string; to: string; date: string }


// ── Main Component ────────────────────────────────────────────
interface FlightSearchFormProps {
  currentLocale: string | null
  defaultTo?: string
  isLoggedIn?: boolean
}


export default function FlightSearchForm({ currentLocale, defaultTo, isLoggedIn }: FlightSearchFormProps) {
  const router = useRouter()


  const t = useMemo(() => (key: string, defaultValue: string) => {
    return getTranslation(currentLocale, key) || defaultValue
  }, [currentLocale])


  const [activeTab, setActiveTab] = useState("flights")
  const [tripType, setTripType] = useState("round-trip")


  // One-way / Round-trip state
  const [from, setFrom] = useState("")
  const [to, setTo] = useState(defaultTo || "")
  const [swapKey, setSwapKey] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(2)
  const [flightClass, setFlightClass] = useState("economy")
  const [showPassengers, setShowPassengers] = useState(false)
  const [showClass, setShowClass] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectingStartDate, setSelectingStartDate] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())


  // Multi-city state — just a list of destination codes
  // First "from" is the main "from", rest are stops: from → stops[0] → stops[1] → ...
  const [mcStops, setMcStops] = useState<string[]>(["", ""])
  const [mcHoverIdx, setMcHoverIdx] = useState<number | null>(null)


  // Hotel state
  const [hotelCity, setHotelCity] = useState("")
  const [hotelCheckin, setHotelCheckin] = useState("")
  const [hotelCheckout, setHotelCheckout] = useState("")
  const [hotelAdults, setHotelAdults] = useState(2)
  const [hotelChildren, setHotelChildren] = useState(0)
  const [hotelRooms, setHotelRooms] = useState(1)
  const [showHotelCalendar, setShowHotelCalendar] = useState(false)
  const [showHotelGuests, setShowHotelGuests] = useState(false)
  const [selectingCheckin, setSelectingCheckin] = useState(true)
  const [hotelCalendarMonth, setHotelCalendarMonth] = useState(new Date())


  useEffect(() => {
    if (defaultTo) { setTo(defaultTo); setSwapKey(k => k + 1) }
  }, [defaultTo])


  // Multi-city helpers
  const addStop = (afterIndex: number) => {
    if (mcStops.length >= 5) return
    setMcStops(prev => {
      const next = [...prev]
      next.splice(afterIndex + 1, 0, "")
      return next
    })
  }


  const removeStop = (index: number) => {
    if (mcStops.length <= 2) return
    setMcStops(prev => prev.filter((_, i) => i !== index))
  }


  const updateStop = (index: number, value: string) => {
    setMcStops(prev => prev.map((s, i) => i === index ? value : s))
  }


  const handleSwapLocations = () => {
    const oldFrom = from
    setFrom(to)
    setTo(oldFrom)
    setSwapKey(k => k + 1)
  }


  const weekDays = useMemo(() => {
    const days = getTranslation(currentLocale, "flightSearch.weekDays")
    return Array.isArray(days) ? days : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  }, [currentLocale])


  const months = useMemo(() => {
    const keys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
    return keys.map(k => t(`flightSearch.months.${k}`, k.charAt(0).toUpperCase() + k.slice(1)))
  }, [currentLocale])


  const formatMonthYear = (d: Date) => `${months[d.getMonth()]} ${d.getFullYear()}`
  const formatDateDisplay = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) : ""
  const formatDateFull = (s: string) => s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""


  const getDaysInMonth = (d: Date) => {
    const first = new Date(d.getFullYear(), d.getMonth(), 1)
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { daysInMonth: last.getDate(), startingDayOfWeek: first.getDay() }
  }


  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(calendarMonth)
  const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
  const nextMonthData = getDaysInMonth(nextMonth)
  const hotelNextMonth = new Date(hotelCalendarMonth.getFullYear(), hotelCalendarMonth.getMonth() + 1, 1)
  const hotelNextMonthData = getDaysInMonth(hotelNextMonth)
  const { daysInMonth: hotelDays, startingDayOfWeek: hotelStartDay } = getDaysInMonth(hotelCalendarMonth)


  const nightsCount = hotelCheckin && hotelCheckout
    ? Math.max(0, Math.round((new Date(hotelCheckout).getTime() - new Date(hotelCheckin).getTime()) / 86400000))
    : 0


  const renderCalendarDays = (monthDate: Date, data: { daysInMonth: number; startingDayOfWeek: number }, onDayClick: (d: string) => void, highlightStart: string, highlightEnd: string) => {
    const emptyDays = data.startingDayOfWeek === 0 ? 6 : data.startingDayOfWeek - 1
    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>)}
        {Array.from({ length: emptyDays }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: data.daysInMonth }).map((_, i) => {
          const day = i + 1
          const ds = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isStart = ds === highlightStart, isEnd = ds === highlightEnd
          const isInRange = highlightStart && highlightEnd && ds > highlightStart && ds < highlightEnd
          return (
            <button key={day} type="button" onClick={() => onDayClick(ds)}
              className={`p-1 text-xs rounded-md transition ${isStart || isEnd ? "bg-teal-600 text-white font-semibold" : isInRange ? "bg-teal-100 text-teal-900" : "hover:bg-gray-100 text-gray-700"}`}>
              {day}
            </button>
          )
        })}
      </div>
    )
  }


  const handleDateClick = (ds: string) => {
    if (selectingStartDate) { setStartDate(ds); setSelectingStartDate(false) }
    else { setEndDate(ds); setShowCalendar(false); setSelectingStartDate(true) }
  }


  const handleHotelDateClick = (ds: string) => {
    if (selectingCheckin) { setHotelCheckin(ds); setSelectingCheckin(false) }
    else {
      if (ds <= hotelCheckin) { setHotelCheckin(ds); return }
      setHotelCheckout(ds); setShowHotelCalendar(false); setSelectingCheckin(true)
    }
  }


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      localStorage.setItem("gw_redirect", window.location.pathname)
      router.push("/account")
      return
    }
    if (activeTab === "flights") {
      if (tripType === "multi-city") {
        const filled = mcStops.filter(s => s.trim())
        if (filled.length < 2) { alert(t("flightSearch.alerts.fillAllSegments", "Please add at least 2 destinations")); return }
        if (!startDate) { alert(t("flightSearch.alerts.selectDate", "Please select a departure date")); return }
        const params = new URLSearchParams({
          tripType: "multi-city",
          stops: mcStops.join(","),
          departDate: startDate,
          adults: adults.toString(),
          children: children.toString(),
          class: flightClass,
        })
        router.push(`/search?${params.toString()}`)
        return
      }
      if (!from || !to) { alert(t("flightSearch.alerts.selectAirports", "Please select departure and arrival airports")); return }
      if (!startDate) { alert(t("flightSearch.alerts.selectDate", "Please select a departure date")); return }
      if (tripType === "round-trip" && !endDate) { alert(t("flightSearch.alerts.selectReturnDate", "Please select a return date")); return }
      const params = new URLSearchParams({
        from, to,
        departDate: startDate,
        returnDate: endDate || "",
        adults: adults.toString(),
        children: children.toString(),
        class: flightClass,
        tripType,
      })
      router.push(`/search?${params.toString()}`)
    } else if (activeTab === "hotel") {
      if (!hotelCity) { alert(t("hotelSearch.alerts.selectCity", "Please select a destination")); return }
      if (!hotelCheckin || !hotelCheckout) { alert(t("hotelSearch.alerts.selectDates", "Please select check-in and check-out dates")); return }
      const params = new URLSearchParams({
        city: hotelCity, checkin: hotelCheckin, checkout: hotelCheckout,
        adults: hotelAdults.toString(), children: hotelChildren.toString(), rooms: hotelRooms.toString(),
      })
      router.push(`/hotels?${params.toString()}`)
    }
  }


  // ── Shared bottom controls: date + passengers + class in one row ──
  const PassengerClassControls = ({ isRoundTrip = false }: { isRoundTrip?: boolean }) => (
    <div className="grid grid-cols-3 gap-3">
      {/* Date */}
      <div className="relative">
        <button type="button" onClick={() => { setShowPassengers(false); setShowClass(false); setShowCalendar(!showCalendar) }}
          className="bg-white/60 border-0 rounded-xl px-4 py-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 20V6C21 4.897 20.103 4 19 4H17V2H15V4H9V2H7V4H5C3.897 4 3 4.897 3 6V20C3 21.103 3.897 22 5 22H19C20.103 22 21 21.103 21 20ZM19 9H5V7H19V9Z" fill="#075951" />
          </svg>
          <span className="text-gray-700 text-sm font-medium truncate">
            {isRoundTrip
              ? (startDate && endDate
                ? `${formatDateDisplay(startDate)}–${formatDateDisplay(endDate)}`
                : startDate
                  ? `${formatDateDisplay(startDate)}–?`
                  : t("flightSearch.placeholders.selectDates", "Dates"))
              : (startDate
                ? new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : t("flightSearch.placeholders.selectDates", "Dates"))}
          </span>
        </button>
        {showCalendar && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 z-50 w-72 sm:w-[480px]">
            {isRoundTrip && (
              <p className="text-xs text-teal-600 font-medium mb-3 px-1">
                {selectingStartDate ? t("flightSearch.selectDepart", "Select departure") : t("flightSearch.selectReturn", "Select return →")}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="font-semibold text-base">{formatMonthYear(calendarMonth)}</span>
                  <div className="w-9 hidden sm:block" />
                </div>
                {renderCalendarDays(calendarMonth, { daysInMonth, startingDayOfWeek }, isRoundTrip ? handleDateClick : (ds) => { setStartDate(ds); setShowCalendar(false) }, startDate, isRoundTrip ? endDate : "")}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9" />
                  <span className="font-semibold text-base">{formatMonthYear(nextMonth)}</span>
                  <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                {renderCalendarDays(nextMonth, nextMonthData, isRoundTrip ? handleDateClick : (ds) => { setStartDate(ds); setShowCalendar(false) }, startDate, isRoundTrip ? endDate : "")}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <button type="button" onClick={() => { setShowClass(false); setShowPassengers(!showPassengers) }}
          className="bg-white/60 border-0 rounded-xl px-4 py-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12.5 12.5C11.0562 12.5 9.82031 11.9859 8.79219 10.9578C7.76406 9.92969 7.25 8.69375 7.25 7.25C7.25 5.80625 7.76406 4.57031 8.79219 3.54219C9.82031 2.51406 11.0562 2 12.5 2C13.9437 2 15.1797 2.51406 16.2078 3.54219C17.2359 4.57031 17.75 5.80625 17.75 7.25C17.75 8.69375 17.2359 9.92969 16.2078 10.9578C15.1797 11.9859 13.9437 12.5 12.5 12.5ZM2 23V19.325C2 18.5813 2.19163 17.8979 2.57488 17.2749C2.95813 16.6519 3.4665 16.1759 4.1 15.8469C5.45625 15.1687 6.83437 14.6604 8.23437 14.3217C9.63437 13.9831 11.0562 13.8134 12.5 13.8125C13.9437 13.8116 15.3656 13.9814 16.7656 14.3217C18.1656 14.6621 19.5437 15.1705 20.9 15.8469C21.5344 16.175 22.0432 16.651 22.4264 17.2749C22.8097 17.8987 23.0009 18.5821 23 19.325V23H2Z" fill="#075951" />
            </svg>
            <span className="text-gray-700 text-sm font-medium">
              {adults} {t("flightSearch.labels.adult", "Adult")} · {children} {t("flightSearch.labels.children", "Children")}
            </span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showPassengers && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl p-6 z-50 w-72">
            <div className="space-y-4">
              {[
                { label: t("flightSearch.labels.adult", "Adults"), sublabel: "18+", value: adults, min: 1, setter: setAdults },
                { label: t("flightSearch.labels.children", "Children"), sublabel: "0–17", value: children, min: 0, setter: setChildren },
              ].map(({ label, sublabel, value, min, setter }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{label}</div>
                    <div className="text-xs text-gray-400">{sublabel}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setter(Math.max(min, value - 1))} disabled={value <= min}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 disabled:opacity-30">−</button>
                    <span className="w-6 text-center font-semibold text-gray-800">{value}</span>
                    <button type="button" onClick={() => setter(value + 1)}
                      className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center hover:bg-teal-50 text-teal-600">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="relative">
        <button type="button" onClick={() => { setShowPassengers(false); setShowClass(!showClass) }}
          className="bg-white/60 border-0 rounded-xl px-4 py-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17.3846 21H6.61538V7.09091H8.15385V5.54545C8.15385 4.69545 8.84615 4 9.69231 4H14.3077C15.1538 4 15.8462 4.69545 15.8462 5.54545V7.09091H17.3846V21ZM18.9231 21V7.09091H20.4615C21.3077 7.09091 22 7.78636 22 8.63636V19.4545C22 20.3045 21.3077 21 20.4615 21H18.9231ZM5.07692 21H3.53846C2.69231 21 2 20.3045 2 19.4545V8.63636C2 7.78636 2.69231 7.09091 3.53846 7.09091H5.07692V21ZM9.69231 7.09091H14.3077V5.54545H9.69231V7.09091Z" fill="#075951" />
            </svg>
            <span className="text-gray-700 text-sm font-medium capitalize">{t(`flightSearch.labels.${flightClass}`, flightClass)}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showClass && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl py-2 z-50 w-full">
            {["economy", "business"].map(cls => (
              <button key={cls} type="button" onClick={() => { setFlightClass(cls); setShowClass(false) }}
                className="w-full px-4 py-3 text-left hover:bg-teal-50 transition text-gray-700 capitalize text-sm">
                {t(`flightSearch.labels.${cls}`, cls)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )


  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 sm:p-8 max-w-3xl mx-auto shadow-2xl">
      {/* Tabs */}
      <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 overflow-x-auto">
        {[
          { key: "flights", label: t("flightSearch.tabs.flights", "Flights") },
          { key: "car", label: t("flightSearch.tabs.car", "Rent a car") },
          { key: "hotel", label: t("flightSearch.tabs.hotel", "Book a hotel") },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-2 font-semibold text-base sm:text-lg border-b-4 transition whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? "text-teal-700 border-teal-700" : "text-gray-600 border-transparent hover:text-teal-600 hover:border-teal-300"}`}>
            {tab.label}
          </button>
        ))}
      </div>


      {/* ── FLIGHTS TAB ── */}
      {activeTab === "flights" && (
        <>
          {/* Trip type selector */}
          <div className="flex gap-1 mb-6 bg-white/60 rounded-xl p-1 w-full sm:w-fit">
            {[
              { key: "round-trip", label: t("flightSearch.tripTypes.roundTrip", "Round trip") },
              { key: "one-way", label: t("flightSearch.tripTypes.oneWay", "One-way") },
              { key: "multi-city", label: t("flightSearch.tripTypes.multiCity", "Multi-city") },
            ].map(type => (
              <button key={type.key} onClick={() => setTripType(type.key)}
                className={`px-3 sm:px-5 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap flex-1 sm:flex-none ${tripType === type.key ? "bg-white text-teal-700 shadow-md" : "text-gray-600 hover:text-teal-600"}`}>
                {type.label}
              </button>
            ))}
          </div>


          <form onSubmit={handleSearch} className="space-y-4">


            {/* ── ONE-WAY & ROUND-TRIP ── */}
            {(tripType === "one-way" || tripType === "round-trip") && (
              <>
                <div className="relative flex flex-col gap-3">
                  <AutocompleteInput value={from} onChange={setFrom}
                    placeholder={t("flightSearch.placeholders.from", "From")}
                    currentLocale={currentLocale} externalReset={swapKey} />
                  <div className="flex justify-center sm:justify-end sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 z-10">
                    <button type="button" onClick={handleSwapLocations}
                      className="bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-teal-50 hover:border-teal-500 transition shadow-md group">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                  <AutocompleteInput value={to} onChange={setTo}
                    placeholder={t("flightSearch.placeholders.to", "To")}
                    currentLocale={currentLocale} externalReset={swapKey} />
                </div>


                <PassengerClassControls isRoundTrip={tripType === "round-trip"} />
              </>
            )}


            {/* ── MULTI-CITY ── */}
            {tripType === "multi-city" && (
              <div className="space-y-0">
                {/* FROM — always first */}
                <AutocompleteInput
                  value={mcStops[0]}
                  onChange={v => updateStop(0, v)}
                  placeholder={t("flightSearch.placeholders.from", "From")}
                  currentLocale={currentLocale}
                  externalReset={swapKey}
                />


                {/* STOP INPUTS with hover + between each */}
                {mcStops.slice(1).map((stop, i) => {
                  const idx = i + 1 // real index in mcStops
                  return (
                    <div key={idx}
                      className="relative group"
                      onMouseEnter={() => setMcHoverIdx(idx - 1)}
                      onMouseLeave={() => setMcHoverIdx(null)}
                    >
                      {/* Hover line + plus button */}
                      {mcStops.length < 6 && (
                        <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-center transition-opacity duration-150 ${mcHoverIdx === idx - 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                          style={{ transform: "translateY(-50%)" }}>
                          <div className="absolute inset-x-4 top-1/2 h-px bg-teal-400" />
                          <button
                            type="button"
                            onClick={() => addStop(idx - 1)}
                            className="relative z-10 w-7 h-7 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-500 hover:text-white transition shadow-md"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      )}


                      {/* Input row */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <AutocompleteInput
                            value={stop}
                            onChange={v => updateStop(idx, v)}
                            placeholder={idx === mcStops.length - 1
                              ? t("flightSearch.placeholders.to", "To")
                              : `${t("flightSearch.multiCity.stopover", "Stopover")} ${idx}`}
                            currentLocale={currentLocale}
                            externalReset={swapKey}
                          />
                        </div>
                        {/* Remove stop — only if more than 2 */}
                        {mcStops.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeStop(idx)}
                            className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition bg-white/60"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}


                {/* Hover zone after last stop */}
                {mcStops.length < 6 && (
                  <div
                    className="relative h-4 group cursor-pointer"
                    onMouseEnter={() => setMcHoverIdx(mcStops.length - 1)}
                    onMouseLeave={() => setMcHoverIdx(null)}
                    onClick={() => addStop(mcStops.length - 1)}
                  >
                    <div className={`absolute inset-x-0 top-1/2 flex items-center justify-center transition-opacity duration-150 ${mcHoverIdx === mcStops.length - 1 ? "opacity-100" : "opacity-0"}`}>
                      <div className="absolute inset-x-4 top-1/2 h-px bg-teal-400" />
                      <div className="relative z-10 w-7 h-7 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center text-teal-600 shadow-md">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}


                {/* Route preview */}
                {mcStops.filter(Boolean).length >= 2 && (
                  <div className="flex items-center gap-1 flex-wrap py-1">
                    {mcStops.filter(Boolean).map((code, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">{code}</span>
                        {i < mcStops.filter(Boolean).length - 1 && (
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>
                )}


                {/* Date + passengers + class — 3 in a row */}
                <div className="pt-2">
                  <PassengerClassControls />
                </div>
              </div>
            )}


            <button type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-xl transition shadow-lg hover:shadow-xl text-base sm:text-lg">
              {t("flightSearch.buttons.search", "Search Flights")}
            </button>
          </form>
        </>
      )}


      {/* ── CAR TAB ── */}
      {activeTab === "car" && (
        <div className="text-center py-12">
          <p className="text-gray-600">{t("flightSearch.comingSoon.car", "Car rental coming soon!")}</p>
        </div>
      )}


      {/* ── HOTEL TAB ── */}
      {activeTab === "hotel" && (
        <form onSubmit={handleSearch} className="space-y-4">
          <HotelCityInput value={hotelCity} onChange={setHotelCity}
            placeholder={t("hotelSearch.placeholders.destination", "Where are you going?")}
            currentLocale={currentLocale} />


          <div className="relative">
            <button type="button" onClick={() => { setShowHotelGuests(false); setShowHotelCalendar(!showHotelCalendar) }}
              className="bg-white/60 border-0 rounded-xl px-4 py-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 20V6C21 4.897 20.103 4 19 4H17V2H15V4H9V2H7V4H5C3.897 4 3 4.897 3 6V20C3 21.103 3.897 22 5 22H19C20.103 22 21 21.103 21 20ZM19 9H5V7H19V9Z" fill="#075951" />
              </svg>
              <div className="flex-1 flex items-center gap-2">
                <span className={`text-sm font-medium ${hotelCheckin ? "text-gray-800" : "text-gray-500"}`}>
                  {hotelCheckin ? formatDateFull(hotelCheckin) : t("hotelSearch.placeholders.checkin", "Check-in")}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className={`text-sm font-medium ${hotelCheckout ? "text-gray-800" : "text-gray-500"}`}>
                  {hotelCheckout ? formatDateFull(hotelCheckout) : t("hotelSearch.placeholders.checkout", "Check-out")}
                </span>
                {nightsCount > 0 && (
                  <span className="ml-auto text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                    {nightsCount} {nightsCount === 1 ? t("hotelSearch.night", "night") : t("hotelSearch.nights", "nights")}
                  </span>
                )}
              </div>
            </button>
            {showHotelCalendar && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 z-50 w-72 sm:w-[480px]">
                <p className="text-xs text-teal-600 font-medium mb-3 px-1">
                  {selectingCheckin ? t("hotelSearch.selectCheckin", "Select check-in date") : t("hotelSearch.selectCheckout", "Select check-out date")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button type="button" onClick={() => setHotelCalendarMonth(new Date(hotelCalendarMonth.getFullYear(), hotelCalendarMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <span className="font-semibold text-base">{formatMonthYear(hotelCalendarMonth)}</span>
                      <div className="w-9 hidden sm:block" />
                    </div>
                    {renderCalendarDays(hotelCalendarMonth, { daysInMonth: hotelDays, startingDayOfWeek: hotelStartDay }, handleHotelDateClick, hotelCheckin, hotelCheckout)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9" />
                      <span className="font-semibold text-base">{formatMonthYear(hotelNextMonth)}</span>
                      <button type="button" onClick={() => setHotelCalendarMonth(new Date(hotelCalendarMonth.getFullYear(), hotelCalendarMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    {renderCalendarDays(hotelNextMonth, hotelNextMonthData, handleHotelDateClick, hotelCheckin, hotelCheckout)}
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="relative">
            <button type="button" onClick={() => { setShowHotelCalendar(false); setShowHotelGuests(!showHotelGuests) }}
              className="bg-white/60 border-0 rounded-xl px-4 py-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12.5 12.5C11.0562 12.5 9.82031 11.9859 8.79219 10.9578C7.76406 9.92969 7.25 8.69375 7.25 7.25C7.25 5.80625 7.76406 4.57031 8.79219 3.54219C9.82031 2.51406 11.0562 2 12.5 2C13.9437 2 15.1797 2.51406 16.2078 3.54219C17.2359 4.57031 17.75 5.80625 17.75 7.25C17.75 8.69375 17.2359 9.92969 16.2078 10.9578C15.1797 11.9859 13.9437 12.5 12.5 12.5ZM2 23V19.325C2 18.5813 2.19163 17.8979 2.57488 17.2749C2.95813 16.6519 3.4665 16.1759 4.1 15.8469C5.45625 15.1687 6.83437 14.6604 8.23437 14.3217C9.63437 13.9831 11.0562 13.8134 12.5 13.8125C13.9437 13.8116 15.3656 13.9814 16.7656 14.3217C18.1656 14.6621 19.5437 15.1705 20.9 15.8469C21.5344 16.175 22.0432 16.651 22.4264 17.2749C22.8097 17.8987 23.0009 18.5821 23 19.325V23H2Z" fill="#075951" />
                </svg>
                <span className="text-gray-700 text-sm font-medium">
                  {hotelAdults} {t("flightSearch.labels.adult", "Adult")}
                  {hotelChildren > 0 ? ` · ${hotelChildren} ${t("flightSearch.labels.children", "Children")}` : ""}
                  {" · "}{hotelRooms} {hotelRooms === 1 ? t("hotelSearch.room", "room") : t("hotelSearch.rooms", "rooms")}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showHotelGuests && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl p-6 z-50 w-80">
                <div className="space-y-4">
                  {[
                    { label: t("flightSearch.labels.adult", "Adults"), sublabel: "18+", value: hotelAdults, min: 1, setter: setHotelAdults },
                    { label: t("flightSearch.labels.children", "Children"), sublabel: "0–17", value: hotelChildren, min: 0, setter: setHotelChildren },
                    { label: t("hotelSearch.rooms", "Rooms"), sublabel: "", value: hotelRooms, min: 1, setter: setHotelRooms },
                  ].map(({ label, sublabel, value, min, setter }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{label}</div>
                        {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setter(Math.max(min, value - 1))} disabled={value <= min}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 disabled:opacity-30">−</button>
                        <span className="w-6 text-center font-semibold text-gray-800">{value}</span>
                        <button type="button" onClick={() => setter(value + 1)}
                          className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center hover:bg-teal-50 text-teal-600">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setShowHotelGuests(false)}
                  className="mt-5 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                  {t("hotelSearch.done", "Done")}
                </button>
              </div>
            )}
          </div>


          <button type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-xl transition shadow-lg hover:shadow-xl text-base sm:text-lg">
            {t("hotelSearch.buttons.search", "Search hotels")}
          </button>
        </form>
      )}
    </div>
  )
}



