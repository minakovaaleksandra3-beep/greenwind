"use client"


import React, { useEffect, useActionState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { getTranslation } from "@lib/util/translations"
import { updateCustomerPhone } from "../profile-actions"


type Props = {
  customer: HttpTypes.StoreCustomer
  currentLocale?: string | null
}


const ProfilePhone: React.FC<Props> = ({ customer, currentLocale }) => {
  const [successState, setSuccessState] = React.useState(false)
  const router = useRouter()


  const t = useMemo(() => (key: string, def: string) =>
    getTranslation(currentLocale || null, key) || def, [currentLocale])


  const [state, formAction] = useActionState(updateCustomerPhone, {
    success: false, error: "",
  })


  useEffect(() => {
    setSuccessState(state.success)
    if (state.success) router.refresh()
  }, [state])


  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label={t("account.profile.phone", "Phone")}
        currentInfo={`${customer.phone}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={() => setSuccessState(false)}
        currentLocale={currentLocale}
        data-testid="account-phone-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input label={t("account.profile.phone", "Phone")} name="phone" type="phone" autoComplete="phone" required defaultValue={customer.phone ?? ""} data-testid="phone-input" />
        </div>
      </AccountInfo>
    </form>
  )
}


export default ProfilePhone



