"use client"


import React, { useEffect, useActionState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { getTranslation } from "@lib/util/translations"
import { updateCustomerName } from "../profile-actions"


type Props = {
  customer: HttpTypes.StoreCustomer
  currentLocale?: string | null
}


const ProfileName: React.FC<Props> = ({ customer, currentLocale }) => {
  const [successState, setSuccessState] = React.useState(false)
  const router = useRouter()


  const t = useMemo(() => (key: string, def: string) =>
    getTranslation(currentLocale || null, key) || def, [currentLocale])


  const [state, formAction] = useActionState(updateCustomerName, {
    success: false, error: "",
  })


  useEffect(() => {
    setSuccessState(state.success)
    if (state.success) router.refresh()
  }, [state])


  return (
    <form action={formAction} className="w-full overflow-visible">
      <AccountInfo
        label={t("account.profile.name", "Name")}
        currentInfo={`${customer.first_name} ${customer.last_name}`}
        isSuccess={successState}
        isError={!!state.error}
        clearState={() => setSuccessState(false)}
        currentLocale={currentLocale}
        data-testid="account-name-editor"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Input label={t("account.profile.firstName", "First name")} name="first_name" required defaultValue={customer.first_name ?? ""} data-testid="first-name-input" />
          <Input label={t("account.profile.lastName", "Last name")} name="last_name" required defaultValue={customer.last_name ?? ""} data-testid="last-name-input" />
        </div>
      </AccountInfo>
    </form>
  )
}


export default ProfileName



