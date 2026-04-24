import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import MyTripsClient from "./my-trips-client"


export default async function MyTripsPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const currentLocale = await getLocale()


  return (
    <MyTripsClient
      customerEmail={customer?.email || null}
      customerName={customer?.first_name || ""}
      currentLocale={currentLocale}
      isLoggedIn={!!customer}
    />
  )
}



