import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import HotelDetailClient from "./hotel-detail-client"


interface Props {
  params: { id: string; countryCode: string }
  searchParams: {
    // Якщо прийшли з book-trip флоу
    dealId?: string
    outboundScheduleId?: string
    outboundClass?: string
    outboundTime?: string
    outboundPrice?: string
    returnScheduleId?: string
    returnClass?: string
    returnTime?: string
    returnPrice?: string
    // Якщо прийшли зі звичайного пошуку
    checkin?: string
    checkout?: string
    adults?: string
    children?: string
    rooms?: string
  }
}


export default async function HotelDetailPage({ params, searchParams }: Props) {
  const currentLocale = await getLocale()
  const customer = await retrieveCustomer()


  return (
    <HotelDetailClient
      hotelId={params.id}
      currentLocale={currentLocale}
      customerName={customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Guest"}
      customerEmail={customer?.email || "guest@greenwing.com"}
      searchParams={searchParams}
    />
  )
}



