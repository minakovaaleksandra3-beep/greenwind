"use server"


import { revalidatePath, revalidateTag } from "next/cache"
import { getAuthHeaders } from "@lib/data/cookies"
import { getCacheTag } from "@lib/data/cookies"


export async function activateGreenWingPass() {
  const headers = await getAuthHeaders()
  const url = `${process.env.MEDUSA_BACKEND_URL}/store/pass`


  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      ...headers,
    },
  })


  const body = await response.text()
  console.log("Response status:", response.status, body)


  // Очищаємо кеш customer
  const customerTag = await getCacheTag("customers")
  if (customerTag) revalidateTag(customerTag)


  revalidatePath("/[countryCode]/account/greenwin-pass", "page")
}

