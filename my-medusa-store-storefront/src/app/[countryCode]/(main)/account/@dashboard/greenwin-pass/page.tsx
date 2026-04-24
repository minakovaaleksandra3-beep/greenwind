import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import GreenWingPassClient from "@modules/account/components/greenwin-pass-client"


export const metadata: Metadata = {
  title: "GreenWing Pass",
  description: "Your GreenWing Pass membership",
}


export default async function GreenWingPassPage() {
  const customer = await retrieveCustomer()
  const currentLocale = await getLocale()


  if (!customer) {
    notFound()
  }


  return (
    <div className="w-full">
      <GreenWingPassClient customer={customer} currentLocale={currentLocale} />
    </div>
  )
}

