"use client"


import { useRouter } from "next/navigation"
import { DealFlight } from "@lib/data/deals-data"
import { getTranslation } from "@lib/util/translations"
import { translateCity } from "@lib/util/city-translations"


interface DealsClientProps {
  city: string
  deals: DealFlight[]
  heroImage: string
  currentLocale: string | null
}


function formatDate(dateStr: string, locale: string | null) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale || "en-GB", { day: "numeric", month: "short", year: "numeric" })
}


function getRating(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const raw = Math.abs(hash) % 16
  return parseFloat((8.0 + raw * 0.1).toFixed(1))
}


function getRatingLabel(rating: number, t: (k: string, f: string) => string): string {
  if (rating >= 9.0) return t("hotelSearch.ratingLabels.excellent", "Excellent")
  if (rating >= 8.5) return t("hotelSearch.ratingLabels.veryGood", "Very Good")
  return t("hotelSearch.ratingLabels.good", "Good")
}


function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating / 2)
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < stars ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}


const CITY_CARD_IMAGES: Record<string, string> = {
  maribor:   "https://images.unsplash.com/photo-1663507879157-3a52effee31d?q=80&w=400&auto=format&fit=crop",
  stockholm: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=400&auto=format&fit=crop",
  inverness: "https://images.unsplash.com/photo-1553447305-572c1904fdf8?q=80&w=400&auto=format&fit=crop",
  ischia:    "https://images.unsplash.com/photo-1645543732122-ac80f090eea2?q=80&w=400&auto=format&fit=crop",
  lisbon:    "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?q=80&w=400&auto=format&fit=crop",
  budapest:  "https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?q=80&w=400&auto=format&fit=crop",
  gdansk:    "https://images.unsplash.com/photo-1572942560575-2e3142767543?q=80&w=400&auto=format&fit=crop",
  riga:      "https://images.unsplash.com/photo-1567669721460-221b82865ee0?q=80&w=400&auto=format&fit=crop",
}


export default function DealsClient({ city, deals, heroImage, currentLocale }: DealsClientProps) {
  const router = useRouter()
  const t = (key: string, fallback: string) => getTranslation(currentLocale, key) || fallback


  const cardImage = CITY_CARD_IMAGES[city.toLowerCase()] ?? heroImage
  const cityCapitalized = translateCity(city.charAt(0).toUpperCase() + city.slice(1), currentLocale)


  const handleBook = (deal: DealFlight) => {
    router.push(`/book-trip/${deal.id}/outbound`)
  }


  return (
    <>
      {/* Hero */}
      <section
        className="relative h-72 flex items-end justify-start bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url('${heroImage}')`,
        }}
      >
        <div className="container mx-auto px-6 pb-8">
          <p className="text-white/70 text-sm mb-1">
            {t("deals.specialOffers", "Special offers")}
          </p>
          <h1 className="text-white text-4xl font-bold">
            {t("deals.flightsTo", "Flights to")} {cityCapitalized}
          </h1>
        </div>
      </section>


      {/* Deals list */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {deals.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              {t("deals.noDeals", "No deals available right now. Check back soon!")}
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => {
                const rating = getRating(deal.id)
                const ratingLabel = getRatingLabel(rating, t)
                const fromCityTranslated = translateCity(deal.fromCity, currentLocale)
                const toCityTranslated = translateCity(deal.toCity, currentLocale)


                return (
                  <div key={deal.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row">


                    {/* Фото зліва */}
                    <div
                      className="sm:w-52 h-44 sm:h-auto flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${cardImage}')` }}
                    />


                    {/* Контент */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-teal-700">
                              {fromCityTranslated} → {toCityTranslated}
                            </h3>
                            <StarRating rating={rating} />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-700">{ratingLabel}</div>
                              <div className="text-xs text-gray-400">{Math.abs(deal.id.charCodeAt(0) * 7 % 700 + 200)} {t("hotelSearch.results.reviews", "reviews")}</div>
                            </div>
                            <div className="bg-teal-600 text-white text-base font-bold w-10 h-10 rounded-lg rounded-tl-none flex items-center justify-center">
                              {rating}
                            </div>
                          </div>
                        </div>


                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(deal.departDate, currentLocale)} – {formatDate(deal.returnDate, currentLocale)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{deal.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <span className="font-mono text-xs">{deal.flightNumber}</span>
                          </div>
                          {deal.seatsLeft && deal.seatsLeft <= 10 && (
                            <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {t("deals.seatsLeft", "Only")} {deal.seatsLeft} {t("deals.seatsLeftEnd", "seats left")}
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Ціна + кнопка */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 sm:min-w-[120px]">
                        <div className="text-right">
                          {deal.originalPrice && (
                            <div className="text-sm text-gray-400 line-through">{deal.originalPrice}</div>
                          )}
                          <div className="text-2xl font-bold text-teal-600">{deal.price}</div>
                          <div className="text-xs text-gray-400">{t("deals.perPerson", "per person")}</div>
                        </div>
                        <button
                          onClick={() => handleBook(deal)}
                          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow-md whitespace-nowrap text-sm"
                        >
                          {t("deals.bookNow", "Book now")}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}



