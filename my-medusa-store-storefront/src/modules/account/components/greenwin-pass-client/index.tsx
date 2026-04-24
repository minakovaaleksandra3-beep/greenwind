"use client"


import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import GreenWingPassActive from "@modules/account/components/greenwin-pass-active"
import GreenWingPassInactive from "@modules/account/components/greenwin-pass-inactive"

type Props = {
  customer: HttpTypes.StoreCustomer
  currentLocale?: string | null
}

export default function GreenWingPassClient({ customer, currentLocale }: Props) {
  const [hasActivePass, setHasActivePass] = useState(
    customer.metadata?.has_pass === true
  )

  return hasActivePass ? (
    <GreenWingPassActive customer={customer} currentLocale={currentLocale} />
  ) : (
    <GreenWingPassInactive
      customer={customer}
      currentLocale={currentLocale}
      onSuccess={() => setHasActivePass(true)}
    />
  )
}

