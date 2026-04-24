import { getLocale } from "@lib/data/locale-actions"
import HelpClient from "./help-client"


export default async function HelpPage() {
  const currentLocale = await getLocale()
 
  return <HelpClient currentLocale={currentLocale} />
}

