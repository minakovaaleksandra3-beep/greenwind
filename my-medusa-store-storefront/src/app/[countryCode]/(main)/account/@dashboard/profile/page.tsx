import { Metadata } from "next"


import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"


import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import { getTranslation } from "@lib/util/translations"
import ProfileAvatar from "@modules/account/components/profile-avatar"


export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your profile.",
}


export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()
  const currentLocale = await getLocale()


  if (!customer || !regions) {
    notFound()
  }


  const t = (key: string, defaultValue: string) =>
    getTranslation(currentLocale, key) || defaultValue


  const initials = customer.first_name && customer.last_name
    ? `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase()
    : customer.first_name?.[0]?.toUpperCase() || "U"


  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex items-center gap-4">
        <ProfileAvatar initials={initials} email={customer.email} />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("account.profile.title", "Profile")}
          </h1>
          <p className="text-sm text-gray-600">
            {customer.first_name} {customer.last_name}
          </p>
        </div>
      </div>


      <div className="mb-8 flex flex-col gap-y-4">
        <p className="text-base-regular">
          {t("account.profile.description", "View and update your profile information, including your name, email, and phone number. You can also update your billing address, or change your password.")}
        </p>
      </div>


      <div className="flex flex-col gap-y-8 w-full">
        <ProfileName customer={customer} currentLocale={currentLocale} />
        <Divider />
        <ProfileEmail customer={customer} currentLocale={currentLocale} />
        <Divider />
        <ProfilePhone customer={customer} currentLocale={currentLocale} />
        <Divider />
        <ProfileBillingAddress customer={customer} regions={regions} currentLocale={currentLocale} />
      </div>
    </div>
  )
}


const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}



