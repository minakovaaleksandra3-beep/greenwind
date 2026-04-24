import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { DEALS_BY_CITY } from "@lib/data/deals-data"
import { notFound } from "next/navigation"
import HotelStepClient from "./hotel-step-client"


interface Props {
  params: { dealId: string; countryCode: string }
  searchParams: {
    outboundScheduleId?: string
    outboundClass?: string
    outboundTime?: string
    outboundArrivalTime?: string
    outboundFlightNumber?: string
    outboundPrice?: string
    returnScheduleId?: string
    returnClass?: string
    returnTime?: string
    returnArrivalTime?: string
    returnFlightNumber?: string
    returnPrice?: string
    adults?: string
    children?: string
  }
}


function findDealById(dealId: string) {
  for (const deals of Object.values(DEALS_BY_CITY)) {
    const deal = deals.find(d => d.id === dealId)
    if (deal) return deal
  }
  return null
}


export default async function HotelStepPage({ params, searchParams }: Props) {
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer()
  const deal = findDealById(params.dealId)


  if (!deal) notFound()


  return (
    <HotelStepClient
      deal={deal}
      currentLocale={currentLocale}
      customerName={customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Guest"}
      customerEmail={customer?.email || "guest@greenwing.com"}
      outboundScheduleId={searchParams.outboundScheduleId || ""}
      outboundClass={searchParams.outboundClass || "economy"}
      outboundTime={searchParams.outboundTime || ""}
      outboundArrivalTime={searchParams.outboundArrivalTime || ""}
      outboundFlightNumber={searchParams.outboundFlightNumber || ""}
      outboundPrice={searchParams.outboundPrice || "0"}
      returnScheduleId={searchParams.returnScheduleId || ""}
      returnClass={searchParams.returnClass || "economy"}
      returnTime={searchParams.returnTime || ""}
      returnArrivalTime={searchParams.returnArrivalTime || ""}
      returnFlightNumber={searchParams.returnFlightNumber || ""}
      returnPrice={searchParams.returnPrice || "0"}
      adults={parseInt(searchParams.adults || "1")}
      children={parseInt(searchParams.children || "0")}
    />
  )
}



