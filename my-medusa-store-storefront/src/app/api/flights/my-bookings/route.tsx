import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"


const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'medusa-my-medusa-store',
  user: 'postgres',
  password: '12345678',
})


export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value


    // Отримуємо email з query param (передається з my-flights-page)
    const emailFromQuery = request.nextUrl.searchParams.get("email")


    let passengerEmail: string | null = emailFromQuery


    // Якщо є JWT — декодуємо і беремо email звідти
    if (token && !passengerEmail) {
      try {
        const decoded = jwtDecode<{ email?: string; sub?: string }>(token)
        passengerEmail = decoded.email || null
      } catch {
        // JWT не вдалось декодувати
      }
    }


    if (!passengerEmail) {
      return NextResponse.json({ error: "Unauthorized - no email found" }, { status: 401 })
    }


    const result = await pool.query(`
      SELECT
        b.*,
        f.flight_number,
        f.departure_airport,
        f.arrival_airport,
        f.departure_time,
        f.arrival_time,
        f.duration,
        f.is_direct,
        f.operator,
        fs.departure_date,
        fs.price_economy,
        fs.price_business
      FROM bookings b
      JOIN flight_schedules fs ON fs.id = b.flight_schedule_id
      JOIN flights f ON f.id = fs.flight_id
      WHERE b.passenger_email = $1
      ORDER BY b.created_at DESC
    `, [passengerEmail])


    const bookings = result.rows.map((b) => ({
      id: b.id,
      reference: b.booking_reference,
      flightNumber: b.flight_number,
      departure: b.departure_airport,
      arrival: b.arrival_airport,
      departureTime: b.departure_time?.substring(0, 5) || "",
      arrivalTime: b.arrival_time?.substring(0, 5) || "",
      departureDate: b.departure_date,
      duration: b.duration,
      isDirect: b.is_direct,
      operator: b.operator,
      class: b.class,
      pricePaid: b.price_paid / 100,
      status: b.status,
      paidWithPass: b.paid_with_pass || false,
      bookedAt: b.created_at,
    }))


    return NextResponse.json({ success: true, bookings })


  } catch (error: any) {
    console.error("My bookings error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings", details: error.message }, { status: 500 })
  }
}

