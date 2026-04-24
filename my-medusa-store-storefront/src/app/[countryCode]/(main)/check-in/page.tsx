import { Metadata } from "next"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import CheckInClient from "./check-in-client"


export const metadata: Metadata = {
  title: "Online Check-in | GreenWing",
  description: "Check in online and skip the airport queues",
}


export default async function CheckInPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const currentLocale = await getLocale()


  return (
    <CheckInClient
      currentLocale={currentLocale}
      customerName={customer?.first_name || null}
      customerEmail={customer?.email || null}
      isLoggedIn={!!customer}
    />
  )
}

