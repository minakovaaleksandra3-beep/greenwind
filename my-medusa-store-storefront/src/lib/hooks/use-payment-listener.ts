"use client"
import { useEffect, useRef } from "react"


export type Passenger = {
  firstName: string
  lastName: string
  middleName?: string
  type: "adult" | "child"
}


export type BookingSuccessData = {
  bookingRef: string
  scheduleId: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  flightNumber: string
  selectedClass: "economy" | "business"
  price: number
  currency: string
  departDate: string
  paidWithPass: boolean
  bookedAt: string
  passengerName: string
  passengerEmail: string
  passFlightsLeft?: number
  passUsedCount?: number
  passengers?: Passenger[]
  adultsCount?: number
  childrenCount?: number
  // Trip booking — два рейси
  isTripBooking?: boolean
  tripId?: string
  outboundRef?: string
  returnRef?: string
  returnScheduleId?: string
  returnClass?: string
  returnPrice?: number
}


type UsePaymentListenerOptions = {
  onSuccess: (data: BookingSuccessData) => void
  onCancelled?: () => void
}


const processedRefs = new Set<string>()


export function usePaymentListener({ onSuccess, onCancelled }: UsePaymentListenerOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null)


  useEffect(() => {
    channelRef.current = new BroadcastChannel("greenwing_payment")


    channelRef.current.onmessage = async (event) => {
      if (event.data?.type === "BOOKING_SUCCESS") {
        const data = event.data.data as BookingSuccessData


        if (processedRefs.has(data.bookingRef)) return
        processedRefs.add(data.bookingRef)


        if (data.isTripBooking) {
          // Trip: зберігаємо через /api/trips/book
          try {
            const res = await fetch("/api/trips/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tripId: data.tripId,
                outboundRef: data.outboundRef,
                returnRef: data.returnRef,
                outboundScheduleId: parseInt(data.scheduleId),
                returnScheduleId: data.returnScheduleId ? parseInt(data.returnScheduleId) : null,
                passengerName: data.passengerName,
                passengerEmail: data.passengerEmail,
                outboundClass: data.selectedClass,
                returnClass: data.returnClass || data.selectedClass,
                passengers: data.passengers || [],
                adultsCount: data.adultsCount || 1,
                childrenCount: data.childrenCount || 0,
                paidWithPass: data.paidWithPass,
                passFlightsLeft: data.passFlightsLeft ?? 0,
                passUsedCount: data.passUsedCount ?? 0,
                totalPrice: data.price,
              }),
            })
            if (!res.ok) {
              const err = await res.json()
              console.error("Failed to save trip booking:", err)
            }
          } catch (err) {
            console.error("Error saving trip booking:", err)
          }
        } else {
          // Single flight: стара логіка
          try {
            const res = await fetch("/api/flights/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                scheduleId: parseInt(data.scheduleId),
                passengerName: data.passengerName,
                passengerEmail: data.passengerEmail,
                flightClass: data.selectedClass,
                paidWithPass: data.paidWithPass,
                bookingRef: data.bookingRef,
                passFlightsLeft: data.passFlightsLeft ?? 0,
                passUsedCount: data.passUsedCount ?? 0,
                passengers: data.passengers || [],
                adultsCount: data.adultsCount || 1,
                childrenCount: data.childrenCount || 0,
              }),
            })
            if (!res.ok) {
              const err = await res.json()
              console.error("Failed to save booking:", err)
            } else if (data.paidWithPass) {
              await fetch("/api/revalidate-customer", { method: "POST" }).catch(() => {})
            }
          } catch (err) {
            console.error("Error saving booking:", err)
          }
        }


        onSuccess(data)


      } else if (event.data?.type === "BOOKING_CANCELLED") {
        onCancelled?.()
      } else if (event.data?.type === "REDIRECT_AFTER_BOOKING") {
        if (typeof window !== "undefined" && event.data.dest) {
          window.location.href = event.data.dest
        }
      }
    }


    return () => channelRef.current?.close()
  }, [])
}


export function openPaymentTab(params: {
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  flightNumber?: string
  selectedClass: "economy" | "business"
  price: number
  currency: string
  scheduleId: string | number
  departDate: string
  hasPass?: boolean
  passFlightsLeft?: number
  passengerName: string
  passengerEmail: string
  adultsCount?: number
  childrenCount?: number
  // Trip-specific
  isTripBooking?: boolean
  tripId?: string
  returnScheduleId?: string | number
  returnClass?: string
  returnTime?: string
  returnArrivalTime?: string
  returnFlightNumber?: string
  returnDate?: string
  returnPrice?: number
  toCity?: string
  fromCity?: string
  redirectAfterSuccess?: string
}) {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    departureTime: params.departureTime,
    arrivalTime: params.arrivalTime,
    flightNumber: params.flightNumber || "GW2071",
    class: params.selectedClass,
    price: params.price.toString(),
    currency: params.currency,
    scheduleId: params.scheduleId.toString(),
    departDate: params.departDate,
    hasPass: (params.hasPass || false).toString(),
    passFlightsLeft: (params.passFlightsLeft || 0).toString(),
    passengerName: params.passengerName,
    passengerEmail: params.passengerEmail,
    adults: (params.adultsCount || 1).toString(),
    children: (params.childrenCount || 0).toString(),
  })


  if (params.isTripBooking) {
    query.set("isTripBooking", "true")
    query.set("tripId", params.tripId || "")
    query.set("returnScheduleId", params.returnScheduleId?.toString() || "")
    query.set("returnClass", params.returnClass || params.selectedClass)
    query.set("returnTime", params.returnTime || "")
    query.set("returnArrivalTime", params.returnArrivalTime || "")
    query.set("returnFlightNumber", params.returnFlightNumber || "")
    query.set("returnDate", params.returnDate || "")
    query.set("returnPrice", params.returnPrice?.toString() || "0")
    query.set("toCity", params.toCity || params.to)
    query.set("fromCity", params.fromCity || params.from)
  }


  if (params.redirectAfterSuccess) {
    query.set("redirectAfterSuccess", params.redirectAfterSuccess)
  }


  window.open(
    `/payment?${query.toString()}`,
    "_blank",
    "width=520,height=860,scrollbars=yes,resizable=no"
  )
}



