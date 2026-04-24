"use client"


import { useState } from "react"
import FlightOffersGallery from "@modules/flights/components/flight-offers-gallery"
import FlightTrendingGallery from "@modules/flights/components/flight-trending-gallery"
import FlightSearchForm from "@modules/layout/components/flight-search-form"
import GreenWingPassCTA from "@modules/layout/components/greenwin-pass-cta"
import { getTranslation } from "@lib/util/translations"


type HomeClientProps = {
  currentLocale: string | null
  prefillTo?: string
  isLoggedIn?: boolean
}


export default function HomeClient({ currentLocale, prefillTo, isLoggedIn }: HomeClientProps) {
  const t = (key: string) => getTranslation(currentLocale, key)
  const [selectedTip, setSelectedTip] = useState<number | null>(null)


  const offersFlights = [
    { id: "1", city: "Maribor",   price: "£69",  originalPrice: "£120", image: "https://images.unsplash.com/photo-1663507879157-3a52effee31d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "2", city: "Stockholm", price: "£102", originalPrice: "£179", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "3", city: "Inverness", price: "£76",  originalPrice: "£130", image: "https://images.unsplash.com/photo-1553447305-572c1904fdf8?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "4", city: "Ischia",    price: "£110", originalPrice: "£199", image: "https://images.unsplash.com/photo-1645543732122-ac80f090eea2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "5", city: "Lisbon",    price: "£69",  originalPrice: "£125", image: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "6", city: "Budapest",  price: "£69",  originalPrice: "£118", image: "https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "7", city: "Gdansk",    price: "£69",  originalPrice: "£110", image: "https://images.unsplash.com/photo-1572942560575-2e3142767543?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "8", city: "Riga",      price: "£69",  originalPrice: "£122", image: "https://images.unsplash.com/photo-1567669721460-221b82865ee0?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
  ]


  const trendingFlights = [
    { id: "9",  city: "Maribor",   price: "£69",  image: "https://images.unsplash.com/photo-1663507879157-3a52effee31d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "10", city: "Stockholm", price: "£102", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "11", city: "Bergen",    price: "£85",  image: "https://images.unsplash.com/photo-1609951022212-7aff21c1ab1f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { id: "12", city: "Lucerne",   price: "£92",  image: "https://images.unsplash.com/photo-1565182242096-16033e7f1260?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0" },
  ]


  const tips = [
    {
      id: 1,
      image: "https://media.istockphoto.com/id/1340519929/photo/concept-depicting-the-issue-of-carbon-dioxide-emissions-and-its-impact-on-nature-in-the-form.webp?a=1&b=1&s=612x612&w=0&k=20&c=zHdK61_OIAgF_eMr-70EbyQsZwm-nmIWolxU5AKaI1Q=",
      title: t("home.tip1Title"),
      description: t("home.tip1Description"),
      article: {
        intro: t("home.tip1Article.intro"),
        paragraphs: [
          t("home.tip1Article.para1"),
          t("home.tip1Article.para2"),
        ],
        keyTakeaways: {
          title: t("home.tip1Article.keyTakeaways.title"),
          points: [
            t("home.tip1Article.keyTakeaways.point1"),
            t("home.tip1Article.keyTakeaways.point2"),
            t("home.tip1Article.keyTakeaways.point3"),
            t("home.tip1Article.keyTakeaways.point4"),
          ]
        }
      }
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1638115803692-df3defe07565?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0",
      title: t("home.tip2Title"),
      description: t("home.tip2Description"),
      article: {
        intro: t("home.tip2Article.intro"),
        paragraphs: [
          t("home.tip2Article.para1"),
          t("home.tip2Article.para2"),
        ],
        keyTakeaways: {
          title: t("home.tip2Article.keyTakeaways.title"),
          points: [
            t("home.tip2Article.keyTakeaways.point1"),
            t("home.tip2Article.keyTakeaways.point2"),
            t("home.tip2Article.keyTakeaways.point3"),
            t("home.tip2Article.keyTakeaways.point4"),
          ]
        }
      }
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1503942142281-94af0aded523?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
      title: t("home.tip3Title"),
      description: t("home.tip3Description"),
      article: {
        intro: t("home.tip3Article.intro"),
        paragraphs: [
          t("home.tip3Article.para1"),
          t("home.tip3Article.para2"),
        ],
        keyTakeaways: {
          title: t("home.tip3Article.keyTakeaways.title"),
          points: [
            t("home.tip3Article.keyTakeaways.point1"),
            t("home.tip3Article.keyTakeaways.point2"),
            t("home.tip3Article.keyTakeaways.point3"),
            t("home.tip3Article.keyTakeaways.point4"),
          ]
        }
      }
    }
  ]


  const selectedTipData = tips.find(t => t.id === selectedTip)


  return (
    <>
      {/* Article Modal */}
      {selectedTip !== null && selectedTipData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTip(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedTipData.title}</h2>
              <button
                onClick={() => setSelectedTip(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition flex-shrink-0"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>


            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-8">
                {/* Image */}
                <div className="relative h-72 mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedTipData.image}
                    alt={selectedTipData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-teal-500 px-4 py-1.5 rounded-full text-xs font-medium text-white inline-flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.4795 0C17.8088 0.00023412 22.958 5.15013 22.958 11.4795C22.9578 17.8088 17.8088 22.9578 11.4795 22.958C8.51379 22.958 5.68965 21.8145 3.56445 19.79V20.4688C3.56432 20.7224 3.3582 20.9277 3.10449 20.9277C2.85095 20.9275 2.64564 20.7223 2.64551 20.4688V18.6445C2.64284 18.5295 2.68419 18.4187 2.76562 18.3291C2.77276 18.3209 2.77741 18.3113 2.78516 18.3037C2.79105 18.298 2.7936 18.2905 2.7998 18.2852C2.82229 18.2661 2.84914 18.2573 2.87402 18.2432C2.89695 18.2294 2.91804 18.2146 2.94336 18.2051C2.96924 18.1957 2.99559 18.1938 3.02246 18.1895C3.04993 18.1843 3.07545 18.1729 3.10449 18.1729H4.94141C5.19516 18.1729 5.40039 18.3781 5.40039 18.6318C5.40038 18.8856 5.19516 19.0908 4.94141 19.0908H4.16309C6.12286 20.9745 8.7352 22.0391 11.4795 22.0391C17.3022 22.0389 22.0398 17.3024 22.04 11.4795C22.04 5.65637 17.3029 0.919119 11.4795 0.918945C5.65596 0.918945 0.918168 5.65626 0.917969 11.4795C0.917735 11.7331 0.712628 11.9385 0.458984 11.9385C0.205406 11.9384 0.000233187 11.733 0 11.4795C0 5.14998 5.14998 0 11.4795 0Z" fill="white"/>
                      </svg>
                      CO₂ tip
                    </div>
                  </div>
                </div>


                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {selectedTipData.article.intro && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {selectedTipData.article.intro}
                    </p>
                  )}


                  {selectedTipData.article.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}


                  {selectedTipData.article.keyTakeaways && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                        {selectedTipData.article.keyTakeaways.title}
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {selectedTipData.article.keyTakeaways.points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600')"
        }}
      >
        <div className="container mx-auto px-4">
          <FlightSearchForm
            currentLocale={currentLocale}
            defaultTo={prefillTo}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </section>


      <section className="py-16 bg-gray-50">
        <h2 className="text-center text-2xl font-bold mb-8 text-teal-600">
          {t("home.tipsTitle")}
        </h2>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          {tips.map((tip) => (
            <div
              key={tip.id}
              onClick={() => setSelectedTip(tip.id)}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${tip.image}')` }}
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-teal-500 px-4 py-1.5 rounded-full text-xs font-medium text-white inline-flex items-center gap-1.5">
                    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4795 0C17.8088 0.00023412 22.958 5.15013 22.958 11.4795C22.9578 17.8088 17.8088 22.9578 11.4795 22.958C8.51379 22.958 5.68965 21.8145 3.56445 19.79V20.4688C3.56432 20.7224 3.3582 20.9277 3.10449 20.9277C2.85095 20.9275 2.64564 20.7223 2.64551 20.4688V18.6445C2.64284 18.5295 2.68419 18.4187 2.76562 18.3291C2.77276 18.3209 2.77741 18.3113 2.78516 18.3037C2.79105 18.298 2.7936 18.2905 2.7998 18.2852C2.82229 18.2661 2.84914 18.2573 2.87402 18.2432C2.89695 18.2294 2.91804 18.2146 2.94336 18.2051C2.96924 18.1957 2.99559 18.1938 3.02246 18.1895C3.04993 18.1843 3.07545 18.1729 3.10449 18.1729H4.94141C5.19516 18.1729 5.40039 18.3781 5.40039 18.6318C5.40038 18.8856 5.19516 19.0908 4.94141 19.0908H4.16309C6.12286 20.9745 8.7352 22.0391 11.4795 22.0391C17.3022 22.0389 22.0398 17.3024 22.04 11.4795C22.04 5.65637 17.3029 0.919119 11.4795 0.918945C5.65596 0.918945 0.918168 5.65626 0.917969 11.4795C0.917735 11.7331 0.712628 11.9385 0.458984 11.9385C0.205406 11.9384 0.000233187 11.733 0 11.4795C0 5.14998 5.14998 0 11.4795 0ZM16.5439 5.81934C16.6328 5.60337 16.8602 5.50277 17.0889 5.57129C17.233 5.61455 17.3313 5.73314 17.377 5.87109C17.3809 5.88192 17.3845 5.8923 17.3877 5.90332C17.3972 5.94013 17.4013 5.97665 17.4023 6.01465C17.4033 6.04117 17.4022 6.06704 17.3984 6.09375C17.3967 6.10705 17.4004 6.12069 17.3975 6.13379C17.3324 6.41592 15.7968 12.9893 12.9521 15.834C11.7686 17.0178 10.5429 17.3799 9.48828 17.3799C7.84909 17.3797 6.62043 16.5057 6.59375 16.4863C6.58892 16.4829 6.58559 16.4774 6.58105 16.4736C6.55235 16.4509 6.52606 16.4237 6.50293 16.3936C6.49857 16.3882 6.49218 16.3847 6.48828 16.3789C6.48711 16.3773 6.48271 16.3703 6.48047 16.3672L6.47852 16.3652V16.3643C6.35933 16.1908 5.03571 14.1868 5.76855 12.0869C6.31183 10.5302 7.82407 9.37292 10.2627 8.64746C15.6171 7.05434 16.4743 5.92447 16.5322 5.83887C16.5342 5.83468 16.5371 5.83036 16.5391 5.82617C16.5405 5.82366 16.5426 5.82185 16.5439 5.81934ZM15.625 8.92188C14.3455 10.5582 12.7871 12.0624 11.3525 13.291C11.5562 13.2884 11.761 13.2531 11.9326 13.1582C12.1555 13.0344 12.4338 13.1174 12.5566 13.3389C12.6792 13.5609 12.5986 13.8395 12.377 13.9619C12.0407 14.1479 11.6707 14.209 11.3301 14.209C10.961 14.209 10.6295 14.1384 10.4082 14.0762C9.29843 14.974 8.33375 15.6688 7.73828 16.0811C8.66486 16.5036 10.5159 16.9714 12.3027 15.1846C13.7856 13.7017 14.9127 11.0196 15.625 8.92188ZM15.3838 7.71289C14.3659 8.22483 12.8344 8.84055 10.5244 9.52734C8.38793 10.1631 7.07969 11.1242 6.63672 12.3838C6.20784 13.6045 6.69808 14.8473 7.01465 15.4609C7.27583 15.2813 7.6513 15.0178 8.11035 14.6797C7.96132 13.5772 8.32022 12.4158 8.33887 12.3564C8.41561 12.1152 8.67202 11.9809 8.91504 12.0566C9.15655 12.1329 9.29 12.3912 9.21387 12.6328C9.20893 12.6492 9.01042 13.2997 8.99219 14.0137C9.70606 13.4613 10.5222 12.7959 11.3613 12.0479C11.1958 11.1055 11.4494 10.1184 11.4629 10.0674C11.5273 9.82257 11.7786 9.67485 12.0234 9.74023C12.2685 9.80465 12.4147 10.0561 12.3506 10.3008C12.349 10.3076 12.241 10.7395 12.2256 11.2539C13.358 10.1788 14.4778 8.9745 15.3838 7.71289Z" fill="white" />
                    </svg>
                    CO₂ tip
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-gray-900 flex items-center justify-between gap-3">
                  <span className="flex-1 line-clamp-2">{tip.title}</span>
                  <svg className="flex-shrink-0" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="17" cy="17" r="16.25" stroke="#0A9C89" strokeWidth="1.5" />
                    <path d="M24.7071 17.7071C25.0976 17.3166 25.0976 16.6834 24.7071 16.2929L18.3431 9.92893C17.9526 9.53841 17.3195 9.53841 16.9289 9.92893C16.5384 10.3195 16.5384 10.9526 16.9289 11.3431L22.5858 17L16.9289 22.6569C16.5384 23.0474 16.5384 23.6805 16.9289 24.0711C17.3195 24.4616 17.9526 24.4616 18.3431 24.0711L24.7071 17.7071ZM10 17L10 18L24 18L24 17L24 16L10 16L10 17Z" fill="#0A9C89" />
                  </svg>
                </h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      <GreenWingPassCTA currentLocale={currentLocale} />


      <FlightOffersGallery
        title={t("home.offersTitle")}
        flights={offersFlights}
        currentLocale={currentLocale}
      />


      <FlightTrendingGallery
        title={t("home.trendingTitle")}
        flights={trendingFlights}
        currentLocale={currentLocale}
      />
    </>
  )
}



