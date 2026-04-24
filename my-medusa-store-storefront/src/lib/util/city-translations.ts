export const CITY_TRANSLATIONS: Record<string, Record<string, string>> = {
    "London": {
        "en-GB": "London",
        "uk-UA": "Лондон",
        "de-DE": "London",
        "fr-FR": "Londres",
        "es-ES": "Londres"
    },
    "Paris": {
        "en-GB": "Paris",
        "uk-UA": "Париж",
        "de-DE": "Paris",
        "fr-FR": "Paris",
        "es-ES": "París"
    },
    "Barcelona": {
        "en-GB": "Barcelona",
        "uk-UA": "Барселона",
        "de-DE": "Barcelona",
        "fr-FR": "Barcelone",
        "es-ES": "Barcelona"
    },
    "Amsterdam": {
        "en-GB": "Amsterdam",
        "uk-UA": "Амстердам",
        "de-DE": "Amsterdam",
        "fr-FR": "Amsterdam",
        "es-ES": "Ámsterdam"
    },
    "Berlin": {
        "en-GB": "Berlin",
        "uk-UA": "Берлін",
        "de-DE": "Berlin",
        "fr-FR": "Berlin",
        "es-ES": "Berlín"
    },
    "Stockholm": {
        "en-GB": "Stockholm",
        "uk-UA": "Стокгольм",
        "de-DE": "Stockholm",
        "fr-FR": "Stockholm",
        "es-ES": "Estocolmo"
    },
    "Budapest": {
        "en-GB": "Budapest",
        "uk-UA": "Будапешт",
        "de-DE": "Budapest",
        "fr-FR": "Budapest",
        "es-ES": "Budapest"
    },
    "Gdansk": {
        "en-GB": "Gdansk",
        "uk-UA": "Гданськ",
        "de-DE": "Danzig",
        "fr-FR": "Gdansk",
        "es-ES": "Gdansk"
    },
    "Riga": {
        "en-GB": "Riga",
        "uk-UA": "Рига",
        "de-DE": "Riga",
        "fr-FR": "Riga",
        "es-ES": "Riga"
    },
    "Maribor": {
        "en-GB": "Maribor",
        "uk-UA": "Марибор",
        "de-DE": "Marburg an der Drau",
        "fr-FR": "Maribor",
        "es-ES": "Maribor"
    },
    "Inverness": {
        "en-GB": "Inverness",
        "uk-UA": "Інвернесс",
        "de-DE": "Inverness",
        "fr-FR": "Inverness",
        "es-ES": "Inverness"
    },
    "Ischia": {
        "en-GB": "Ischia",
        "uk-UA": "Іскія",
        "de-DE": "Ischia",
        "fr-FR": "Ischia",
        "es-ES": "Isquia"
    },
    "Lucerne": {
        "en-GB": "Lucerne",
        "uk-UA": "Люцерн",
        "de-DE": "Luzern",
        "fr-FR": "Lucerne",
        "es-ES": "Lucerna"
    },
    "Zurich": {
        "en-GB": "Zurich",
        "uk-UA": "Цюрих",
        "de-DE": "Zürich",
        "fr-FR": "Zurich",
        "es-ES": "Zúrich"
    },
    "Bergen": {
        "en-GB": "Bergen",
        "uk-UA": "Берген",
        "de-DE": "Bergen",
        "fr-FR": "Bergen",
        "es-ES": "Bergen"
    },
    "Rome": {
    "en-GB": "Rome",
    "uk-UA": "Рим",
    "de-DE": "Rom",
    "fr-FR": "Rome",
    "es-ES": "Roma"
  },
  "Madrid": {
    "en-GB": "Madrid",
    "uk-UA": "Мадрид",
    "de-DE": "Madrid",
    "fr-FR": "Madrid",
    "es-ES": "Madrid"
  },
  "Vienna": {
    "en-GB": "Vienna",
    "uk-UA": "Відень",
    "de-DE": "Wien",
    "fr-FR": "Vienne",
    "es-ES": "Viena"
  },
}


export const IATA_TO_CITY: Record<string, string> = {
    "AMS": "Amsterdam",
    "PRG": "Prague",
    "LDN": "London",
    "LHR": "London",
    "LGW": "London",
    "ROM": "Rome",
    "LIS": "Lisbon",
    "PAR": "Paris",
    "CDG": "Paris",
    "ORY": "Paris",
    "BCN": "Barcelona",
    "MAD": "Madrid",
    "BER": "Berlin",
    "VIE": "Vienna",
    "DSN": "Disneyland Paris",
}


// ФУНКЦІЯ З ДЕТАЛЬНИМ ЛОГУВАННЯМ
export function translateCity(cityInput: string, locale: string | null): string {
    console.log('========== TRANSLATE CITY DEBUG ==========')
    console.log('1. INPUT:', {
        cityInput,
        locale,
        type: typeof cityInput,
        length: cityInput?.length,
        isUpperCase: cityInput === cityInput?.toUpperCase()
    })


    const currentLocale = locale || "en-GB"
    console.log('2. Current locale:', currentLocale)


    // Випадок 1: IATA код
    if (cityInput?.length === 3 && cityInput === cityInput?.toUpperCase()) {
        console.log('3. Detected as IATA code')
        const cityName = IATA_TO_CITY[cityInput]
        console.log('4. IATA mapping:', {
            iata: cityInput,
            found: cityName,
            exists: !!cityName
        })


        if (cityName) {
            const translation = CITY_TRANSLATIONS[cityName]?.[currentLocale]
            console.log('5. Translation found:', {
                cityName,
                translation,
                hasTranslation: !!translation
            })
            return translation || cityName
        }
        console.log('5. No IATA mapping found, returning original:', cityInput)
        return cityInput
    }


    // Випадок 2: Назва міста
    console.log('3. Detected as city name')
    const normalizedCity = cityInput?.trim() || ''
    console.log('4. Normalized city:', normalizedCity)


    // Точний збіг
    if (CITY_TRANSLATIONS[normalizedCity]) {
        const translation = CITY_TRANSLATIONS[normalizedCity][currentLocale]
        console.log('5. Exact match found:', {
            key: normalizedCity,
            translation,
            available: Object.keys(CITY_TRANSLATIONS[normalizedCity])
        })
        return translation || normalizedCity
    }


    // Case-insensitive збіг
    console.log('5. No exact match, trying case-insensitive...')
    const cityKey = Object.keys(CITY_TRANSLATIONS).find(
        key => key.toLowerCase() === normalizedCity.toLowerCase()
    )


    if (cityKey) {
        const translation = CITY_TRANSLATIONS[cityKey][currentLocale]
        console.log('6. Case-insensitive match:', {
            originalKey: cityKey,
            translation,
            available: Object.keys(CITY_TRANSLATIONS[cityKey])
        })
        return translation || normalizedCity
    }


    console.log('5. No translation found, returning original:', normalizedCity)
    console.log('==========================================')


    return cityInput
}



