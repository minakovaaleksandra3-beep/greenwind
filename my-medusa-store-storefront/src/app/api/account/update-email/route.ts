import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
  try {
    const { email, customerId } = await req.json()


    if (!email || !customerId) {
      return NextResponse.json({ error: "Email and customerId are required" }, { status: 400 })
    }


    const updateRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/admin/customers/${customerId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    )


    if (!updateRes.ok) {
      const err = await updateRes.json()
      return NextResponse.json({ error: err.message || "Failed" }, { status: 400 })
    }


    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



