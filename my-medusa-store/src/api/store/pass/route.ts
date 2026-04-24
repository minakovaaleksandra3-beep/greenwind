import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"


export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authHeader = req.headers.authorization


  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" })
  }


  const token = authHeader.split(" ")[1]


  let customerId: string
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret", {
      ignoreExpiration: true
    }) as any
    customerId = decoded.actor_id
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }


  if (!customerId) {
    return res.status(401).json({ error: "No customer" })
  }


  const body = req.body as any
  const customerModuleService = req.scope.resolve("customer") as any


  // Якщо передано pass_flights_left — тільки оновлюємо лічильник
  if (typeof body?.pass_flights_left === "number") {
    await customerModuleService.updateCustomers(customerId, {
      metadata: {
        pass_flights_left: body.pass_flights_left,
      },
    })
    return res.status(200).json({ success: true, pass_flights_left: body.pass_flights_left })
  }


  // Інакше — активація підписки
  await customerModuleService.updateCustomers(customerId, {
    metadata: {
      has_pass: true,
      pass_activated_at: new Date().toISOString(),
      pass_flights_left: 3,
    },
  })


  return res.status(200).json({ success: true })
}


