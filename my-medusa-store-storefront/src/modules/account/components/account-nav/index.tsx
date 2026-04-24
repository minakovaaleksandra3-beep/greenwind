"use client"


import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"


import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"
import { getTranslation } from "@lib/util/translations"


const AccountNav = ({
  customer,
  currentLocale,
}: {
  customer: HttpTypes.StoreCustomer | null
  currentLocale?: string | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()


  const t = useMemo(() => {
    return (key: string, defaultValue: string) => {
      const translation = getTranslation(currentLocale || null, key)
      return translation || defaultValue
    }
  }, [currentLocale])


  const handleLogout = async () => {
    try {
      await signout(countryCode)
    } catch {
      // redirect() кидає exception в Next.js — це нормально
      router.push(`/${countryCode}/account`)
      router.refresh()
    }
  }


  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>{t("account.nav.account", "Account")}</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              {t("account.nav.hello", "Hello")} {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>{t("account.nav.profile", "Profile")}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/greenwin-pass"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="greenwin-pass-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <span>GreenWing Pass</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>{t("account.nav.addresses", "Addresses")}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>{t("account.nav.logout", "Log out")}</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="text-base-semi">{t("account.nav.account", "Account")}</h3>
          </div>
          <div className="text-base-regular">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
              <li>
                <AccountNavLink href="/account" route={route!} data-testid="overview-link">
                  {t("account.nav.overview", "Overview")}
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink href="/account/profile" route={route!} data-testid="profile-link">
                  {t("account.nav.profile", "Profile")}
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink href="/account/greenwin-pass" route={route!} data-testid="greenwin-pass-link">
                  GreenWing Pass
                </AccountNavLink>
              </li>
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                  className="text-ui-fg-subtle hover:text-ui-fg-base"
                >
                  {t("account.nav.logout", "Log out")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}


const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()


  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx("text-ui-fg-subtle hover:text-ui-fg-base", {
        "text-ui-fg-base font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}


export default AccountNav

