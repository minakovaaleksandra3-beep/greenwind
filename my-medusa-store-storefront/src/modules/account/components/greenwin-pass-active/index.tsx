"use client"


import { HttpTypes } from "@medusajs/types"
import { useMemo } from "react"
import { getTranslation } from "@lib/util/translations"


type Props = {
  customer: HttpTypes.StoreCustomer
  currentLocale?: string | null
}


export default function GreenWingPassActive({ customer, currentLocale }: Props) {
  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale || null, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  // Читаємо реальні дані з customer.metadata
  const flightsTotal = 3
  const flightsLeft =
    typeof customer.metadata?.pass_flights_left === "number"
      ? (customer.metadata.pass_flights_left as number)
      : flightsTotal


  const passData = {
    flightsUsed: flightsTotal - flightsLeft,
    flightsTotal,
    nextPaymentDate: "15.03.2026",
    nextPaymentAmount: "£29.99",
    memberSince: "15.01.2026",
    plan: "monthly" as "monthly" | "yearly",
  }


  const flightsRemaining = flightsLeft
  const progressPercentage = (passData.flightsUsed / passData.flightsTotal) * 100


  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenWing Pass</h1>
            <p className="text-gray-600">{t("account.pass.activeSubtitle", "Your subscription is active")}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {t("account.pass.active", "Active")}
          </div>
        </div>
      </div>


      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Flights Remaining */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="text-teal-100 text-sm font-medium mb-2">{t("account.pass.flightsAvailable", "Flights available")}</div>
            <div className="text-5xl font-bold mb-2">{flightsRemaining}</div>
            <div className="text-teal-100 text-sm">{t("account.pass.ofThisYear", "of {{total}} this year").replace("{{total}}", String(passData.flightsTotal))}</div>
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>


        {/* Next Payment */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-2">{t("account.pass.nextPayment", "Next payment")}</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{passData.nextPaymentDate}</div>
          <div className="text-teal-600 font-semibold text-lg">{passData.nextPaymentAmount}</div>
          <button className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium">
            {t("account.pass.changePayment", "Change payment method")} →
          </button>
        </div>


        {/* Member Since */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-2">{t("account.pass.memberSince", "Member since")}</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{passData.memberSince}</div>
          <div className="text-gray-600">{t("account.pass.monthlyPlan", "Monthly subscription")}</div>
          <button className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium">
            {t("account.pass.switchYearly", "Switch to yearly")} →
          </button>
        </div>
      </div>


      {/* Flight History */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t("account.pass.flightHistory", "Flight usage history")}</h3>
        {passData.flightsUsed > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                    <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t("account.pass.exampleRoute", "London → Paris")}</div>
                  <div className="text-sm text-gray-600">{t("account.pass.exampleDate", "18 February 2026")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-semibold">{t("account.pass.used", "Used")}</div>
                <div className="text-sm text-gray-600">{t("account.pass.saved", "Saved £89")}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{t("account.pass.noFlightsUsed", "You haven't used any flights yet")}</p>
            <button className="text-teal-600 hover:text-teal-700 font-semibold">
              {t("account.pass.bookFirst", "Book your first flight")} →
            </button>
          </div>
        )}
      </div>


      {/* Perks */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t("account.pass.yourPerks", "Your benefits")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🎫", titleKey: "account.pass.perk1Title", titleDef: "Priority boarding", descKey: "account.pass.perk1Desc", descDef: "On all GreenWing flights" },
            { icon: "🌍", titleKey: "account.pass.perk2Title", titleDef: "VIP lounges", descKey: "account.pass.perk2Desc", descDef: "Access in 200+ airports" },
            { icon: "💼", titleKey: "account.pass.perk3Title", titleDef: "Extra baggage", descKey: "account.pass.perk3Desc", descDef: "+20kg free of charge" },
            { icon: "📱", titleKey: "account.pass.perk4Title", titleDef: "VIP support", descKey: "account.pass.perk4Desc", descDef: "24/7, 7 days a week" },
          ].map((perk, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl">
              <div className="text-2xl">{perk.icon}</div>
              <div>
                <div className="font-semibold text-gray-900">{t(perk.titleKey, perk.titleDef)}</div>
                <div className="text-sm text-gray-600">{t(perk.descKey, perk.descDef)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Manage Subscription */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t("account.pass.manageSubscription", "Manage subscription")}</h3>
        <div className="flex flex-col gap-3">
          {[
            { labelKey: "account.pass.updatePayment", labelDef: "Update payment method", red: false },
            { labelKey: "account.pass.switchYearlyPlan", labelDef: "Switch to yearly plan", red: false },
            { labelKey: "account.pass.paymentHistory", labelDef: "Payment history", red: false },
          ].map((item, i) => (
            <button key={i} className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex items-center justify-between">
              <span className="font-medium text-gray-900">{t(item.labelKey, item.labelDef)}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          <button className="w-full text-left px-6 py-4 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center justify-between text-red-600">
            <span className="font-medium">{t("account.pass.cancelSubscription", "Cancel subscription")}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}



