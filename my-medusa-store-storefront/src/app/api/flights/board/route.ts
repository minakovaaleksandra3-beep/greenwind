import { NextRequest, NextResponse } from "next/server"
import { pool } from "@lib/db"


export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type") || "departures" // departures | arrivals
    const airport = request.nextUrl.searchParams.get("airport") || "LDN"
    const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]


    const isDepartures = type === "departures"


    const result = await pool.query(`
      SELECT
        f.flight_number,
        f.departure_airport,
        f.arrival_airport,
        f.departure_time,
        f.arrival_time,
        f.duration,
        f.aircraft_type,
        f.operator,
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
      WHERE ${isDepartures ? "UPPER(f.departure_airport)" : "UPPER(f.arrival_airport)"} = UPPER($1)
        AND fs.departure_date = $2::date
      ORDER BY f.departure_time ASC
    `, [airport, date])


    const now = new Date()


    const flights = result.rows.map((row) => {
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


      let computedStatus = row.status || "scheduled"
      const nowMs = now.getTime()


      if (computedStatus === "scheduled" || computedStatus === "delayed") {
        if (nowMs > estimatedArr.getTime()) computedStatus = "landed"
        else if (nowMs > estimatedDep.getTime()) computedStatus = "in_air"
        else if ((row.delay_minutes || 0) > 0) computedStatus = "delayed"
      }


      return {
        flightNumber: row.flight_number,
        departureAirport: row.departure_airport,
        arrivalAirport: row.arrival_airport,
        departureAirportFull: row.departure_airport,
        arrivalAirportFull: row.arrival_airport,
        scheduledTime: isDepartures ? depTimeStr : arrTimeStr,
        estimatedTime: isDepartures
          ? estimatedDep.toISOString()
          : estimatedArr.toISOString(),
        delayMinutes: row.delay_minutes || 0,
        status: computedStatus,
        gate: row.gate || null,
        terminal: row.terminal || null,
        aircraft: row.aircraft_type || "Boeing 737",
        operator: row.operator || "GreenWing",
        scheduleId: row.schedule_id,
      }
    })


    return NextResponse.json({ flights, airport, type, date })


  } catch (error: any) {
    console.error("Flight board error:", error)
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 })
  }
}

