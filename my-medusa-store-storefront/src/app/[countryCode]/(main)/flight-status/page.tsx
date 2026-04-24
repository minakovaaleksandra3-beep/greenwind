import { Suspense } from "react"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import FlightStatusClient from "./flight-status-client"


export const metadata = {
  title: "Flight Status | GreenWing",
  description: "Track your GreenWing flight in real time",
}


export default async function FlightStatusPage() {
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer().catch(() => null)


  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>}>
      <FlightStatusClient
        currentLocale={currentLocale}
        customerName={customer?.first_name || null}
        customerEmail={customer?.email || null}
        isLoggedIn={!!customer}
      />
    </Suspense>
  )
}

