import { NextRequest, NextResponse } from "next/server"
import { pool } from "@lib/db"
import { cookies } from "next/headers"


function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let reference = 'GW-'
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return reference
}


async function decrementPassFlights(authToken: string, currentLeft: number, usedCount: number): Promise<void> {
  const newLeft = Math.max(0, currentLeft - usedCount)
  const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/pass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
    body: JSON.stringify({ pass_flights_left: newLeft }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update pass flights: ${err}`)
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      scheduleId,
      passengerName,
      passengerEmail,
      flightClass,
      paidWithPass = false,
      bookingRef,
      passFlightsLeft = 0,
      passUsedCount = 0,
      passengers = [],
      adultsCount = 1,
      childrenCount = 0,
    } = body


    console.log("BOOKING BODY:", JSON.stringify({
      ...body,
      passengers: `[${passengers.length} passengers, ${passUsedCount} using Pass]`
    }))


    if (!scheduleId || !passengerEmail || !flightClass) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }


    const cookieStore = await cookies()
    const authToken =
      cookieStore.get("_medusa_jwt")?.value ||
      cookieStore.get("_medusa_session")?.value ||
      ""


    const totalPassengers = Math.max(1, adultsCount + childrenCount)


    // Скільки пасажирів платять Pass
    const passCount = passengers.length > 0
      ? passengers.filter((p: any) => p.usePass).length
      : (paidWithPass ? 1 : 0)


    const client = await pool.connect()


    try {
      await client.query('BEGIN')


      const scheduleResult = await client.query(`
        SELECT fs.*, f.flight_number, f.departure_airport, f.arrival_airport, f.departure_time, f.arrival_time
        FROM flight_schedules fs
        JOIN flights f ON f.id = fs.flight_id
        WHERE fs.id = $1 AND fs.status = 'scheduled'
        FOR UPDATE
      `, [scheduleId])


      if (scheduleResult.rows.length === 0) {
        throw new Error("Flight schedule not found or not available")
      }


      const schedule = scheduleResult.rows[0]
      const seatColumn = flightClass === 'economy' ? 'available_seats_economy' : 'available_seats_business'
      const availableSeats = flightClass === 'economy'
        ? schedule.available_seats_economy
        : schedule.available_seats_business


      if (availableSeats < totalPassengers) {
        throw new Error(`Not enough seats. Requested: ${totalPassengers}, Available: ${availableSeats}`)
      }


      await client.query(
        `UPDATE flight_schedules SET ${seatColumn} = ${seatColumn} - $1 WHERE id = $2`,
        [totalPassengers, scheduleId]
      )


      const finalReference = bookingRef || generateBookingReference()
      const pricePerPerson = flightClass === 'economy' ? schedule.price_economy : schedule.price_business


      // Загальна ціна = тільки ті пасажири що НЕ використовують Pass
      const paidCount = totalPassengers - passCount
      const totalPrice = paidCount * pricePerPerson


      // Головний запис бронювання
      const primaryName = passengers.length > 0
        ? `${passengers[0].firstName} ${passengers[0].lastName}`
        : passengerName


      // paidWithPass в головному записі = true якщо хоч один Pass використано
      const anyPassUsed = passCount > 0


      const bookingResult = await client.query(`
        INSERT INTO bookings (booking_reference, flight_schedule_id, passenger_name, passenger_email, class, price_paid, paid_with_pass, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
        RETURNING *
      `, [finalReference, scheduleId, primaryName, passengerEmail, flightClass, totalPrice, anyPassUsed])


      const bookingId = bookingResult.rows[0].id


      // Зберігаємо пасажирів з індивідуальним paid_with_pass
      if (passengers.length > 0) {
        for (const p of passengers) {
          await client.query(`
            INSERT INTO booking_passengers (booking_id, passenger_type, first_name, last_name, middle_name, paid_with_pass)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [bookingId, p.type || 'adult', p.firstName, p.lastName, p.middleName || null, p.usePass || false])
        }
      } else {
        const nameParts = passengerName.split(' ')
        await client.query(`
          INSERT INTO booking_passengers (booking_id, passenger_type, first_name, last_name, paid_with_pass)
          VALUES ($1, 'adult', $2, $3, $4)
        `, [bookingId, nameParts[0] || passengerName, nameParts.slice(1).join(' ') || '', paidWithPass])
      }


      await client.query('COMMIT')


      // Декрементуємо Pass на кількість використаних слотів
      if (passCount > 0 && authToken) {
        try {
          await decrementPassFlights(authToken, passFlightsLeft, passCount)
          console.log(`✅ Pass decremented: ${passFlightsLeft} → ${Math.max(0, passFlightsLeft - passCount)} (used ${passCount})`)
        } catch (passErr) {
          console.error("Failed to decrement pass flights:", passErr)
        }
      }


      const booking = bookingResult.rows[0]


      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          reference: booking.booking_reference,
          flightNumber: schedule.flight_number,
          departure: schedule.departure_airport,
          arrival: schedule.arrival_airport,
          departureTime: schedule.departure_time,
          arrivalTime: schedule.arrival_time,
          class: flightClass,
          price: totalPrice / 100,
          pricePerPerson: pricePerPerson / 100,
          totalPassengers,
          passCount,
          paidWithPass: anyPassUsed,
          status: booking.status,
        }
      })


    } catch (error: any) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }


  } catch (error: any) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Failed to create booking", details: error.message }, { status: 500 })
  }
}

