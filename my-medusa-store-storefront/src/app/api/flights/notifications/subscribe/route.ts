import { NextRequest, NextResponse } from "next/server"
import { pool } from "@lib/db"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)


function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: "Scheduled — on time",
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


function buildConfirmationEmail(params: {
  flightNumber: string
  flightDate: string
  currentStatus: string
  departureAirport: string
  arrivalAirport: string
  scheduledDeparture: string
  scheduledArrival: string
  delayMinutes: number
  email: string
}): string {
  const { flightNumber, flightDate, currentStatus, departureAirport, arrivalAirport, scheduledDeparture, scheduledArrival, delayMinutes, email } = params
  const color = getStatusColor(currentStatus)
  const formattedDate = new Date(flightDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })


  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
   
    <!-- Header -->
    <div style="background:#075951;padding:28px 32px;">
      <div style="font-size:22px;font-weight:700;color:white;margin-bottom:2px;">✈ GreenWing</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);">Flight Tracking Confirmation</div>
    </div>


    <div style="padding:28px 32px;">
      <!-- Confirmation message -->
      <div style="margin-bottom:24px;">
        <div style="font-size:20px;font-weight:700;color:#111;margin-bottom:8px;">You're now tracking your flight</div>
        <div style="font-size:14px;color:#6b7280;">We'll notify you at <strong style="color:#111;">${email}</strong> if anything changes.</div>
      </div>


      <!-- Flight card -->
      <div style="background:#f9fafb;border-radius:14px;padding:20px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#111;">${departureAirport}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:2px;">${scheduledDeparture}</div>
          </div>
          <div style="text-align:center;color:#9ca3af;">
            <div style="font-size:20px;">✈</div>
            <div style="font-size:11px;margin-top:2px;">Direct</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#111;">${arrivalAirport}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:2px;">${scheduledArrival}</div>
          </div>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:14px;display:flex;justify-content:space-between;font-size:13px;">
          <div><span style="color:#9ca3af;">Flight</span> <strong style="color:#111;">${flightNumber}</strong></div>
          <div><span style="color:#9ca3af;">Date</span> <strong style="color:#111;">${formattedDate}</strong></div>
        </div>
      </div>


      <!-- Current status -->
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Current status</div>
        <div style="display:inline-flex;align-items:center;gap:8px;background:${color}12;border:1.5px solid ${color}30;border-radius:999px;padding:8px 18px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
          <span style="color:${color};font-weight:700;font-size:14px;">${getStatusLabel(currentStatus)}</span>
        </div>
        ${delayMinutes > 0 ? `<div style="margin-top:8px;font-size:13px;color:#f97316;">⚠ Delayed by ${delayMinutes} minutes</div>` : ""}
      </div>


      <!-- What's next -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
        <div style="font-weight:600;color:#15803d;margin-bottom:6px;">What happens next?</div>
        <div style="font-size:13px;color:#166534;line-height:1.6;">
          We'll send you an email immediately if:<br/>
          · The flight is delayed or further delayed<br/>
          · The flight is cancelled<br/>
          · The flight departs or lands
        </div>
      </div>
    </div>


    <!-- Footer -->
    <div style="background:#f9fafb;padding:18px 32px;text-align:center;border-top:1px solid #f3f4f6;">
      <div style="font-size:12px;color:#9ca3af;">
        <strong style="color:#075951;">GreenWing Airlines</strong> · greenwing.com
      </div>
    </div>
  </div>
</body>
</html>`
}


export async function POST(request: NextRequest) {
  try {
    const { email, flightNumber, flightDate } = await request.json()


    if (!email || !flightNumber || !flightDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }


    // Шукаємо рейс за flight_number або booking_reference
    const flightCheck = await pool.query(
      `SELECT DISTINCT fs.id, fs.status, fs.delay_minutes,
              f.flight_number, f.departure_airport, f.arrival_airport,
              f.departure_time, f.arrival_time
       FROM flight_schedules fs
       JOIN flights f ON f.id = fs.flight_id
       LEFT JOIN bookings b ON b.flight_schedule_id = fs.id
       WHERE (
         UPPER(f.flight_number) = UPPER($1)
         OR UPPER(b.booking_reference) = UPPER($1)
       )
       AND fs.departure_date = $2::date
       LIMIT 1`,
      [flightNumber.trim(), flightDate]
    )


    if (flightCheck.rows.length === 0) {
      return NextResponse.json({ error: "Flight not found for this date" }, { status: 404 })
    }


    const flight = flightCheck.rows[0]
    const currentStatus = flight.status || "scheduled"
    const realFlightNumber = flight.flight_number
    const depTime = String(flight.departure_time).slice(0, 5)
    const arrTime = String(flight.arrival_time).slice(0, 5)


    // Зберігаємо підписку
    await pool.query(
      `INSERT INTO flight_notifications (email, flight_number, flight_date, last_known_status, last_known_delay)
       VALUES ($1, UPPER($2), $3::date, $4, $5)
       ON CONFLICT (email, flight_number, flight_date)
       DO UPDATE SET last_known_status = $4, last_known_delay = $5, notified_at = NULL`,
      [email.toLowerCase(), realFlightNumber, flightDate, currentStatus, flight.delay_minutes || 0]
    )


    // Відправляємо confirmation email
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: `✈ You're tracking ${realFlightNumber} — ${flight.departure_airport} → ${flight.arrival_airport}`,
        html: buildConfirmationEmail({
          flightNumber: realFlightNumber,
          flightDate,
          currentStatus,
          departureAirport: flight.departure_airport,
          arrivalAirport: flight.arrival_airport,
          scheduledDeparture: depTime,
          scheduledArrival: arrTime,
          delayMinutes: flight.delay_minutes || 0,
          email,
        }),
      })
      console.log(`✅ Confirmation email sent to ${email} for ${realFlightNumber}`)
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr)
      // Не повертаємо помилку — підписка збережена навіть якщо email не відправився
    }


    return NextResponse.json({
      success: true,
      message: "Subscribed! Check your email for confirmation.",
      flightNumber: realFlightNumber,
    })


  } catch (error: any) {
    console.error("Subscribe error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { email, flightNumber, flightDate } = await request.json()
    await pool.query(
      `DELETE FROM flight_notifications
       WHERE email = $1 AND UPPER(flight_number) = UPPER($2) AND flight_date = $3::date`,
      [email.toLowerCase(), flightNumber, flightDate]
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

