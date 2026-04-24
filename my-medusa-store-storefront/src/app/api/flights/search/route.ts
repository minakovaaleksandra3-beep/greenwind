import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'medusa-my-medusa-store',
  user: 'postgres',
  password: '12345678',
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const date = searchParams.get("date") || new Date().toISOString().split('T')[0]

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing required parameters: from, to" },
      { status: 400 }
    )
  }

  try {
    const query = `
      SELECT
        f.*,
        fs.id as schedule_id,
        fs.departure_date,
        fs.available_seats_economy,
        fs.available_seats_business,
        fs.price_economy as current_price_economy,
        fs.price_business as current_price_business,
        fs.status as schedule_status
      FROM flights f
      INNER JOIN flight_schedules fs ON f.id = fs.flight_id
      WHERE f.departure_airport = $1
        AND f.arrival_airport = $2
        AND fs.departure_date = $3
        AND f.status = 'active'
        AND fs.status = 'scheduled'
      ORDER BY f.departure_time ASC
    `
    
    const result = await pool.query(query, [from.toUpperCase(), to.toUpperCase(), date])
   
    return NextResponse.json({
      success: true,
      flights: result.rows,
      count: result.rows.length,
      searchParams: { from, to, date }
    })
  } catch (error: any) {
    console.error("Flight search error:", error)
    return NextResponse.json(
      { error: "Failed to fetch flights", details: error.message },
      { status: 500 }
    )
  }
}
