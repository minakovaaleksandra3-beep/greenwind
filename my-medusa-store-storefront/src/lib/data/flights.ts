export type Flight = {
  id: number
  schedule_id: number
  flight_number: string
  departure_airport: string
  departure_airport_full: string
  arrival_airport: string
  arrival_airport_full: string
  departure_time: string
  arrival_time: string
  departure_date: string
  duration: string
  is_direct: boolean
  co2_emissions: number
  operator: string
  current_price_economy: number
  current_price_business: number
  available_seats_economy: number
  available_seats_business: number
  amenities: string[]
}


export async function searchFlights(
  from: string, 
  to: string, 
  date: string
): Promise<Flight[]> {
  const params = new URLSearchParams({ from, to, date })


  const response = await fetch(`/api/flights/search?${params.toString()}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch flights')
  }
  
  const data = await response.json()
  return data.flights || []
}


export async function bookFlight(booking: {
  scheduleId: number
  passengerName: string
  passengerEmail: string
  flightClass: 'economy' | 'business'
}) {
  const response = await fetch('/api/flights/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })


  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || 'Failed to book flight')
  }


  return response.json()
}


