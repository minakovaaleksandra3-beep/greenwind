// src/lib/data/deals-data.ts
// Заготовлені акційні рейси для кожного міста


export interface DealFlight {
  id: string
  from: string      // airport code
  fromCity: string
  to: string        // airport code
  toCity: string
  departDate: string   // YYYY-MM-DD
  returnDate: string   // YYYY-MM-DD
  price: string
  originalPrice?: string
  duration: string     // "2h 30m"
  flightNumber: string
  seatsLeft?: number
}


// Від London (LDN) до кожного міста
export const DEALS_BY_CITY: Record<string, DealFlight[]> = {
  maribor: [
    {
      id: "deal-mbx-1",
      from: "LDN", fromCity: "London",
      to: "MBX", toCity: "Maribor",
      departDate: "2026-05-14",
      returnDate: "2026-05-21",
      price: "£69",
      originalPrice: "£120",
      duration: "2h 15m",
      flightNumber: "GW 1042",
      seatsLeft: 4,
    },
    {
      id: "deal-mbx-2",
      from: "LDN", fromCity: "London",
      to: "MBX", toCity: "Maribor",
      departDate: "2026-07-04",
      returnDate: "2026-07-11",
      price: "£69",
      originalPrice: "£115",
      duration: "2h 15m",
      flightNumber: "GW 1044",
      seatsLeft: 7,
    },
    {
      id: "deal-mbx-3",
      from: "LDN", fromCity: "London",
      to: "MBX", toCity: "Maribor",
      departDate: "2026-09-01",
      returnDate: "2026-09-08",
      price: "£69",
      duration: "2h 15m",
      flightNumber: "GW 1048",
    },
  ],
  stockholm: [
    {
      id: "deal-sto-1",
      from: "LDN", fromCity: "London",
      to: "STO", toCity: "Stockholm",
      departDate: "2026-05-18",
      returnDate: "2026-05-25",
      price: "£102",
      originalPrice: "£179",
      duration: "2h 40m",
      flightNumber: "GW 2110",
      seatsLeft: 3,
    },
    {
      id: "deal-sto-2",
      from: "LDN", fromCity: "London",
      to: "STO", toCity: "Stockholm",
      departDate: "2026-08-22",
      returnDate: "2026-08-29",
      price: "£102",
      originalPrice: "£165",
      duration: "2h 40m",
      flightNumber: "GW 2114",
      seatsLeft: 9,
    },
  ],
  inverness: [
    {
      id: "deal-inv-1",
      from: "LDN", fromCity: "London",
      to: "INV", toCity: "Inverness",
      departDate: "2026-06-07",
      returnDate: "2026-06-14",
      price: "£76",
      originalPrice: "£130",
      duration: "1h 45m",
      flightNumber: "GW 0812",
      seatsLeft: 6,
    },
    {
      id: "deal-inv-2",
      from: "LDN", fromCity: "London",
      to: "INV", toCity: "Inverness",
      departDate: "2026-08-11",
      returnDate: "2026-08-18",
      price: "£76",
      duration: "1h 45m",
      flightNumber: "GW 0816",
    },
  ],
  ischia: [
    {
      id: "deal-isc-1",
      from: "LDN", fromCity: "London",
      to: "ISC", toCity: "Ischia",
      departDate: "2026-06-21",
      returnDate: "2026-06-28",
      price: "£110",
      originalPrice: "£199",
      duration: "2h 55m",
      flightNumber: "GW 3204",
      seatsLeft: 2,
    },
    {
      id: "deal-isc-2",
      from: "LDN", fromCity: "London",
      to: "ISC", toCity: "Ischia",
      departDate: "2026-09-08",
      returnDate: "2026-09-15",
      price: "£110",
      originalPrice: "£185",
      duration: "2h 55m",
      flightNumber: "GW 3208",
      seatsLeft: 11,
    },
  ],
  lisbon: [
    {
      id: "deal-lis-1",
      from: "LDN", fromCity: "London",
      to: "LIS", toCity: "Lisbon",
      departDate: "2026-05-10",
      returnDate: "2026-05-17",
      price: "£69",
      originalPrice: "£125",
      duration: "2h 30m",
      flightNumber: "GW 4402",
      seatsLeft: 5,
    },
    {
      id: "deal-lis-2",
      from: "LDN", fromCity: "London",
      to: "LIS", toCity: "Lisbon",
      departDate: "2026-07-18",
      returnDate: "2026-07-25",
      price: "£69",
      duration: "2h 30m",
      flightNumber: "GW 4406",
    },
    {
      id: "deal-lis-3",
      from: "LDN", fromCity: "London",
      to: "LIS", toCity: "Lisbon",
      departDate: "2026-10-06",
      returnDate: "2026-10-13",
      price: "£69",
      duration: "2h 30m",
      flightNumber: "GW 4412",
    },
  ],
  budapest: [
    {
      id: "deal-bud-1",
      from: "LDN", fromCity: "London",
      to: "BUD", toCity: "Budapest",
      departDate: "2026-06-25",
      returnDate: "2026-07-02",
      price: "£69",
      originalPrice: "£118",
      duration: "2h 20m",
      flightNumber: "GW 5516",
      seatsLeft: 8,
    },
    {
      id: "deal-bud-2",
      from: "LDN", fromCity: "London",
      to: "BUD", toCity: "Budapest",
      departDate: "2026-09-15",
      returnDate: "2026-09-22",
      price: "£69",
      duration: "2h 20m",
      flightNumber: "GW 5520",
    },
  ],
  gdansk: [
    {
      id: "deal-gdn-1",
      from: "LDN", fromCity: "London",
      to: "GDN", toCity: "Gdansk",
      departDate: "2026-05-14",
      returnDate: "2026-05-21",
      price: "£69",
      originalPrice: "£110",
      duration: "2h 05m",
      flightNumber: "GW 6608",
      seatsLeft: 12,
    },
    {
      id: "deal-gdn-2",
      from: "LDN", fromCity: "London",
      to: "GDN", toCity: "Gdansk",
      departDate: "2026-08-28",
      returnDate: "2026-09-04",
      price: "£69",
      duration: "2h 05m",
      flightNumber: "GW 6612",
    },
  ],
  riga: [
    {
      id: "deal-rix-1",
      from: "LDN", fromCity: "London",
      to: "RIX", toCity: "Riga",
      departDate: "2026-06-28",
      returnDate: "2026-07-05",
      price: "£69",
      originalPrice: "£122",
      duration: "2h 50m",
      flightNumber: "GW 7704",
      seatsLeft: 6,
    },
    {
      id: "deal-rix-2",
      from: "LDN", fromCity: "London",
      to: "RIX", toCity: "Riga",
      departDate: "2026-09-22",
      returnDate: "2026-09-29",
      price: "£69",
      duration: "2h 50m",
      flightNumber: "GW 7708",
    },
  ],
}


export function getDealsForCity(city: string): DealFlight[] {
  return DEALS_BY_CITY[city.toLowerCase()] ?? []
}



