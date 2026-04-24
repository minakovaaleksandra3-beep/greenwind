"use client"


import { useRouter } from "next/navigation"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"
import { getCodeFromCity } from "@modules/layout/components/flight-search-form/airports-data"


type FlightCardLargeProps = {
  city: string
  price: string
  image: string
  tripType?: string
  currentLocale?: string | null
}


export default function FlightCardLarge({
  city,
  price,
  image,
  tripType,
  currentLocale = null
}: FlightCardLargeProps) {
  const router = useRouter()
  const t = (key: string) => getTranslation(currentLocale || null, key)
  const translatedCity = translateCity(city, currentLocale)


  const handleClick = () => {
    const toCode = getCodeFromCity(city)
    router.push(`/?prefillTo=${toCode}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }


  return (
    <div
      onClick={handleClick}
      className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer bg-white group"
    >
      <div className="h-64 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_fcl)">
                <path d="M8.90723 5.00782L10.4042 9.28154L15.0654 9.36373L11.7309 5.65945C11.3494 5.27787 10.9795 4.9726 10.6566 5.00195H8.90723V5.00782Z" fill="#075951" />
                <path d="M1 8.1543H2.59677C3.58302 8.5124 4.15832 9.45755 4.59861 10.5084H20.719C23.572 11.0954 23.8714 12.9211 20.9186 13.4671H16.3102L11.7195 18.9501C11.379 19.2789 11.0327 19.502 10.6922 19.5548H8.90755L10.9622 13.4612L4.45185 13.4964C3.50083 13.379 2.72005 12.5572 2.00972 11.4124L1 8.1543Z" fill="#075951" />
              </g>
              <defs>
                <clipPath id="clip0_fcl">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span className="font-bold text-base">{translatedCity}</span>
          </div>
          <div className="text-2xl font-bold text-teal-600">{price}</div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {tripType || t("flights.roundTrip")}
        </div>
      </div>
    </div>
  )
}



