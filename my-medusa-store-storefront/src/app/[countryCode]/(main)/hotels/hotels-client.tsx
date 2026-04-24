"use client"


import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"


interface Hotel {
  id: number
  name: string
  city_code: string
  city_name: string
  address: string
  distance_from_centre: string
  type: string
  stars: number
  rating: number
  reviews_count: number
  rating_label: string
  price_per_night: number
  original_price: number | null
  currency: string
  image: string
  amenities: string[]
  free_cancellation: boolean
  breakfast_included: boolean
  no_prepayment: boolean
  rooms_left: number
  room_type: string
  description: string
}


interface HotelDetailClientProps {
  hotelId: string
  currentLocale: string | null
  customerName: string
  customerEmail: string
  searchParams: {
    dealId?: string
    outboundScheduleId?: string
    outboundClass?: string
    outboundTime?: string
    outboundPrice?: string
    returnScheduleId?: string
    returnClass?: string
    returnTime?: string
    returnPrice?: string
    checkin?: string
    checkout?: string
    adults?: string
    children?: string
    rooms?: string
  }
}


// Додаткові фото для галереї (різні кути готелю)
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
]


const AMENITIES_ICONS: Record<string, string> = {
  "WiFi": "M1.5 8.5a13 13 0 0121 0M5 12.5a9 9 0 0114 0M8.5 16.5a5 5 0 017 0M12 20.5h.01",
  "Air conditioning": "M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364",
  "24h front desk": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  "Luggage storage": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Restaurant": "M3 3h18v4H3zM3 7v11a2 2 0 002 2h14a2 2 0 002-2V7",
  "Kitchen": "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  "Washing machine": "M3 3h18v18H3zM9 9h6v6H9z",
  "Self check-in": "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  "Parking": "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 4v6m-3-3h6",
  "Pool": "M3 12a9 9 0 1018 0 9 9 0 00-18 0zm9-4v8m-4-4h8",
  "Spa": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
}


function StarRating({ stars, size = "md" }: { stars: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3 h-3" : "w-4 h-4"
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${sizeClass} ${i < stars ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}


export default function HotelDetailClient({
  hotelId, currentLocale, customerName, customerEmail, searchParams
}: HotelDetailClientProps) {
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)


  const t = useMemo(() => {
    return (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback
  }, [currentLocale])


  const isDealFlow = !!searchParams.dealId


  // Кількість ночей
  const nightsCount = searchParams.checkin && searchParams.checkout
    ? Math.max(1, Math.round((new Date(searchParams.checkout).getTime() - new Date(searchParams.checkin).getTime()) / 86400000))
    : isDealFlow ? 7 : 1


  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`, { cache: "no-store" })
        const data = await res.json()
        setHotel(data.hotel)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hotelId])


  const handleBack = () => router.back()


  const handleSelect = () => {
    if (!hotel) return
    if (isDealFlow) {
      // Повертаємось до book-trip флоу з вибраним готелем
      const params = new URLSearchParams({
        outboundScheduleId: searchParams.outboundScheduleId || "",
        outboundClass: searchParams.outboundClass || "economy",
        outboundTime: searchParams.outboundTime || "",
        outboundPrice: searchParams.outboundPrice || "0",
        returnScheduleId: searchParams.returnScheduleId || "",
        returnClass: searchParams.returnClass || "economy",
        returnTime: searchParams.returnTime || "",
        returnPrice: searchParams.returnPrice || "0",
        hotelId: hotel.id.toString(),
      })
      router.push(`/book-trip/${searchParams.dealId}/car?${params.toString()}`)
    } else {
      // Звичайний флоу
      const params = new URLSearchParams({
        checkin: searchParams.checkin || "",
        checkout: searchParams.checkout || "",
        adults: searchParams.adults || "2",
        children: searchParams.children || "0",
        rooms: searchParams.rooms || "1",
      })
      router.push(`/hotels/${hotel.id}/book?${params.toString()}`)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }


  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t("hotelSearch.results.noResults", "Hotel not found")}</p>
      </div>
    )
  }


  const allPhotos = [hotel.image, ...GALLERY_IMAGES.slice(0, 3)]
  const totalPrice = hotel.price_per_night * nightsCount


  const amenitiesList = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : typeof hotel.amenities === "string"
    ? JSON.parse(hotel.amenities)
    : []


  return (
    <div className="min-h-screen bg-gray-50">


      {/* Back button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-4xl py-3 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("search.backToSearch", "Back")}
          </button>
          {isDealFlow && (
            <span className="text-xs text-teal-600 bg-teal-50 px-3 py-1 rounded-full font-medium">
              {t("bookTrip.hotel.choosingFor", "Choosing for your trip")}
            </span>
          )}
        </div>
      </div>


      <div className="container mx-auto px-4 max-w-4xl py-6">


        {/* Gallery */}
        <div className="mb-6">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-2">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{ backgroundImage: `url('${allPhotos[activePhoto]}')` }}
            />
            {/* Discount badge */}
            {hotel.original_price && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{Math.round((1 - hotel.price_per_night / hotel.original_price) * 100)}%
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`flex-1 h-16 rounded-xl overflow-hidden border-2 transition ${
                  activePhoto === i ? "border-teal-500" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${photo}')` }} />
              </button>
            ))}
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">


            {/* Name + rating */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
              <div className="flex items-center gap-3 mb-2">
                <StarRating stars={hotel.stars} size="md" />
                <span className="text-sm text-gray-500 capitalize">{hotel.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{hotel.address}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">📍 {hotel.distance_from_centre}</p>
            </div>


            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">{t("hotelDetail.about", "About this property")}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{hotel.description}</p>
            </div>


            {/* Room type */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">{t("hotelDetail.roomType", "Room type")}</h2>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium text-gray-800">{hotel.room_type}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {hotel.free_cancellation && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("hotelSearch.results.freeCancel", "Free cancellation")}
                  </span>
                )}
                {hotel.breakfast_included && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("hotelSearch.results.breakfast", "Breakfast included")}
                  </span>
                )}
                {hotel.no_prepayment && (
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full">
                    {t("hotelSearch.results.noPrepayment", "No prepayment needed")}
                  </span>
                )}
              </div>
            </div>


            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">{t("hotelDetail.amenities", "Amenities")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {amenitiesList.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={AMENITIES_ICONS[amenity] || "M5 13l4 4L19 7"} />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Availability */}
            {hotel.rooms_left > 0 && hotel.rooms_left <= 10 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-orange-700 font-medium">
                  {t("hotelSearch.results.onlyLeft", "Only")} {hotel.rooms_left} {t("hotelSearch.results.leftRooms", "left!")}
                </p>
              </div>
            )}
          </div>


          {/* Price card — sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-5 sticky top-20">


              {/* Rating */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-sm font-semibold text-gray-700">{hotel.rating_label}</div>
                  <div className="text-xs text-gray-400">{hotel.reviews_count.toLocaleString()} {t("hotelSearch.results.reviews", "reviews")}</div>
                </div>
                <div className="bg-teal-600 text-white text-lg font-bold w-12 h-12 rounded-xl rounded-tl-none flex items-center justify-center">
                  {hotel.rating}
                </div>
              </div>


              {/* Price */}
              <div className="mb-4">
                {hotel.original_price && (
                  <div className="text-sm text-gray-400 line-through">{hotel.currency}{hotel.original_price} / {t("hotelSearch.night", "night")}</div>
                )}
                <div className="text-3xl font-bold text-gray-900">{hotel.currency}{hotel.price_per_night}</div>
                <div className="text-sm text-gray-400">{t("hotelSearch.results.perNight", "per night")}</div>
                {nightsCount > 1 && (
                  <div className="text-sm text-gray-600 mt-1 font-medium">
                    {hotel.currency}{totalPrice} {t("hotelSearch.results.total", "total")} · {nightsCount} {nightsCount === 1 ? t("hotelSearch.night", "night") : t("hotelSearch.nights", "nights")}
                  </div>
                )}
              </div>


              {/* CTA button */}
              <button
                onClick={handleSelect}
                className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg text-base"
              >
                {isDealFlow
                  ? t("bookTrip.hotel.addAndContinue", "Select this hotel →")
                  : t("hotelSearch.results.bookNow", "Book now")}
              </button>


              {isDealFlow && (
                <button
                  onClick={handleBack}
                  className="w-full py-3 mt-2 text-gray-500 hover:text-teal-600 font-medium text-sm transition"
                >
                  ← {t("hotelDetail.backToList", "Back to hotel list")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



