"use client"

import { useRouter } from "next/navigation"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"

type FlightCardProps = {
  city: string
  price: string
  image: string
  originalPrice?: string
  tripType?: string
  currentLocale?: string | null
}

export default function FlightCard({
  city,
  price,
  image,
  originalPrice,
  tripType,
  currentLocale = null
}: FlightCardProps) {
  const router = useRouter()
  const t = (key: string) => getTranslation(currentLocale || null, key)
  const translatedCity = translateCity(city, currentLocale)

  const handleClick = () => {
    router.push(`/deals/${city.toLowerCase()}`)
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer bg-white group"
    >
      {/* Картинка + бейдж */}
      <div className="relative h-40 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        {originalPrice && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            SALE
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_fc)">
                <path d="M8.90723 5.00782L10.4042 9.28154L15.0654 9.36373L11.7309 5.65945C11.3494 5.27787 10.9795 4.9726 10.6566 5.00195H8.90723V5.00782Z" fill="#075951" />
                <path d="M1 8.1543H2.59677C3.58302 8.5124 4.15832 9.45755 4.59861 10.5084H20.719C23.572 11.0954 23.8714 12.9211 20.9186 13.4671H16.3102L11.7195 18.9501C11.379 19.2789 11.0327 19.502 10.6922 19.5548H8.90755L10.9622 13.4612L4.45185 13.4964C3.50083 13.379 2.72005 12.5572 2.00972 11.4124L1 8.1543Z" fill="#075951" />
              </g>
              <defs>
                <clipPath id="clip0_fc">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span className="font-bold text-base">{translatedCity}</span>
          </div>

          <div className="text-right">
            {originalPrice && (
              <div className="text-xs text-gray-400 line-through leading-none">{originalPrice}</div>
            )}
            <div className="text-lg font-bold text-teal-600 leading-tight">{price}</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {tripType || t("flights.roundTrip")}
        </div>
      </div>
    </div>
  )
}

