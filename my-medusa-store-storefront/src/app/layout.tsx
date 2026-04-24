import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import { getLocale } from "@lib/data/locale-actions"
import { locales } from "@lib/data/locales"


export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}


export default async function RootLayout(props: { children: React.ReactNode }) {
  const currentLocale = await getLocale()
  
  return (
    <html lang={currentLocale || "en-GB"} data-mode="light">
      <body>
        <Nav locales={locales} currentLocale={currentLocale} />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}



