"use client"


import React, { useEffect, useActionState, useMemo } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { getTranslation } from "@lib/util/translations"
import { updateCustomerEmail } from "../profile-actions"


type Props = {
  customer: HttpTypes.StoreCustomer
  currentLocale?: string | null
}


const ProfileEmail: React.FC<Props> = ({ customer, currentLocale }) => {
  const [successState, setSuccessState] = React.useState(false)


  const t = useMemo(() => (key: string, def: string) =>
    getTranslation(currentLocale || null, key) || def, [currentLocale])


  const [state, formAction] = useActionState(updateCustomerEmail, {
    success: false, error: "",
  })


  useEffect(() => {
    setSuccessState(state.success)
  }, [state])


  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="customerId" value={customer.id} />
      <AccountInfo
        label={t("account.profile.email", "Email")}
        currentInfo={`${customer.email}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={() => setSuccessState(false)}
        currentLocale={currentLocale}
        data-testid="account-email-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label={t("account.profile.email", "Email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={customer.email}
            data-testid="email-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}


export default ProfileEmail



