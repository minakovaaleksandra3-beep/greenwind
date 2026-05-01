import { NextRequest, NextResponse } from "next/server"
import { pool } from "@lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"



async function getEmailFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  if (token) {
    try {
      const decoded = jwtDecode<{ email?: string }>(token)
      if (decoded.email) return decoded.email
    } catch {}
  }
  return request.nextUrl.searchParams.get("email")
}


// GET - отримати аватарку
export async function GET(request: NextRequest) {
  const email = await getEmailFromRequest(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


  const result = await pool.query(
    "SELECT avatar_path FROM customer_avatars WHERE email = $1",
    [email]
  )


  if (result.rows.length === 0) {
    return NextResponse.json({ avatarUrl: null })
  }


  return NextResponse.json({ avatarUrl: result.rows[0].avatar_path })
}


// POST - завантажити аватарку
export async function POST(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request)
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


    const formData = await request.formData()
    const file = formData.get("avatar") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })


    // Перевірка типу
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    }




    const buffer = Buffer.from(await file.arrayBuffer())


    // Створюємо папку якщо не існує    
    const avatarsDir = join(process.cwd(), "public", "avatars")
    await mkdir(avatarsDir, { recursive: true })


    // Унікальне ім'я файлу на основі email
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${email.replace(/[^a-z0-9]/gi, "_")}.${ext}`
    const filepath = join(avatarsDir, filename)


    await writeFile(filepath, buffer)


    const avatarUrl = `/avatars/${filename}`


    // Зберігаємо в базу
    await pool.query(
      `INSERT INTO customer_avatars (email, avatar_path, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (email) DO UPDATE SET avatar_path = $2, updated_at = NOW()`,
      [email, avatarUrl]
    )


    return NextResponse.json({ success: true, avatarUrl })
  } catch (error: any) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 })
  }
}


