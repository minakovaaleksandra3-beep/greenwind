import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { Resend } from "resend"


const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "medusa-my-medusa-store",
  user: "postgres",
  password: "12345678",
})


const resend = new Resend(process.env.RESEND_API_KEY)


// Секретний ключ для захисту cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || "greenwing-cron-2026"


function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    delayed: "Delayed",
    in_air: "In Air",
    landed: "Landed",
    cancelled: "Cancelled",
  }
  return labels[status] || status
}


function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "#3b82f6",
    delayed: "#f97316",
    in_air: "#0d9488",
    landed: "#16a34a",
    cancelled: "#dc2626",
  }
  return colors[status] || "#6b7280"
}


function buildEmailHtml(params: {
  flightNumber: string
  flightDate: string
  oldStatus: string
  newStatus: string
  delayMinutes: number
  departureAirport: string
  arrivalAirport: string
  scheduledDeparture: string
  estimatedDeparture?: string
}): string {
  const { flightNumber, flightDate, oldStatus, newStatus, delayMinutes, departureAirport, arrivalAirport, scheduledDeparture, estimatedDeparture } = params
  const color = getStatusColor(newStatus)


  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
   
    <!-- Header -->
    <div style="background:#075951;padding:28px 32px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:white;margin-bottom:4px;">✈ GreenWing</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);">Flight Status Update</div>
    </div>


    <!-- Status badge -->
    <div style="padding:24px 32px 0;text-align:center;">
      <div style="display:inline-block;background:${color}15;border:1.5px solid ${color}40;border-radius:999px;padding:8px 20px;">
        <span style="color:${color};font-weight:700;font-size:15px;">${getStatusLabel(newStatus).toUpperCase()}</span>
      </div>
    </div>


    <!-- Flight info -->
    <div style="padding:24px 32px;">
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="font-size:28px;font-weight:800;color:#111;">${departureAirport}</div>
          <div style="color:#9ca3af;font-size:20px;">→</div>
          <div style="font-size:28px;font-weight:800;color:#111;">${arrivalAirport}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;">
          <div>Flight: <strong style="color:#111;">${flightNumber}</strong></div>
          <div>Date: <strong style="color:#111;">${new Date(flightDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong></div>
        </div>
      </div>


      <!-- Status change -->
      <div style="margin-bottom:20px;">
        <div style="font-size:13px;color:#6b7280;margin-bottom:8px;">Status changed</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="background:#f3f4f6;color:#6b7280;padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;">${getStatusLabel(oldStatus)}</span>
          <span style="color:#9ca3af;">→</span>
          <span style="background:${color}15;color:${color};padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700;">${getStatusLabel(newStatus)}</span>
        </div>
      </div>


      ${delayMinutes > 0 ? `
      <!-- Delay info -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-weight:700;color:#c2410c;margin-bottom:4px;">⚠ Delayed by ${delayMinutes} minutes</div>
        <div style="font-size:13px;color:#9a3412;">
          Scheduled: ${scheduledDeparture} ·
          ${estimatedDeparture ? `New estimated: ${estimatedDeparture}` : ""}
        </div>
      </div>
      ` : ""}


      ${newStatus === "cancelled" ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-weight:700;color:#dc2626;margin-bottom:4px;">✗ Flight Cancelled</div>
        <div style="font-size:13px;color:#991b1b;">Please contact GreenWing support for rebooking options.</div>
      </div>
      ` : ""}


      ${newStatus === "landed" ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-weight:700;color:#16a34a;margin-bottom:4px;">✓ Flight Landed</div>
        <div style="font-size:13px;color:#15803d;">The flight has arrived at its destination.</div>
      </div>
      ` : ""}
    </div>


    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6;">
      <div style="font-size:12px;color:#9ca3af;">
        You're receiving this because you subscribed to flight status updates.<br/>
        <strong style="color:#075951;">GreenWing Airlines</strong> · greenwing.com
      </div>
    </div>
  </div>
</body>
</html>`
}


export async function GET(request: NextRequest) {
  // Захист від несанкціонованого виклику
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }


  try {
    // Беремо всі активні підписки на майбутні рейси
    const subscriptions = await pool.query(`
      SELECT fn.*,
        f.flight_number, f.departure_airport, f.arrival_airport,
        f.departure_time, f.arrival_time,
        fs.status as current_status, fs.delay_minutes
      FROM flight_notifications fn
      JOIN flights f ON UPPER(f.flight_number) = UPPER(fn.flight_number)
      JOIN flight_schedules fs ON fs.flight_id = f.id AND fs.departure_date = fn.flight_date
      WHERE fn.flight_date >= CURRENT_DATE
      ORDER BY fn.flight_date ASC
    `)


    let sent = 0
    let checked = subscriptions.rows.length


    for (const sub of subscriptions.rows) {
      const currentStatus = sub.current_status || "scheduled"
      const currentDelay = sub.delay_minutes || 0
      const oldStatus = sub.last_known_status
      const oldDelay = sub.last_known_delay


      // Відправляємо якщо: статус змінився АБО затримка змінилась більш ніж на 15 хвилин
      const statusChanged = currentStatus !== oldStatus
      const delayChanged = Math.abs(currentDelay - oldDelay) >= 15


      if (statusChanged || delayChanged) {
        const depTime = String(sub.departure_time).slice(0, 5)
        const estimatedMinutes = currentDelay > 0
          ? (() => {
              const [h, m] = depTime.split(":").map(Number)
              const total = h * 60 + m + currentDelay
              return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
            })()
          : undefined


        try {
          await resend.emails.send({
            from: "onboarding@resend.dev", // Використовуємо Resend тестовий домен
            to: sub.email,
            subject: `✈ GreenWing ${sub.flight_number} — Status: ${getStatusLabel(currentStatus)}`,
            html: buildEmailHtml({
              flightNumber: sub.flight_number,
              flightDate: sub.flight_date,
              oldStatus,
              newStatus: currentStatus,
              delayMinutes: currentDelay,
              departureAirport: sub.departure_airport,
              arrivalAirport: sub.arrival_airport,
              scheduledDeparture: depTime,
              estimatedDeparture: estimatedMinutes,
            }),
          })


          // Оновлюємо запис
          await pool.query(
            `UPDATE flight_notifications
             SET last_known_status = $1, last_known_delay = $2, notified_at = NOW()
             WHERE id = $3`,
            [currentStatus, currentDelay, sub.id]
          )


          sent++
          console.log(`✅ Email sent to ${sub.email} for ${sub.flight_number}: ${oldStatus} → ${currentStatus}`)
        } catch (emailErr) {
          console.error(`❌ Failed to send email to ${sub.email}:`, emailErr)
        }
      }
    }


    return NextResponse.json({
      success: true,
      checked,
      sent,
      message: `Checked ${checked} subscriptions, sent ${sent} notifications`
    })


  } catch (error: any) {
    console.error("Cron error:", error)
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 })
  }
}

