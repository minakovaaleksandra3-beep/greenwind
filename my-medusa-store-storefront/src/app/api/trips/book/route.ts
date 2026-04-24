import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"


const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "medusa-my-medusa-store",
  user: "postgres",
  password: "12345678",
})


function generateRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let ref = "GW-"
  for (let i = 0; i < 6; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length))
  return ref
}


async function decrementPassFlights(authToken: string, currentLeft: number, usedCount: number) {
  const newLeft = Math.max(0, currentLeft - usedCount)
  await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/pass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
    body: JSON.stringify({ pass_flights_left: newLeft }),
  })
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tripId,
      outboundRef,
      returnRef,
      outboundScheduleId,
      returnScheduleId,
      passengerName,
      passengerEmail,
      outboundClass,
      returnClass,
      passengers = [],
      adultsCount = 1,
      childrenCount = 0,
      paidWithPass = false,
      passFlightsLeft = 0,
      passUsedCount = 0,
      totalPrice = 0,
    } = body


    if (!outboundScheduleId || !passengerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }


    const cookieStore = await cookies()
    const authToken = cookieStore.get("_medusa_jwt")?.value || ""


    const totalPassengers = Math.max(1, adultsCount + childrenCount)
    const passCount = passengers.filter((p: any) => p.usePass).length
    const paidCount = totalPassengers - passCount


    const client = await pool.connect()


    try {
      await client.query("BEGIN")


      // ─── 1. Outbound flight ───
      const outboundSchedule = await client.query(
        `SELECT fs.*, f.flight_number FROM flight_schedules fs
         JOIN flights f ON f.id = fs.flight_id
         WHERE fs.id = $1 AND fs.status = 'scheduled' FOR UPDATE`,
        [outboundScheduleId]
      )
      if (outboundSchedule.rows.length === 0) throw new Error("Outbound flight not available")


      const obSched = outboundSchedule.rows[0]
      const obSeatCol = outboundClass === "economy" ? "available_seats_economy" : "available_seats_business"
      const obSeats = outboundClass === "economy" ? obSched.available_seats_economy : obSched.available_seats_business
      if (obSeats < totalPassengers) throw new Error(`Not enough outbound seats: ${obSeats} available`)


      await client.query(
        `UPDATE flight_schedules SET ${obSeatCol} = ${obSeatCol} - $1 WHERE id = $2`,
        [totalPassengers, outboundScheduleId]
      )


      const obPrice = outboundClass === "economy" ? obSched.price_economy : obSched.price_business
      const obPaidTotal = paidCount * obPrice


      const outboundBooking = await client.query(
        `INSERT INTO bookings (booking_reference, flight_schedule_id, passenger_name, passenger_email, class, price_paid, paid_with_pass, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
        [outboundRef || generateRef(), outboundScheduleId, passengerName, passengerEmail, outboundClass, obPaidTotal, passCount > 0]
      )
      const outboundBookingId = outboundBooking.rows[0].id


      // ─── 2. Return flight ───
      let returnBookingId: number | null = null
      const finalReturnRef = returnRef || generateRef()


      if (returnScheduleId) {
        const returnSchedule = await client.query(
          `SELECT fs.*, f.flight_number FROM flight_schedules fs
           JOIN flights f ON f.id = fs.flight_id
           WHERE fs.id = $1 AND fs.status = 'scheduled' FOR UPDATE`,
          [returnScheduleId]
        )
        if (returnSchedule.rows.length === 0) throw new Error("Return flight not available")


        const retSched = returnSchedule.rows[0]
        const retSeatCol = returnClass === "economy" ? "available_seats_economy" : "available_seats_business"
        const retSeats = returnClass === "economy" ? retSched.available_seats_economy : retSched.available_seats_business
        if (retSeats < totalPassengers) throw new Error(`Not enough return seats: ${retSeats} available`)


        await client.query(
          `UPDATE flight_schedules SET ${retSeatCol} = ${retSeatCol} - $1 WHERE id = $2`,
          [totalPassengers, returnScheduleId]
        )


        const retPrice = returnClass === "economy" ? retSched.price_economy : retSched.price_business
        const retPaidTotal = paidCount * retPrice


        const returnBooking = await client.query(
          `INSERT INTO bookings (booking_reference, flight_schedule_id, passenger_name, passenger_email, class, price_paid, paid_with_pass, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
          [finalReturnRef, returnScheduleId, passengerName, passengerEmail, returnClass, retPaidTotal, passCount > 0]
        )
        returnBookingId = returnBooking.rows[0].id
      }


      // ─── 3. Passengers ───
      const bookingIds = [outboundBookingId, returnBookingId].filter(Boolean)
      for (const bookingId of bookingIds) {
        if (passengers.length > 0) {
          for (const p of passengers) {
            await client.query(
              `INSERT INTO booking_passengers (booking_id, passenger_type, first_name, last_name, middle_name, paid_with_pass)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [bookingId, p.type || "adult", p.firstName, p.lastName, p.middleName || null, p.usePass || false]
            )
          }
        } else {
          const parts = passengerName.split(" ")
          await client.query(
            `INSERT INTO booking_passengers (booking_id, passenger_type, first_name, last_name, paid_with_pass)
             VALUES ($1, 'adult', $2, $3, $4)`,
            [bookingId, parts[0] || passengerName, parts.slice(1).join(" ") || "", paidWithPass]
          )
        }
      }


      // ─── 4. trip_bookings record ───
      const finalTripId = tripId || `TRIP-${Date.now()}`
      await client.query(
        `INSERT INTO trip_bookings (trip_id, outbound_booking_ref, return_booking_ref, outbound_booking_id, return_booking_id, passenger_email, passenger_name, adults_count, children_count, total_price, paid_with_pass, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed')`,
        [finalTripId, outboundRef || generateRef(), finalReturnRef, outboundBookingId, returnBookingId, passengerEmail, passengerName, adultsCount, childrenCount, Math.round(totalPrice * 100), passCount > 0]
      )


      await client.query("COMMIT")


      // ─── 5. Decrement Pass ───
      if (passCount > 0 && authToken) {
        await decrementPassFlights(authToken, passFlightsLeft, passCount * 2).catch(console.error)
      }


      return NextResponse.json({
        success: true,
        tripId: finalTripId,
        outboundRef,
        returnRef: finalReturnRef,
      })


    } catch (err: any) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }


  } catch (error: any) {
    console.error("Trip booking error:", error)
    return NextResponse.json({ error: "Failed to create trip booking", details: error.message }, { status: 500 })
  }
}



