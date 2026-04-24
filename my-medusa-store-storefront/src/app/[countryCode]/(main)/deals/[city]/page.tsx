import { getLocale } from "@lib/data/locale-actions"
import { getDealsForCity } from "@lib/data/deals-data"
import DealsClient from "./deals-client"
import { notFound } from "next/navigation"


// Картинки для кожного міста (ті самі що в home-client.tsx)
const CITY_IMAGES: Record<string, string> = {
  maribor:   "https://images.unsplash.com/photo-1663507879157-3a52effee31d?q=80&w=870&auto=format&fit=crop",
  stockholm: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=870&auto=format&fit=crop",
  inverness: "https://images.unsplash.com/photo-1553447305-572c1904fdf8?q=80&w=870&auto=format&fit=crop",
  ischia:    "https://images.unsplash.com/photo-1645543732122-ac80f090eea2?q=80&w=870&auto=format&fit=crop",
  lisbon:    "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?q=80&w=870&auto=format&fit=crop",
  budapest:  "https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?q=80&w=870&auto=format&fit=crop",
  gdansk:    "https://images.unsplash.com/photo-1572942560575-2e3142767543?q=80&w=869&auto=format&fit=crop",
  riga:      "https://images.unsplash.com/photo-1567669721460-221b82865ee0?q=80&w=870&auto=format&fit=crop",
}


interface Props {
  params: { city: string; countryCode: string }
}


export default async function DealsPage({ params }: Props) {
  const city = params.city.toLowerCase()
  const deals = getDealsForCity(city)
  const heroImage = CITY_IMAGES[city]
  const currentLocale = await getLocale()


  if (!heroImage) {
    notFound()
  }


  return (
    <DealsClient
      city={city}
      deals={deals}
      heroImage={heroImage}
      currentLocale={currentLocale}
    />
  )
}

