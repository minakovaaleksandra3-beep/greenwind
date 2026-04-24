import { getLocale } from "@lib/data/locale-actions"
import BookClient from "./book-client"


export default async function BookPage() {
  const currentLocale = await getLocale()
 
  return <BookClient currentLocale={currentLocale} />
}

