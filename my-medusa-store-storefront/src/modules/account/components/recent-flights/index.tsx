"use client"


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"


type Booking = {
  id: number
  reference: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  departureDate: string
  class: "economy" | "business"
  pricePaid: number
  status: "confirmed" | "pending" | "cancelled"
  paidWithPass: boolean
}


type Props = {
  customerEmail: string
  currentLocale?: string | null
  bookFlightLabel?: string
  noFlightsLabel?: string
  recentFlightsLabel?: string
  allFlightsLabel?: string
}


export default function RecentFlights({
  customerEmail,
  currentLocale,
  bookFlightLabel = "Book a flight",
  noFlightsLabel = "You have no booked flights yet",
  recentFlightsLabel = "Recent flights",
  allFlightsLabel = "All flights",
}: Props) {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch(`/api/flights/my-bookings?email=${encodeURIComponent(customerEmail)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const now = new Date()
        const upcoming = (data.bookings || [])
          .filter((b: Booking) => new Date(b.departureDate) >= now && b.status !== "cancelled")
          .slice(0, 3)
        setBookings(upcoming)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customerEmail])


  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(currentLocale || "en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    } catch { return dateStr }
  }


  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{recentFlightsLabel}</h3>
        {bookings.length > 0 && (
          <button
            onClick={() => router.push("/my-flights")}
            className="text-sm font-medium text-[#00897B] hover:text-[#00695C]"
          >
            {allFlightsLabel} →
          </button>
        )}
      </div>


      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      )}


      {!loading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-gray-500">{noFlightsLabel}</span>
          <button
            onClick={() => router.push("/book")}
            className="mt-4 rounded-lg bg-[#00897B] px-6 py-2 text-sm font-medium text-white hover:bg-[#00695C]"
          >
            {bookFlightLabel}
          </button>
        </div>
      )}


      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:border-[#00897B] hover:shadow-sm transition cursor-pointer"
              onClick={() => router.push("/my-flights")}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                    <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {booking.departure} → {booking.arrival}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(booking.departureDate)} · {booking.departureTime} – {booking.arrivalTime}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="font-mono text-xs text-teal-600 font-bold">{booking.reference}</div>
                <div className="text-sm text-gray-500 capitalize">{booking.class}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


