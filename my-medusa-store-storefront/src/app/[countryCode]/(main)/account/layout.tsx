import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"


export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)
  const currentLocale = await getLocale()


  return (
    <AccountLayout customer={customer} currentLocale={currentLocale}>
      {customer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}

