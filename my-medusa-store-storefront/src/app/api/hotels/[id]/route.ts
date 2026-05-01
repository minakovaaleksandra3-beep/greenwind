import { NextRequest, NextResponse } from "next/server"
import { pool } from "@lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query(
      "SELECT * FROM hotels WHERE id = $1 AND status = 'active'",
      [id]
    )


    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }


    return NextResponse.json({ hotel: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch hotel", details: error.message },
      { status: 500 }
    )
  }
}


