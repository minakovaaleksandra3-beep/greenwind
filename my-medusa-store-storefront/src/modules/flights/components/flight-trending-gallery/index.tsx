"use client"


import { useState } from "react"
import FlightCardLarge from "../flight-card-large"




type Flight = {
  id: string
  city: string
  price: string
  image: string
}


type FlightTrendingGalleryProps = {
  title: string
  flights: Flight[]
  currentLocale?: string | null
}


export default function FlightTrendingGallery({
  title,
  flights,
  currentLocale
}: FlightTrendingGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 2


  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage))
  }


  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(flights.length - itemsPerPage, prev + itemsPerPage)
    )
  }


  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < flights.length - itemsPerPage


  const visibleFlights = flights.slice(currentIndex, currentIndex + itemsPerPage)


  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-center text-2xl font-bold mb-12 text-teal-600">{title}</h2>
     
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleFlights.map((flight) => (
            <FlightCardLarge
              key={flight.id}
              city={flight.city}
              price={flight.price}
              image={flight.image}
              currentLocale={currentLocale}
            />
          ))}
        </div>


        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${
              canGoPrev
                ? 'border-gray-400 text-gray-600 hover:bg-gray-100'
                : 'border-gray-300 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>


          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${
              canGoNext
                ? 'border-gray-400 text-gray-600 hover:bg-gray-100'
                : 'border-gray-300 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}



