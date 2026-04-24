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
    const email = request.nextUrl.searchParams.get("email")
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 })


    const result = await pool.query(
      `SELECT
        tb.*,
        -- outbound flight info
        ob.booking_reference AS outbound_ref,
        ob.class AS outbound_class,
        ob.price_paid AS outbound_price,
        ob.status AS outbound_status,
        ofs.departure_date AS outbound_date,
        of2.flight_number AS outbound_flight_number,
        of2.departure_airport AS outbound_from,
        of2.arrival_airport AS outbound_to,
        of2.departure_time AS outbound_dep_time,
        of2.arrival_time AS outbound_arr_time,
        -- return flight info
        rb.booking_reference AS return_ref,
        rb.class AS return_class,
        rb.price_paid AS return_price,
        rb.status AS return_status,
        rfs.departure_date AS return_date,
        rf2.flight_number AS return_flight_number,
        rf2.departure_airport AS return_from,
        rf2.arrival_airport AS return_to,
        rf2.departure_time AS return_dep_time,
        rf2.arrival_time AS return_arr_time
      FROM trip_bookings tb
      LEFT JOIN bookings ob ON ob.id = tb.outbound_booking_id
      LEFT JOIN flight_schedules ofs ON ofs.id = ob.flight_schedule_id
      LEFT JOIN flights of2 ON of2.id = ofs.flight_id
      LEFT JOIN bookings rb ON rb.id = tb.return_booking_id
      LEFT JOIN flight_schedules rfs ON rfs.id = rb.flight_schedule_id
      LEFT JOIN flights rf2 ON rf2.id = rfs.flight_id
      WHERE tb.passenger_email = $1
      ORDER BY tb.created_at DESC`,
      [email]
    )


    const trips = result.rows.map(r => ({
      id: r.id,
      tripId: r.trip_id,
      passengerName: r.passenger_name,
      passengerEmail: r.passenger_email,
      adultsCount: r.adults_count,
      childrenCount: r.children_count,
      totalPrice: r.total_price / 100,
      paidWithPass: r.paid_with_pass,
      status: r.status,
      createdAt: r.created_at,
      outbound: {
        ref: r.outbound_ref,
        flightNumber: r.outbound_flight_number,
        from: r.outbound_from,
        to: r.outbound_to,
        date: r.outbound_date,
        depTime: r.outbound_dep_time?.substring(0, 5) || "",
        arrTime: r.outbound_arr_time?.substring(0, 5) || "",
        class: r.outbound_class,
        price: r.outbound_price / 100,
        status: r.outbound_status,
      },
      return: r.return_ref ? {
        ref: r.return_ref,
        flightNumber: r.return_flight_number,
        from: r.return_from,
        to: r.return_to,
        date: r.return_date,
        depTime: r.return_dep_time?.substring(0, 5) || "",
        arrTime: r.return_arr_time?.substring(0, 5) || "",
        class: r.return_class,
        price: r.return_price / 100,
        status: r.return_status,
      } : null,
    }))


    return NextResponse.json({ success: true, trips })


  } catch (error: any) {
    console.error("My trips error:", error)
    return NextResponse.json({ error: "Failed to fetch trips", details: error.message }, { status: 500 })
  }
}



