"use client"


import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import TripSteps from "@modules/trips/components/trip-steps"


interface HotelStepClientProps {
  deal: DealFlight
  currentLocale: string | null
  customerName: string
  customerEmail: string
  outboundScheduleId: string
  outboundClass: string
  outboundTime: string
  outboundArrivalTime: string
  outboundFlightNumber: string
  outboundPrice: string
  returnScheduleId: string
  returnClass: string
  returnTime: string
  returnArrivalTime: string
  returnFlightNumber: string
  returnPrice: string
  adults: number
  children: number
}


interface Hotel {
  id: number
  name: string
  city_code: string
  type: string
  stars: number
  rating: number
  reviews_count: number
  rating_label: string
  price_per_night: number
  original_price: number | null
  currency: string
  image: string
  free_cancellation: boolean
  breakfast_included: boolean
  rooms_left: number
  room_type: string
  distance_from_centre: string
}


function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < stars ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}


const RATING_LABEL_MAP: Record<string, string> = {
  "Superb": "hotelSearch.ratingLabels.superb",
  "Excellent": "hotelSearch.ratingLabels.excellent",
  "Very Good": "hotelSearch.ratingLabels.veryGood",
  "Good": "hotelSearch.ratingLabels.good",
}


const ROOM_TYPE_MAP: Record<string, string> = {
  "Deluxe King Room": "hotelSearch.roomTypes.deluxeKing",
  "Roomy Double": "hotelSearch.roomTypes.roomyDouble",
  "Standard Queen": "hotelSearch.roomTypes.standardQueen",
  "1-Bedroom Apartment": "hotelSearch.roomTypes.oneBedApartment",
  "2-Bedroom Apartment": "hotelSearch.roomTypes.twoBedApartment",
  "Standard Double": "hotelSearch.roomTypes.standardDouble",
  "Classic Room": "hotelSearch.roomTypes.classicRoom",
  "Superior Double": "hotelSearch.roomTypes.superiorDouble",
  "Studio Apartment": "hotelSearch.roomTypes.studioApartment",
  "Deluxe Room": "hotelSearch.roomTypes.deluxeRoom",
  "Private Double Room": "hotelSearch.roomTypes.privateDouble",
  "Deluxe Suite": "hotelSearch.roomTypes.deluxeSuite",
  "Sea View Room": "hotelSearch.roomTypes.seaView",
  "Garden Room": "hotelSearch.roomTypes.gardenRoom",
  "Superior Room": "hotelSearch.roomTypes.superiorRoom",
  "Standard Room": "hotelSearch.roomTypes.standardRoom",
  "Double Room with Breakfast": "hotelSearch.roomTypes.doubleWithBreakfast",
  "1-Bedroom Suite": "hotelSearch.roomTypes.oneBedSuite",
}


export default function HotelStepClient({
  deal, currentLocale, customerName, customerEmail,
  outboundScheduleId, outboundClass, outboundTime, outboundArrivalTime, outboundFlightNumber, outboundPrice,
  returnScheduleId, returnClass, returnTime, returnArrivalTime, returnFlightNumber, returnPrice,
  adults, children,
}: HotelStepClientProps) {
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [filterType, setFilterType] = useState("")


  const t = useMemo(() => (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback, [currentLocale])


  const toCityTranslated = translateCity(deal.toCity, currentLocale)
  const totalPassengers = adults + children


  const nightsCount = Math.max(1, Math.round(
    (new Date(deal.returnDate).getTime() - new Date(deal.departDate).getTime()) / 86400000
  ))


  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(currentLocale || "en-GB", { day: "numeric", month: "short" })


  // ✅ Ціни вже в фунтах — НЕ ділимо на 100
  const outboundPerPerson = parseFloat(outboundPrice)
  const returnPerPerson = parseFloat(returnPrice)
  const outboundTotal = outboundPerPerson * totalPassengers
  const returnTotal = returnPerPerson * totalPassengers


  const buildParams = (hotelId?: number) => {
    const params = new URLSearchParams({
      outboundScheduleId,
      outboundClass,
      outboundTime,
      outboundArrivalTime,
      outboundFlightNumber,
      outboundPrice,
      returnScheduleId,
      returnClass,
      returnTime,
      returnArrivalTime,
      returnFlightNumber,
      returnPrice,
      adults: adults.toString(),
      children: children.toString(),
    })
    if (hotelId) params.set("hotelId", hotelId.toString())
    return params.toString()
  }


  const handleAddHotel = () => {
    if (!selectedHotel) return
    router.push(`/book-trip/${deal.id}/car?${buildParams(selectedHotel.id)}`)
  }


  const handleSkip = () => {
    router.push(`/book-trip/${deal.id}/car?${buildParams()}`)
  }


  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ city: deal.to })
        if (filterType) params.set("type", filterType)
        const res = await fetch(`/api/hotels/search?${params.toString()}`, { cache: "no-store" })
        const data = await res.json()
        setHotels(data.hotels || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [deal.to, filterType])


  const translateRatingLabel = (label: string) => {
    const key = RATING_LABEL_MAP[label]
    return key ? t(key, label) : label
  }


  const translateRoomType = (roomType: string) => {
    const key = ROOM_TYPE_MAP[roomType]
    return key ? t(key, roomType) : roomType
  }


  const translateDistance = (distance: string) =>
    distance
      .replace("from centre", t("hotelSearch.fromCentre", "from centre"))
      .replace(/\bkm\b/g, t("hotelSearch.km", "km"))


  return (
    <div className="min-h-screen bg-gray-50">
      <TripSteps currentStep={3} />


      <div className="container mx-auto px-4 max-w-3xl py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("search.backToSearch", "Back")}
          </button>
          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {t("bookTrip.hotel.label", "Choose your hotel")}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("bookTrip.hotel.title", "Hotels in")} {toCityTranslated}
          </h1>
          <p className="text-gray-500 mt-1">
            {formatDate(deal.departDate)} – {formatDate(deal.returnDate)} · {nightsCount} {nightsCount === 1 ? t("hotelSearch.night", "night") : t("hotelSearch.nights", "nights")}
          </p>
        </div>


        {/* Summary кроків 1+2 з правильними цінами */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-teal-600 font-medium">✓ {t("bookTrip.outbound.selected", "Outbound flight selected")}</span>
            <div className="text-right">
              <span className="font-bold text-gray-800">£{outboundTotal.toFixed(0)}</span>
              {totalPassengers > 1 && <span className="text-xs text-gray-400 ml-1">(£{outboundPerPerson.toFixed(0)} × {totalPassengers})</span>}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-teal-600 font-medium">✓ {t("bookTrip.return.selected", "Return flight selected")}</span>
            <div className="text-right">
              <span className="font-bold text-gray-800">£{returnTotal.toFixed(0)}</span>
              {totalPassengers > 1 && <span className="text-xs text-gray-400 ml-1">(£{returnPerPerson.toFixed(0)} × {totalPassengers})</span>}
            </div>
          </div>
          {totalPassengers > 1 && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-teal-200">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-teal-600">{totalPassengers} {t("bookTrip.passengers", "passengers")}</span>
            </div>
          )}
        </div>


        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {[
            { value: "", label: t("hotelSearch.filters.all", "All") },
            { value: "hotel", label: t("hotelSearch.filters.hotel", "Hotel") },
            { value: "apartment", label: t("hotelSearch.filters.apartment", "Apartment") },
          ].map(opt => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterType === opt.value ? "bg-teal-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-teal-400"}`}>
              {opt.label}
            </button>
          ))}
        </div>


        {/* Hotels list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500 shadow-sm">
            {t("hotelSearch.results.noResults", "No hotels found")}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {hotels.map(hotel => {
              const totalHotelPrice = hotel.price_per_night * nightsCount
              const isSelected = selectedHotel?.id === hotel.id


              return (
                <div key={hotel.id}
                  className={`bg-white rounded-2xl overflow-hidden transition-all border-2 flex flex-col sm:flex-row ${isSelected ? "border-teal-500 shadow-md" : "border-transparent shadow-sm hover:border-teal-200 hover:shadow-md"}`}>
                  <div className="sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-cover bg-center relative"
                    style={{ backgroundImage: `url('${hotel.image}')` }}>
                    {hotel.original_price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - hotel.price_per_night / hotel.original_price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <button onClick={() => {
                        const params = new URLSearchParams({
                          dealId: deal.id, outboundScheduleId, outboundClass, outboundTime, outboundPrice,
                          returnScheduleId, returnClass, returnTime, returnPrice,
                          adults: adults.toString(), children: children.toString(),
                        })
                        router.push(`/hotels/${hotel.id}?${params.toString()}`)
                      }} className="font-bold text-teal-700 leading-tight mb-0.5 text-left hover:underline">
                        {hotel.name}
                      </button>
                      <StarRating stars={hotel.stars} />
                      <p className="text-xs text-gray-400 mt-1">{translateDistance(hotel.distance_from_centre)}</p>
                      <p className="text-xs font-medium text-gray-600 mt-1">{translateRoomType(hotel.room_type)}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {hotel.free_cancellation && <span className="text-xs text-green-600 font-medium">✓ {t("hotelSearch.results.freeCancel", "Free cancellation")}</span>}
                        {hotel.breakfast_included && <span className="text-xs text-green-600 font-medium">✓ {t("hotelSearch.results.breakfast", "Breakfast included")}</span>}
                        {hotel.rooms_left <= 5 && hotel.rooms_left > 0 && (
                          <span className="text-xs text-orange-500 font-medium">
                            {t("hotelSearch.results.onlyLeft", "Only")} {hotel.rooms_left} {t("hotelSearch.results.leftRooms", "left!")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2 sm:min-w-[110px]">
                      <div className="flex items-center gap-1.5">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-gray-700">{translateRatingLabel(hotel.rating_label)}</div>
                          <div className="text-xs text-gray-400">{hotel.reviews_count.toLocaleString()} {t("hotelSearch.results.reviews", "reviews")}</div>
                        </div>
                        <div className="bg-teal-600 text-white text-sm font-bold w-9 h-9 rounded-lg rounded-tl-none flex items-center justify-center flex-shrink-0">
                          {hotel.rating}
                        </div>
                      </div>
                      <div className="text-right">
                        {hotel.original_price && <div className="text-xs text-gray-400 line-through">{hotel.currency}{hotel.original_price}</div>}
                        <div className="text-lg font-bold text-gray-900">{hotel.currency}{hotel.price_per_night}</div>
                        <div className="text-xs text-gray-400">{t("hotelSearch.results.perNight", "per night")}</div>
                        <div className="text-xs text-gray-500">{hotel.currency}{totalHotelPrice.toFixed(0)} {t("hotelSearch.results.total", "total")}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${isSelected ? "border-teal-500 bg-teal-500" : "border-gray-300 hover:border-teal-400"}`}
                        onClick={() => setSelectedHotel(isSelected ? null : hotel)}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}


        <div className="flex gap-3">
          <button onClick={handleSkip}
            className="flex-1 py-4 rounded-xl font-semibold text-base border-2 border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition">
            {t("bookTrip.hotel.skip", "Skip hotel →")}
          </button>
          <button onClick={handleAddHotel} disabled={!selectedHotel}
            className={`flex-1 py-4 rounded-xl font-bold text-base transition shadow-lg ${selectedHotel ? "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            {selectedHotel ? t("bookTrip.hotel.addAndContinue", "Add hotel →") : t("bookTrip.hotel.selectToAdd", "Select a hotel")}
          </button>
        </div>
      </div>
    </div>
  )
}



