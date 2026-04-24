import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { getDealsForCity, DEALS_BY_CITY } from "@lib/data/deals-data"
import { notFound } from "next/navigation"
import OutboundClient from "./outbound-client"


interface Props {
  params: { dealId: string; countryCode: string }
}


// Знаходимо deal по id серед усіх міст
function findDealById(dealId: string) {
  for (const deals of Object.values(DEALS_BY_CITY)) {
    const deal = deals.find(d => d.id === dealId)
    if (deal) return deal
  }
  return null
}


export default async function OutboundPage({ params }: Props) {
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer()
  const deal = findDealById(params.dealId)


  if (!deal) notFound()


  return (
    <OutboundClient
      deal={deal}
      currentLocale={currentLocale}
      customerName={customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Guest"}
      customerEmail={customer?.email || "guest@greenwing.com"}
    />
  )
}



