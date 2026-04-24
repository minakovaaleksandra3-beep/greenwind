import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import MyFlightsClient from "./my-flights-client"


export default async function MyFlightsPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const currentLocale = await getLocale()


  return (
    <MyFlightsClient
      customerEmail={customer?.email || null}
      customerName={customer?.first_name || ""}
      currentLocale={currentLocale}
      isLoggedIn={!!customer}
    />
  )
}



