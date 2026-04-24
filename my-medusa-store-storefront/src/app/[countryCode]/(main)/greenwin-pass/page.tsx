import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import GreenWingPassClient from "@modules/account/components/greenwin-pass-client"
import { redirect } from "next/navigation"


export const metadata: Metadata = {
  title: "GreenWing Pass",
  description: "Your GreenWing Pass membership",
}


export default async function GreenWingPassPage({
  params,
}: {
  params: { countryCode: string }
}) {
  const customer = await retrieveCustomer()
  const currentLocale = await getLocale()


  if (!customer) {
    redirect(`/${params.countryCode}/account`)
  }


  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <GreenWingPassClient customer={customer} currentLocale={currentLocale} />
    </div>
  )
}



