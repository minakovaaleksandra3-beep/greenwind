import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import SearchClient from "./search-client"


export default async function SearchPage() {
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer()


  return (
    <SearchClient
      currentLocale={currentLocale}
      customerName={customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Guest"}
      customerEmail={customer?.email || "guest@greenwing.com"}
      hasPass={customer?.metadata?.has_pass === true}
      passFlightsLeft={typeof customer?.metadata?.pass_flights_left === "number" ? customer.metadata.pass_flights_left : 3}
    />
  )
}

