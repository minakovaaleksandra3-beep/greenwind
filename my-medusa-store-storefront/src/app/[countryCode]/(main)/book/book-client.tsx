"use client"


import { useMemo } from "react"
import FlightSearchForm from "@modules/layout/components/flight-search-form"
import FlightTrendingGallery from "@modules/flights/components/flight-trending-gallery"
import GreenWingPassCTA from "@modules/layout/components/greenwin-pass-cta"
import { getTranslation } from "@lib/util/translations"


const featuredFlights = [
  { id: "1", city: "Paris", price: "£89", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600" },
  { id: "2", city: "Barcelona", price: "£76", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600" },
  { id: "3", city: "Amsterdam", price: "£65", image: "https://images.unsplash.com/photo-1534081333815-ae5019106622?w=600" },
  { id: "4", city: "Berlin", price: "£72", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600" },
]


interface BookClientProps {
  currentLocale: string | null
}


export default function BookClient({ currentLocale }: BookClientProps) {
  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  return (
    <>
      {/* Hero with Search Form */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600')"
        }}
      >
        <div className="container mx-auto px-4">
          <FlightSearchForm currentLocale={currentLocale} />
        </div>
      </section>


      {/* GreenWing Pass */}
      <GreenWingPassCTA currentLocale={currentLocale} />


      {/* Featured Flights */}
      <FlightTrendingGallery
        title={t("help.featuredDestinations", "Featured destinations")}
        flights={featuredFlights}
        currentLocale={currentLocale}
      />
    </>
  )
}

