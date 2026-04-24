import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import HomeClient from "./home-client"


interface PageProps {
  searchParams?: Promise<{ prefillTo?: string }>
}


export default async function Page({ searchParams }: PageProps) {
  const currentLocale = await getLocale()
  const params = await searchParams
  const prefillTo = params?.prefillTo ?? undefined
  const customer = await retrieveCustomer()


  return (
    <HomeClient
      currentLocale={currentLocale}
      prefillTo={prefillTo}
      isLoggedIn={!!customer}
    />
  )
}



