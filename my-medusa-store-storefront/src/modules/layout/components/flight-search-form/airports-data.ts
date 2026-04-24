// Airport codes mapping - Коди аеропортів та їх назви
export interface Airport {
  code: string
  city: string
  country: string
  displayName: string
}


export const AIRPORTS: Airport[] = [
  // European Cities (original)
  { code: "LDN", city: "London",     country: "United Kingdom", displayName: "London (LDN)" },
  { code: "PAR", city: "Paris",      country: "France",         displayName: "Paris (PAR)" },
  { code: "BER", city: "Berlin",     country: "Germany",        displayName: "Berlin (BER)" },
  { code: "ROM", city: "Rome",       country: "Italy",          displayName: "Rome (ROM)" },
  { code: "MAD", city: "Madrid",     country: "Spain",          displayName: "Madrid (MAD)" },
  { code: "BCN", city: "Barcelona",  country: "Spain",          displayName: "Barcelona (BCN)" },
  { code: "AMS", city: "Amsterdam",  country: "Netherlands",    displayName: "Amsterdam (AMS)" },
  { code: "VIE", city: "Vienna",     country: "Austria",        displayName: "Vienna (VIE)" },
  { code: "PRG", city: "Prague",     country: "Czech Republic", displayName: "Prague (PRG)" },
  { code: "LIS", city: "Lisbon",     country: "Portugal",       displayName: "Lisbon (LIS)" },
  { code: "ATH", city: "Athens",     country: "Greece",         displayName: "Athens (ATH)" },
  { code: "CPH", city: "Copenhagen", country: "Denmark",        displayName: "Copenhagen (CPH)" },
  { code: "STO", city: "Stockholm",  country: "Sweden",         displayName: "Stockholm (STO)" },
  { code: "OSL", city: "Oslo",       country: "Norway",         displayName: "Oslo (OSL)" },
  { code: "HEL", city: "Helsinki",   country: "Finland",        displayName: "Helsinki (HEL)" },
  { code: "WAW", city: "Warsaw",     country: "Poland",         displayName: "Warsaw (WAW)" },
  { code: "BUD", city: "Budapest",   country: "Hungary",        displayName: "Budapest (BUD)" },
  { code: "DUB", city: "Dublin",     country: "Ireland",        displayName: "Dublin (DUB)" },
  { code: "ZUR", city: "Zurich",     country: "Switzerland",    displayName: "Zurich (ZUR)" },
  { code: "BRU", city: "Brussels",   country: "Belgium",        displayName: "Brussels (BRU)" },


  // Додані міста з плиток (offers + trending)
  { code: "MBX", city: "Maribor",   country: "Slovenia",        displayName: "Maribor (MBX)" },
  { code: "INV", city: "Inverness", country: "United Kingdom",  displayName: "Inverness (INV)" },
  { code: "ISC", city: "Ischia",    country: "Italy",           displayName: "Ischia (ISC)" },
  { code: "GDN", city: "Gdansk",    country: "Poland",          displayName: "Gdansk (GDN)" },
  { code: "RIX", city: "Riga",      country: "Latvia",          displayName: "Riga (RIX)" },
  { code: "BGO", city: "Bergen",    country: "Norway",          displayName: "Bergen (BGO)" },
  { code: "ZRH", city: "Lucerne",   country: "Switzerland",     displayName: "Lucerne (ZRH)" },
]


// Helper functions
export function findAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find(airport => airport.code.toLowerCase() === code.toLowerCase())
}


export function findAirportByCity(city: string): Airport | undefined {
  return AIRPORTS.find(airport =>
    airport.city.toLowerCase() === city.toLowerCase()
  )
}


export function searchAirports(query: string): Airport[] {
  if (!query) return AIRPORTS
 
  const lowerQuery = query.toLowerCase()
  return AIRPORTS.filter(airport =>
    airport.city.toLowerCase().includes(lowerQuery) ||
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.country.toLowerCase().includes(lowerQuery)
  )
}


export function getCityNameFromCode(code: string): string {
  const airport = findAirportByCode(code)
  return airport ? airport.city : code
}


export function getCodeFromCity(city: string): string {
  const airport = findAirportByCity(city)
  return airport ? airport.code : city.toUpperCase()
}

