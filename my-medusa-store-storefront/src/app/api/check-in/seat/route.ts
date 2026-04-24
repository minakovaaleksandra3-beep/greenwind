import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"


const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "medusa-my-medusa-store",
  user: "postgres",
  password: "12345678",
})


export async function POST(request: NextRequest) {
  try {
    const { bookingId, passengerId, seat } = await request.json()


    if (!seat) {
      return NextResponse.json({ error: "Missing seat" }, { status: 400 })
    }


    // Перевіряємо чи місце вже зайняте
    let scheduleId: number


    if (passengerId) {
      // Новий варіант — по passenger id
      const pRes = await pool.query(
        `SELECT b.flight_schedule_id FROM booking_passengers bp
         JOIN bookings b ON b.id = bp.booking_id
         WHERE bp.id = $1`,
        [passengerId]
      )
      if (pRes.rows.length === 0) {
        return NextResponse.json({ error: "Passenger not found" }, { status: 404 })
      }
      scheduleId = pRes.rows[0].flight_schedule_id


      // Перевіряємо чи місце зайняте іншим пасажиром
      const taken = await pool.query(
        `SELECT bp.id FROM booking_passengers bp
         JOIN bookings b ON b.id = bp.booking_id
         WHERE b.flight_schedule_id = $1 AND bp.seat = $2 AND bp.id != $3`,
        [scheduleId, seat, passengerId]
      )
      if (taken.rows.length > 0) {
        return NextResponse.json({ error: "Seat already taken" }, { status: 409 })
      }


      // Зберігаємо місце пасажиру
      await pool.query(
        `UPDATE booking_passengers SET seat = $1, checked_in = true WHERE id = $2`,
        [seat, passengerId]
      )


      // Перевіряємо чи всі пасажири бронювання зареєстровані
      const bookingRes = await pool.query(
        `SELECT bp.booking_id FROM booking_passengers bp WHERE bp.id = $1`,
        [passengerId]
      )
      const bId = bookingRes.rows[0]?.booking_id


      if (bId) {
        const allChecked = await pool.query(
          `SELECT COUNT(*) as total,
                  SUM(CASE WHEN checked_in = true THEN 1 ELSE 0 END) as checked
           FROM booking_passengers WHERE booking_id = $1`,
          [bId]
        )
        const { total, checked } = allChecked.rows[0]
        if (parseInt(total) === parseInt(checked)) {
          await pool.query(
            `UPDATE bookings SET status = 'checked_in' WHERE id = $1`,
            [bId]
          )
        }
      }


    } else if (bookingId) {
      // Старий варіант — по booking id (сумісність)
      const bookingResult = await pool.query(
        `SELECT flight_schedule_id FROM bookings WHERE id = $1`,
        [bookingId]
      )
      if (bookingResult.rows.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      scheduleId = bookingResult.rows[0].flight_schedule_id


      const takenResult = await pool.query(
        `SELECT bp.id FROM booking_passengers bp
         JOIN bookings b ON b.id = bp.booking_id
         WHERE b.flight_schedule_id = $1 AND bp.seat = $2`,
        [scheduleId, seat]
      )
      if (takenResult.rows.length > 0) {
        return NextResponse.json({ error: "Seat already taken" }, { status: 409 })
      }


      // Призначаємо першому незареєстрованому пасажиру
      const firstUnchecked = await pool.query(
        `SELECT id FROM booking_passengers
         WHERE booking_id = $1 AND checked_in = false
         ORDER BY id LIMIT 1`,
        [bookingId]
      )


      if (firstUnchecked.rows.length > 0) {
        await pool.query(
          `UPDATE booking_passengers SET seat = $1, checked_in = true WHERE id = $2`,
          [seat, firstUnchecked.rows[0].id]
        )
      }


      await pool.query(
        `UPDATE bookings SET seat = $1, status = 'checked_in' WHERE id = $2`,
        [seat, bookingId]
      )
    } else {
      return NextResponse.json({ error: "Missing bookingId or passengerId" }, { status: 400 })
    }


    return NextResponse.json({ success: true, seat })


  } catch (error: any) {
    console.error("Seat selection error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


export async function GET(request: NextRequest) {
  try {
    const scheduleId = request.nextUrl.searchParams.get("scheduleId")


    if (!scheduleId) {
      return NextResponse.json({ error: "Missing scheduleId" }, { status: 400 })
    }


    // Збираємо зайняті місця з booking_passengers
    const result = await pool.query(
      `SELECT bp.seat FROM booking_passengers bp
       JOIN bookings b ON b.id = bp.booking_id
       WHERE b.flight_schedule_id = $1 AND bp.seat IS NOT NULL`,
      [scheduleId]
    )


    // + старі місця з bookings (сумісність)
    const oldResult = await pool.query(
      `SELECT seat FROM bookings
       WHERE flight_schedule_id = $1 AND seat IS NOT NULL`,
      [scheduleId]
    )


    const takenSeats = [
      ...result.rows.map((r: any) => r.seat),
      ...oldResult.rows.map((r: any) => r.seat),
    ].filter((v, i, a) => a.indexOf(v) === i) // унікальні


    return NextResponse.json({ takenSeats })


  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}



