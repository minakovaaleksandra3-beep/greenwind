import { Suspense } from "react"
import PaymentClient from "./payment-client"


export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <PaymentClient />
    </Suspense>
  )
}



