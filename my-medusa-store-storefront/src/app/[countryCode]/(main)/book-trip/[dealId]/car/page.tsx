import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { DEALS_BY_CITY } from "@lib/data/deals-data"
import { notFound } from "next/navigation"
import CarClient from "./car-client"


function findDealById(dealId: string) {
  for (const deals of Object.values(DEALS_BY_CITY)) {
    const deal = deals.find(d => d.id === dealId)
    if (deal) return deal
  }
  return null
}


interface Props {
  params: Promise<{ dealId: string; countryCode: string }>
  searchParams: Promise<{
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
    hotelId?: string
    adults?: string
    children?: string
  }>
}


export default async function CarPage({ params, searchParams }: Props) {
  const { dealId } = await params
  const sp = await searchParams
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer()
  const deal = findDealById(dealId)


  if (!deal) notFound()


  return (
    <CarClient
      deal={deal}
      currentLocale={currentLocale}
      customerName={customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Guest"}
      customerEmail={customer?.email || "guest@greenwing.com"}
      outboundScheduleId={sp.outboundScheduleId || ""}
      outboundClass={sp.outboundClass || "economy"}
      outboundTime={sp.outboundTime || ""}
      outboundArrivalTime={sp.outboundArrivalTime || ""}
      outboundFlightNumber={sp.outboundFlightNumber || ""}
      outboundPrice={sp.outboundPrice || "0"}
      returnScheduleId={sp.returnScheduleId || ""}
      returnClass={sp.returnClass || "economy"}
      returnTime={sp.returnTime || ""}
      returnArrivalTime={sp.returnArrivalTime || ""}
      returnFlightNumber={sp.returnFlightNumber || ""}
      returnPrice={sp.returnPrice || "0"}
      hotelId={sp.hotelId || ""}
      adults={parseInt(sp.adults || "1")}
      children={parseInt(sp.children || "0")}
    />
  )
}



