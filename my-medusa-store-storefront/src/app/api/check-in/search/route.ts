import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { fromZonedTime } from "date-fns-tz"


const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "medusa-my-medusa-store",
  user: "postgres",
  password: "12345678",
})


// Timezone для кожного аеропорту
const AIRPORT_TIMEZONES: Record<string, string> = {
  LDN: "Europe/London",
  PAR: "Europe/Paris",
  BER: "Europe/Berlin",
  AMS: "Europe/Amsterdam",
  MAD: "Europe/Madrid",
  BCN: "Europe/Madrid",
  ROM: "Europe/Rome",
  VIE: "Europe/Vienna",
  KBP: "Europe/Kyiv",
  GDN: "Europe/Warsaw",
  RIG: "Europe/Riga",
  STO: "Europe/Stockholm",
  CPH: "Europe/Copenhagen",
  OSL: "Europe/Oslo",
  HEL: "Europe/Helsinki",
  WAW: "Europe/Warsaw",
  BUD: "Europe/Budapest",
  DUB: "Europe/Dublin",
  ZUR: "Europe/Zurich",
  BRU: "Europe/Brussels",
  LIS: "Europe/Lisbon",
  ATH: "Europe/Athens",
  PRG: "Europe/Prague",
}


export async function POST(request: NextRequest) {
  try {
    const { bookingRef, lastName } = await request.json()


    if (!bookingRef || !lastName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }


    const result = await pool.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.passenger_name,
        b.passenger_email,
        b.class,
        b.price_paid,
        b.status,
        b.paid_with_pass,
        b.seat,
        b.created_at,
        fs.departure_date,
        fs.id as schedule_id,
        f.flight_number,
        f.departure_airport,
        f.arrival_airport,
        f.departure_time,
        f.arrival_time,
        f.aircraft_type
      FROM bookings b
      JOIN flight_schedules fs ON fs.id = b.flight_schedule_id
      JOIN flights f ON f.id = fs.flight_id
      WHERE
        UPPER(b.booking_reference) = UPPER($1)
        AND UPPER(b.passenger_name) ILIKE $2
      LIMIT 1`,
      [bookingRef.trim(), `%${lastName.trim()}%`]
    )


    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }


    const booking = result.rows[0]


    // ✅ Парсимо дату без toISOString щоб уникнути UTC зсуву
    const rawDate = booking.departure_date
    let dateStr: string
    if (rawDate instanceof Date) {
      const y = rawDate.getFullYear()
      const m = String(rawDate.getMonth() + 1).padStart(2, "0")
      const d = String(rawDate.getDate()).padStart(2, "0")
      dateStr = `${y}-${m}-${d}`
    } else {
      dateStr = String(rawDate).split("T")[0]
    }


    const timeStr = String(booking.departure_time).slice(0, 5) // "HH:MM"
    const [year, month, day] = dateStr.split("-").map(Number)
    const [hour, minute] = timeStr.split(":").map(Number)


    // ✅ Визначаємо timezone аеропорту вильоту
    const airportCode = booking.departure_airport as string
    const tz = AIRPORT_TIMEZONES[airportCode] || "Europe/London"


    // ✅ fromZonedTime: "07:00 за часом цього аеропорту" → UTC
    const localDatetime = new Date(year, month - 1, day, hour, minute, 0)
    const departureDateTime = fromZonedTime(localDatetime, tz)


    const now = new Date()
    const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)


    console.log("CHECK-IN DEBUG:", {
      bookingRef,
      airport: airportCode,
      timezone: tz,
      dateStr,
      timeStr,
      departureDateTime: departureDateTime.toISOString(),
      now: now.toISOString(),
      hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
      canCheckIn: hoursUntilDeparture <= 48 && hoursUntilDeparture >= 1,
    })


    // Завантажуємо пасажирів
    const passengersResult = await pool.query(
      `SELECT id, passenger_type, first_name, last_name, middle_name, seat, checked_in
       FROM booking_passengers WHERE booking_id = $1 ORDER BY id`,
      [booking.id]
    )


    const passengers = passengersResult.rows.map((p: any) => ({
      id: p.id,
      type: p.passenger_type,
      firstName: p.first_name,
      lastName: p.last_name,
      middleName: p.middle_name,
      seat: p.seat,
      checkedIn: p.checked_in,
    }))


    return NextResponse.json({
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        passengerName: booking.passenger_name,
        passengerEmail: booking.passenger_email,
        class: booking.class,
        pricePaid: booking.price_paid,
        status: booking.status,
        paidWithPass: booking.paid_with_pass,
        seat: booking.seat,
        scheduleId: booking.schedule_id,
        flightNumber: booking.flight_number,
        departureAirport: booking.departure_airport,
        arrivalAirport: booking.arrival_airport,
        departureDate: dateStr,
        departureTime: booking.departure_time,
        arrivalTime: booking.arrival_time,
        aircraftType: booking.aircraft_type,
        passengers,
        departureDateTime: departureDateTime.toISOString(),
        hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
        canCheckIn: hoursUntilDeparture <= 48 && hoursUntilDeparture >= 1,
        checkInOpenAt: new Date(departureDateTime.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        checkInCloseAt: new Date(departureDateTime.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        gateCloseAt: new Date(departureDateTime.getTime() - 45 * 60 * 1000).toISOString(),
      }
    })


  } catch (error: any) {
    console.error("Check-in search error:", error)
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 })
  }
}

