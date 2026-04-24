import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "medusa-my-medusa-store",
  user: "postgres",
  password: "12345678",
})

export async function GET(request: NextRequest) {
  try {
    const flightNumber = request.nextUrl.searchParams.get("flightNumber")
    const date = request.nextUrl.searchParams.get("date")
    const from = request.nextUrl.searchParams.get("from")
    const to = request.nextUrl.searchParams.get("to")

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    let query: string
    let params: any[]

    if (flightNumber) {
      query = `
        SELECT DISTINCT
          f.flight_number,
          f.departure_airport,
          f.arrival_airport,
          f.departure_time,
          f.arrival_time,
          f.duration,
          f.aircraft_type,
          fs.id as schedule_id,
          fs.departure_date,
          fs.status,
          fs.delay_minutes,
          fs.actual_departure,
          fs.actual_arrival,
          fs.gate,
          fs.terminal,
          fs.available_seats_economy,
          fs.available_seats_business
        FROM flights f
        JOIN flight_schedules fs ON fs.flight_id = f.id
        LEFT JOIN bookings b ON b.flight_schedule_id = fs.id
        WHERE (
          UPPER(f.flight_number) = UPPER($1)
          OR UPPER(b.booking_reference) = UPPER($1)
        )
        AND fs.departure_date = $2::date
        LIMIT 1
      `
      params = [flightNumber.trim(), date]
    } else if (from && to) {
      query = `
        SELECT 
          f.flight_number,
          f.departure_airport,
          f.arrival_airport,
          f.departure_time,
          f.arrival_time,
          f.duration,
          f.aircraft_type,
          fs.id as schedule_id,
          fs.departure_date,
          fs.status,
          fs.delay_minutes,
          fs.actual_departure,
          fs.actual_arrival,
          fs.gate,
          fs.terminal,
          fs.available_seats_economy,
          fs.available_seats_business
        FROM flights f
        JOIN flight_schedules fs ON fs.flight_id = f.id
        WHERE UPPER(f.departure_airport) = UPPER($1)
          AND UPPER(f.arrival_airport) = UPPER($2)
          AND fs.departure_date = $3::date
        ORDER BY f.departure_time
      `
      params = [from.trim(), to.trim(), date]
    } else {
      return NextResponse.json({ error: "flightNumber or from+to required" }, { status: 400 })
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return NextResponse.json({ flights: [] })
    }

    const now = new Date()

    const flights = result.rows.map((row) => {
      // Парсимо дату правильно (без toISOString щоб не зсунути timezone)
      const rawDate = row.departure_date
      let dateStr: string
      if (rawDate instanceof Date) {
        const y = rawDate.getFullYear()
        const m = String(rawDate.getMonth() + 1).padStart(2, "0")
        const d = String(rawDate.getDate()).padStart(2, "0")
        dateStr = `${y}-${m}-${d}`
      } else {
        dateStr = String(rawDate).split("T")[0]
      }

      const depTimeStr = String(row.departure_time).slice(0, 5)
      const arrTimeStr = String(row.arrival_time).slice(0, 5)
      const [dy, dm, dd] = dateStr.split("-").map(Number)
      const [dh, dmin] = depTimeStr.split(":").map(Number)
      const [ah, amin] = arrTimeStr.split(":").map(Number)

      const scheduledDep = new Date(Date.UTC(dy, dm - 1, dd, dh, dmin))
      const scheduledArr = new Date(Date.UTC(dy, dm - 1, dd, ah, amin))
      if (scheduledArr <= scheduledDep) scheduledArr.setUTCDate(scheduledArr.getUTCDate() + 1)

      const delayMs = (row.delay_minutes || 0) * 60 * 1000
      const estimatedDep = new Date(scheduledDep.getTime() + delayMs)
      const estimatedArr = new Date(scheduledArr.getTime() + delayMs)

      // Визначаємо реальний статус на основі часу
      let computedStatus = row.status || "scheduled"
      const nowMs = now.getTime()

      if (computedStatus === "scheduled" || computedStatus === "delayed") {
        if (nowMs > estimatedArr.getTime()) {
          computedStatus = "landed"
        } else if (nowMs > estimatedDep.getTime()) {
          computedStatus = "in_air"
        } else if ((row.delay_minutes || 0) > 0) {
          computedStatus = "delayed"
        }
      }

      // Прогрес польоту (0-100%)
      let progress = 0
      if (computedStatus === "in_air") {
        const flightDuration = estimatedArr.getTime() - estimatedDep.getTime()
        const elapsed = nowMs - estimatedDep.getTime()
        progress = Math.min(100, Math.max(0, Math.round((elapsed / flightDuration) * 100)))
      } else if (computedStatus === "landed") {
        progress = 100
      }

      return {
        flightNumber: row.flight_number,
        departureAirport: row.departure_airport,
        arrivalAirport: row.arrival_airport,
        departureDate: dateStr,
        scheduledDeparture: depTimeStr,
        scheduledArrival: arrTimeStr,
        estimatedDeparture: estimatedDep.toISOString(),
        estimatedArrival: estimatedArr.toISOString(),
        actualDeparture: row.actual_departure ? String(row.actual_departure).slice(0, 5) : null,
        actualArrival: row.actual_arrival ? String(row.actual_arrival).slice(0, 5) : null,
        delayMinutes: row.delay_minutes || 0,
        status: computedStatus,
        gate: row.gate || null,
        terminal: row.terminal || null,
        aircraft: row.aircraft_type || "Boeing 737",
        durationMinutes: row.duration || 120,
        availableSeatsEconomy: row.available_seats_economy,
        availableSeatsBusiness: row.available_seats_business,
        progress,
      }
    })

    return NextResponse.json({ flights })

  } catch (error: any) {
    console.error("Flight status error:", error)
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 })
  }
}

