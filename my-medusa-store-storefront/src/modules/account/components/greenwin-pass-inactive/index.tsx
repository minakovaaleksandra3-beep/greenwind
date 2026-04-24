"use client"


import { useState, useMemo } from "react"
import { getTranslation } from "@lib/util/translations"
import { HttpTypes } from "@medusajs/types"
import GreenWingPassCheckout from "../greenwin-pass-checkout"


type Props = {
  currentLocale?: string | null
  customer: HttpTypes.StoreCustomer
  onSuccess: () => void
}


export default function GreenWingPassInactive({ currentLocale, customer, onSuccess }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")
  const [showCheckout, setShowCheckout] = useState(false)


  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale || null, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  const benefits = [
    { icon: "✈️", titleKey: "account.passInactive.b1Title", titleDef: "3 free flights", descKey: "account.passInactive.b1Desc", descDef: "Per year on any destination" },
    { icon: "🎫", titleKey: "account.passInactive.b2Title", titleDef: "Priority boarding", descKey: "account.passInactive.b2Desc", descDef: "Be first to board" },
    { icon: "🌍", titleKey: "account.passInactive.b3Title", titleDef: "VIP lounge access", descKey: "account.passInactive.b3Desc", descDef: "In 200+ airports worldwide" },
    { icon: "💼", titleKey: "account.passInactive.b4Title", titleDef: "Extra baggage", descKey: "account.passInactive.b4Desc", descDef: "+20kg free of charge" },
    { icon: "🎁", titleKey: "account.passInactive.b5Title", titleDef: "Exclusive discounts", descKey: "account.passInactive.b5Desc", descDef: "Up to 30% on hotels & cars" },
    { icon: "📱", titleKey: "account.passInactive.b6Title", titleDef: "24/7 support", descKey: "account.passInactive.b6Desc", descDef: "Personal manager" },
  ]


  return (
    <>
      {showCheckout && (
        <GreenWingPassCheckout
          customer={customer}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false)
            onSuccess()
          }}
        />
      )}


      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenWing Pass</h1>
          <p className="text-gray-600">{t("account.passInactive.subtitle", "Travel more, spend less")}</p>
        </div>


        {/* Hero Card */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                  <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t("account.passInactive.heroTitle", "Exclusive subscription")}</h2>
                <p className="text-teal-100">{t("account.passInactive.heroSubtitle", "For real travelers")}</p>
              </div>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold">{selectedPlan === "monthly" ? "£29.99" : "£299"}</span>
              <span className="text-teal-100 text-xl">
                / {selectedPlan === "monthly" ? t("account.passInactive.month", "month") : t("account.passInactive.year", "year")}
              </span>
              {selectedPlan === "yearly" && (
                <span className="ml-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {t("account.passInactive.save", "Save £60")}
                </span>
              )}
            </div>
          </div>
        </div>


        {/* Plan Selector */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-8 flex gap-2">
          <button onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${selectedPlan === "monthly" ? "bg-teal-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}>
            {t("account.passInactive.monthly", "Monthly")}
          </button>
          <button onClick={() => setSelectedPlan("yearly")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition relative ${selectedPlan === "yearly" ? "bg-teal-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}>
            {t("account.passInactive.yearly", "Yearly")}
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-bold">-17%</span>
          </button>
        </div>


        {/* Benefits Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t("account.passInactive.whatsIncluded", "What's included:")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-teal-500">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1">{t(b.titleKey, b.titleDef)}</h4>
                <p className="text-sm text-gray-600">{t(b.descKey, b.descDef)}</p>
              </div>
            ))}
          </div>
        </div>


        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-8 border-2 border-teal-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("account.passInactive.ctaTitle", "Ready for amazing travels?")}</h3>
              <p className="text-gray-600">{t("account.passInactive.ctaSubtitle", "Join thousands of happy travelers")}</p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition whitespace-nowrap"
            >
              {t("account.passInactive.subscribe", "Subscribe now")}
            </button>
          </div>
        </div>


        {/* FAQ */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t("account.passInactive.faqTitle", "FAQ")}</h3>
          <div className="space-y-4">
            {[
              { qKey: "account.passInactive.faq1q", qDef: "When do I get free flights?", aKey: "account.passInactive.faq1a", aDef: "Immediately after subscribing you get 3 free flights valid for one year." },
              { qKey: "account.passInactive.faq2q", qDef: "Can I cancel my subscription?", aKey: "account.passInactive.faq2a", aDef: "Yes, you can cancel anytime. The subscription stays active until the end of the paid period." },
              { qKey: "account.passInactive.faq3q", qDef: "Which destinations are covered?", aKey: "account.passInactive.faq3a", aDef: "All destinations served by GreenWing — no restrictions on dates or routes." },
            ].map((faq, i) => (
              <details key={i} className="group">
                <summary className="font-semibold text-gray-900 cursor-pointer py-2 flex justify-between items-center">
                  {t(faq.qKey, faq.qDef)}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-gray-600 mt-2 pl-4">{t(faq.aKey, faq.aDef)}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

