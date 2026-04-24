import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getCacheTag } from "@lib/data/cookies"


export async function POST() {
  try {
    const customerTag = await getCacheTag("customers")
    revalidateTag(customerTag)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

