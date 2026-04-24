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
  const city = searchParams.get("city")
  const sortBy = searchParams.get("sort") || "recommended"
  const type = searchParams.get("type") || ""
  const maxPrice = searchParams.get("maxPrice") || ""


  if (!city) {
    return NextResponse.json({ error: "Missing city parameter" }, { status: 400 })
  }


  try {
    let orderBy = "rating DESC"
    if (sortBy === "price") orderBy = "price_per_night ASC"
    if (sortBy === "rating") orderBy = "rating DESC"


    let conditions = ["city_code = $1", "status = 'active'"]
    let params: any[] = [city.toUpperCase()]
    let idx = 2


    if (type) {
      conditions.push(`type = $${idx}`)
      params.push(type)
      idx++
    }


    if (maxPrice) {
      conditions.push(`price_per_night <= $${idx}`)
      params.push(parseFloat(maxPrice))
      idx++
    }


    const query = `
      SELECT * FROM hotels
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
    `


    const result = await pool.query(query, params)


    return NextResponse.json({
      success: true,
      hotels: result.rows,
      count: result.rows.length,
    })
  } catch (error: any) {
    console.error("Hotel search error:", error)
    return NextResponse.json(
      { error: "Failed to fetch hotels", details: error.message },
      { status: 500 }
    )
  }
}



