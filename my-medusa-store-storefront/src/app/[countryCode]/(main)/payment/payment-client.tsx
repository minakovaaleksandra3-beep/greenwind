"use client"


import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"


type PaymentStep = "passengers" | "pass-allocation" | "method" | "card" | "processing" | "success" | "cancelled"


type Passenger = {
  firstName: string
  lastName: string
  middleName: string
  type: "adult" | "child"
  usePass: boolean
}


type PaymentMethod = "apple" | "google" | "card" | "pass" | null


export default function PaymentClient() {
  const searchParams = useSearchParams()
  const router = useRouter()


  // ─── Base params ───
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""
  const departureTime = searchParams.get("departureTime") || ""
  const arrivalTime = searchParams.get("arrivalTime") || ""
  const flightNumber = searchParams.get("flightNumber") || "GW2071"
  const selectedClass = (searchParams.get("class") || "economy") as "economy" | "business"
  const totalPriceFromSearch = parseFloat(searchParams.get("price") || "0")
  const currency = searchParams.get("currency") || "GBP"
  const scheduleId = searchParams.get("scheduleId") || ""
  const departDate = searchParams.get("departDate") || ""
  const hasPass = searchParams.get("hasPass") === "true"
  const passFlightsLeft = parseInt(searchParams.get("passFlightsLeft") || "0")
  const passengerName = searchParams.get("passengerName") || "Guest"
  const passengerEmail = searchParams.get("passengerEmail") || "guest@greenwing.com"
  const adultsCount = parseInt(searchParams.get("adults") || "1")
  const childrenCount = parseInt(searchParams.get("children") || "0")
  const totalP = adultsCount + childrenCount
  const pricePerPerson = totalP > 0 ? totalPriceFromSearch / totalP : totalPriceFromSearch


  // ─── Trip params ───
  const isTripBooking = searchParams.get("isTripBooking") === "true"
  const redirectAfterSuccess = searchParams.get("redirectAfterSuccess") || ""
  const tripId = searchParams.get("tripId") || ""
  const returnScheduleId = searchParams.get("returnScheduleId") || ""
  const returnClass = (searchParams.get("returnClass") || selectedClass) as "economy" | "business"
  const returnTime = searchParams.get("returnTime") || ""
  const returnArrivalTime = searchParams.get("returnArrivalTime") || ""
  const returnFlightNumber = searchParams.get("returnFlightNumber") || ""
  const returnDate = searchParams.get("returnDate") || ""
  const returnPricePerPerson = parseFloat(searchParams.get("returnPrice") || "0") / totalP
  const toCity = searchParams.get("toCity") || to
  const fromCity = searchParams.get("fromCity") || from


  // Trip total = (outbound + return) per person × passengers
  // totalPriceFromSearch вже є grand total (включно готель), але flight-only для Pass:
  const outboundFlightTotal = (totalPriceFromSearch - returnPricePerPerson * totalP)
  // Якщо передається як grandTotal вже з готелем — не ділимо. Просто показуємо як є.
  const grandTotal = totalPriceFromSearch


  const getInitialStep = (): PaymentStep => {
    if (totalP > 1) return "passengers"
    if (hasPass && passFlightsLeft > 0) return "pass-allocation"
    return "method"
  }


  const [step, setStep] = useState<PaymentStep>(getInitialStep)
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const init: Passenger[] = []
    for (let i = 0; i < adultsCount; i++) init.push({ firstName: "", lastName: "", middleName: "", type: "adult", usePass: false })
    for (let i = 0; i < childrenCount; i++) init.push({ firstName: "", lastName: "", middleName: "", type: "child", usePass: false })
    return init
  })


  const [method, setMethod] = useState<PaymentMethod>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [saveCard, setSaveCard] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processingMsg, setProcessingMsg] = useState("")
  const [outboundRef, setOutboundRef] = useState("")
  const [returnRef, setReturnRef] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)


  const broadcastRef = useRef<BroadcastChannel | null>(null)


  useEffect(() => {
    broadcastRef.current = new BroadcastChannel("greenwing_payment")
    return () => broadcastRef.current?.close()
  }, [])


  const passUsedCount = passengers.filter(p => p.usePass).length
  const paidPassengers = passengers.filter(p => !p.usePass).length
  const anyPassUsed = passUsedCount > 0
  const allFree = paidPassengers === 0


  // Для Pass — ціна тільки flight частини
  const flightOnlyTotal = isTripBooking
    ? (pricePerPerson + returnPricePerPerson) * totalP
    : totalP * pricePerPerson
  const paidFlightTotal = allFree ? 0 : (paidPassengers / totalP) * flightOnlyTotal
  const totalPrice = isTripBooking
    ? (allFree ? (grandTotal - flightOnlyTotal) : grandTotal - (passUsedCount / totalP) * flightOnlyTotal)
    : paidPassengers * pricePerPerson


  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()


  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d
  }


  const validate = () => {
    const e: Record<string, string> = {}
    if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Enter valid 16-digit number"
    if (!cardName.trim()) e.cardName = "Enter cardholder name"
    if (expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)"
    if (cvv.length < 3) e.cvv = "Enter valid CVV"
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const generateRef = () => "GW-" + Math.random().toString(36).substring(2, 7).toUpperCase()


  const handleBook = async () => {
    if (method === "card" && !validate()) return


    setStep("processing")
    const oRef = generateRef()
    const rRef = isTripBooking ? generateRef() : ""
    setOutboundRef(oRef)
    setReturnRef(rRef)


    const messages = [
      allFree ? "Activating GreenWing Pass..." : method === "apple" ? "Authenticating with Apple Pay..." : method === "google" ? "Connecting to Google Pay..." : "Verifying card details...",
      isTripBooking ? "Booking outbound flight..." : "Securing your booking...",
      isTripBooking ? "Booking return flight..." : "Confirming with GreenWing...",
      "Booking confirmed!",
    ]


    for (let i = 0; i < messages.length; i++) {
      await new Promise((r) => setTimeout(r, 900))
      setProcessingMsg(messages[i])
      setProcessingProgress(((i + 1) / messages.length) * 100)
    }


    await new Promise((r) => setTimeout(r, 400))


    broadcastRef.current?.postMessage({
      type: "BOOKING_SUCCESS",
      data: {
        // Для single-flight сумісності — bookingRef = outboundRef
        bookingRef: oRef,
        scheduleId,
        from,
        to,
        departureTime,
        arrivalTime,
        flightNumber,
        selectedClass,
        price: totalPrice,
        currency,
        departDate,
        paidWithPass: allFree,
        bookedAt: new Date().toISOString(),
        passengerName,
        passengerEmail,
        passFlightsLeft,
        passUsedCount,
        passengers: passengers.map(p => ({
          firstName: p.firstName || passengerName.split(" ")[0],
          lastName: p.lastName || passengerName.split(" ").slice(1).join(" "),
          middleName: p.middleName,
          type: p.type,
          usePass: p.usePass,
        })),
        adultsCount,
        childrenCount,
        // Trip-specific
        isTripBooking,
        tripId,
        outboundRef: oRef,
        returnRef: rRef,
        returnScheduleId,
        returnClass,
        returnPrice: returnPricePerPerson * totalP,
      },
    })


    setStep("success")
  }


  const handleCancel = () => {
    broadcastRef.current?.postMessage({ type: "BOOKING_CANCELLED" })
    window.close()
    setTimeout(() => router.back(), 300)
  }


  const handleClose = () => {
    const dest = redirectAfterSuccess || (isTripBooking ? "/my-trips" : "/my-flights")
    // Повідомляємо батьківське вікно зробити redirect
    broadcastRef.current?.postMessage({ type: "REDIRECT_AFTER_BOOKING", dest })
    window.close()
  }


  const handlePassengersNext = () => {
    const allFilled = passengers.every(p => p.firstName.trim() && p.lastName.trim())
    if (!allFilled) { alert("Please fill in first and last name for all passengers"); return }
    if (hasPass && passFlightsLeft > 0) setStep("pass-allocation")
    else setStep("method")
  }


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .shimmer { animation: shimmer 1.5s ease-in-out infinite; }
        .check-pop { animation: checkPop 0.5s cubic-bezier(.36,.07,.19,.97) forwards; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-hover:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
        .input-field { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 16px; width: 100%; color: white; font-size: 15px; transition: all 0.2s; outline: none; }
        .input-field:focus { border-color: #00897B; background: rgba(0,137,123,0.1); }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .input-error { border-color: #f87171 !important; background: rgba(248,113,113,0.08) !important; }
        .btn-primary { background: linear-gradient(135deg, #00897B, #00695C); border-radius: 14px; padding: 16px; font-weight: 600; font-size: 16px; transition: all 0.2s; cursor: pointer; width: 100%; border: none; color: white; }
        .btn-primary:hover { background: linear-gradient(135deg, #009688, #00796B); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,137,123,0.4); }
        .btn-secondary { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; font-weight: 500; font-size: 15px; transition: all 0.2s; cursor: pointer; width: 100%; color: rgba(255,255,255,0.7); }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }
      `}</style>


      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position:"absolute",top:"-20%",left:"-10%",width:"500px",height:"500px",background:"radial-gradient(circle, rgba(0,137,123,0.15) 0%, transparent 70%)",borderRadius:"50%" }} />
        <div style={{ position:"absolute",bottom:"-20%",right:"-10%",width:"600px",height:"600px",background:"radial-gradient(circle, rgba(0,105,92,0.1) 0%, transparent 70%)",borderRadius:"50%" }} />
      </div>


      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div style={{ width:32,height:32,background:"linear-gradient(135deg,#00897B,#004D40)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z" />
                <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z" />
              </svg>
            </div>
            <span style={{ fontWeight:600,fontSize:16 }}>GreenWing Pay</span>
          </div>
          <div style={{ color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL
          </div>
        </div>


        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-[440px]">


            {/* ─── FLIGHT SUMMARY ─── */}
            {step !== "success" && step !== "cancelled" && (
              <div className="glass rounded-2xl p-5 mb-6 fade-up">
                <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.1em",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:12 }}>
                  {isTripBooking ? "Your trip" : "Your flight"}
                </div>


                {/* Outbound */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:2 }}>
                      {isTripBooking ? "↗ Outbound" : "Flight"}
                    </div>
                    <div style={{ fontSize:22,fontWeight:700 }}>{departureTime}</div>
                    <div style={{ color:"rgba(255,255,255,0.5)",fontSize:13 }}>{from}</div>
                  </div>
                  <div style={{ flex:1,margin:"0 12px",display:"flex",flexDirection:"column",alignItems:"center" }}>
                    <svg width="60" height="16" viewBox="0 0 80 16" fill="none">
                      <line x1="0" y1="8" x2="55" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"/>
                      <path d="M60 8L68 4V6H80V10H68V12L60 8Z" fill="rgba(0,137,123,0.8)"/>
                    </svg>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:4 }}>{selectedClass}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22,fontWeight:700 }}>{arrivalTime}</div>
                    <div style={{ color:"rgba(255,255,255,0.5)",fontSize:13 }}>{to}</div>
                  </div>
                </div>


                {/* Return flight (trip only) */}
                {isTripBooking && returnTime && (
                  <>
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",margin:"10px 0" }} />
                    <div className="flex items-center justify-between">
                      <div>
                        <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:2 }}>↙ Return</div>
                        <div style={{ fontSize:22,fontWeight:700 }}>{returnTime}</div>
                        <div style={{ color:"rgba(255,255,255,0.5)",fontSize:13 }}>{to}</div>
                      </div>
                      <div style={{ flex:1,margin:"0 12px",display:"flex",flexDirection:"column",alignItems:"center" }}>
                        <svg width="60" height="16" viewBox="0 0 80 16" fill="none" style={{ transform:"scaleX(-1)" }}>
                          <line x1="0" y1="8" x2="55" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"/>
                          <path d="M60 8L68 4V6H80V10H68V12L60 8Z" fill="rgba(0,137,123,0.8)"/>
                        </svg>
                        <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:4 }}>{returnClass}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:22,fontWeight:700 }}>{returnArrivalTime}</div>
                        <div style={{ color:"rgba(255,255,255,0.5)",fontSize:13 }}>{from}</div>
                      </div>
                    </div>
                  </>
                )}


                <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12,marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>
                    {flightNumber}{isTripBooking && returnFlightNumber ? ` · ${returnFlightNumber}` : ""} · {departDate} · {totalP} pax
                  </div>
                  <div style={{ fontSize:18,fontWeight:700,color:"#00897B" }}>
                    {currency} {grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            )}


            {/* ─── STEP: PASSENGERS ─── */}
            {step === "passengers" && (
              <div className="fade-up">
                <h1 style={{ fontSize:22,fontWeight:700,marginBottom:6 }}>Passenger details</h1>
                <p style={{ color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:24 }}>Enter details for all {totalP} passengers</p>
                <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                  {passengers.map((p, idx) => {
                    const update = (field: keyof typeof p, value: string) =>
                      setPassengers(prev => prev.map((px, i) => i === idx ? { ...px, [field]: value } : px))
                    return (
                      <div key={idx} className="glass" style={{ borderRadius:16,padding:"16px 20px" }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em" }}>
                          {p.type === "adult" ? `Adult ${idx < adultsCount ? idx+1 : ""}` : `Child ${idx - adultsCount + 1}`}
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                            <div>
                              <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"block" }}>First name *</label>
                              <input className="input-field" placeholder="Ім'я" value={p.firstName} onChange={e => update("firstName", e.target.value)} />
                            </div>
                            <div>
                              <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"block" }}>Last name *</label>
                              <input className="input-field" placeholder="Прізвище" value={p.lastName} onChange={e => update("lastName", e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"block" }}>Middle name (optional)</label>
                            <input className="input-field" placeholder="По батькові" value={p.middleName} onChange={e => update("middleName", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10,marginTop:24 }}>
                  <button className="btn-primary" onClick={handlePassengersNext}>Continue →</button>
                  <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            )}


            {/* ─── STEP: PASS ALLOCATION ─── */}
            {step === "pass-allocation" && (
              <div className="fade-up">
                <h1 style={{ fontSize:22,fontWeight:700,marginBottom:6 }}>GreenWing Pass</h1>
                <p style={{ color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:16 }}>Choose which passengers fly for free</p>
                <div style={{ background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13,color:"rgba(255,255,255,0.6)" }}>Available Pass flights</div>
                    <div style={{ fontSize:22,fontWeight:700,color:"#4ade80" }}>{passFlightsLeft - passUsedCount} remaining</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>Used this booking</div>
                    <div style={{ fontSize:20,fontWeight:700,color:"#4ade80" }}>{passUsedCount} / {Math.min(passFlightsLeft, totalP)}</div>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:20 }}>
                  {passengers.map((p, idx) => {
                    const canToggleOn = !p.usePass && passUsedCount < passFlightsLeft
                    const toggle = () => {
                      if (p.usePass || canToggleOn)
                        setPassengers(prev => prev.map((px, i) => i === idx ? { ...px, usePass: !px.usePass } : px))
                    }
                    const name = p.firstName ? `${p.firstName} ${p.lastName}` : (idx === 0 ? passengerName : `Passenger ${idx+1}`)
                    return (
                      <div key={idx} onClick={toggle}
                        style={{ borderRadius:14,padding:"14px 18px",border:p.usePass?"1.5px solid #4ade80":"1px solid rgba(255,255,255,0.08)",background:p.usePass?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.04)",cursor:(p.usePass||canToggleOn)?"pointer":"not-allowed",opacity:(!p.usePass&&!canToggleOn)?0.5:1,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${p.usePass?"#4ade80":"rgba(255,255,255,0.2)"}`,background:p.usePass?"#4ade80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s" }}>
                            {p.usePass && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <div>
                            <div style={{ fontWeight:600,fontSize:14 }}>{name}</div>
                            <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",textTransform:"capitalize" }}>{p.type}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          {p.usePass
                            ? <div><div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",textDecoration:"line-through" }}>{currency} {pricePerPerson.toFixed(2)}</div><div style={{ fontWeight:700,color:"#4ade80",fontSize:15 }}>Free ✈️</div></div>
                            : <div style={{ fontWeight:600,color:"rgba(255,255,255,0.7)",fontSize:15 }}>{currency} {pricePerPerson.toFixed(2)}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  <button className="btn-primary" onClick={() => { if (allFree) { setMethod("pass"); handleBook() } else setStep("method") }}>
                    {allFree ? "✈️ Book with Pass — Free" : `Continue → ${currency} ${totalPrice.toFixed(2)}`}
                  </button>
                  <button className="btn-secondary" onClick={() => setStep(totalP > 1 ? "passengers" : "method")}>← Back</button>
                </div>
              </div>
            )}


            {/* ─── STEP: METHOD ─── */}
            {step === "method" && (
              <div className="fade-up">
                <h1 style={{ fontSize:22,fontWeight:700,marginBottom:6 }}>Choose payment</h1>
                <p style={{ color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:16 }}>
                  {anyPassUsed ? `${passUsedCount} pax covered by Pass · Pay ${currency} ${totalPrice.toFixed(2)}` : "Select how you'd like to pay"}
                </p>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {[
                    { id:"apple", label:"Apple Pay", sub:"Touch ID or Face ID", icon:<svg width="22" height="22" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-157.2-77.1-93.5-134.2-97.1-150.7c-2.6-10.2-11.5-60.7-11.5-135.8 0-246.1 155.5-355.8 306.1-355.8 82.3 0 148.8 42.8 203.7 42.8 51.3 0 131.6-43.5 220.8-43.5zM563.2 145.5c22.8-27.5 40.8-66.8 40.8-106.1 0-5.8-.6-11.5-1.3-16.4-39.5 1.9-85.5 26.3-113.6 57-21.5 23.5-42.2 62.8-42.2 102.8 0 6.4.6 12.8 1.9 17.7 3.2.6 8.3 1.3 13.4 1.3 35.3 0 76.6-23.5 101-56.3z"/></svg>, bg:"#000" },
                    { id:"google", label:"Google Pay", sub:"Pay with Google", icon:<svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>, bg:"white" },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setMethod(opt.id as PaymentMethod)} className="glass glass-hover"
                      style={{ borderRadius:16,padding:"14px 20px",cursor:"pointer",border:method===opt.id?"1.5px solid #00897B":"1px solid rgba(255,255,255,0.08)",width:"100%",background:method===opt.id?"rgba(0,137,123,0.1)":undefined }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <div style={{ width:40,height:40,background:opt.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.15)" }}>{opt.icon}</div>
                          <div style={{ textAlign:"left" }}>
                            <div style={{ fontWeight:600,fontSize:15 }}>{opt.label}</div>
                            <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>{opt.sub}</div>
                          </div>
                        </div>
                        {method===opt.id && <div style={{ width:20,height:20,borderRadius:"50%",background:"#00897B",display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                      </div>
                    </button>
                  ))}
                  <button onClick={() => { setMethod("card"); setStep("card") }} className="glass glass-hover"
                    style={{ borderRadius:16,padding:"14px 20px",cursor:"pointer",border:method==="card"?"1.5px solid #00897B":"1px solid rgba(255,255,255,0.08)",width:"100%" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:40,height:40,background:"linear-gradient(135deg,#1e40af,#3b82f6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </div>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontWeight:600,fontSize:15 }}>Credit / Debit Card</div>
                        <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>Visa, Mastercard, Amex</div>
                      </div>
                    </div>
                  </button>
                </div>
                {method && method !== "card" && (
                  <div style={{ marginTop:20 }}>
                    <button onClick={handleBook} className="btn-primary">
                      {method === "apple" ? "Pay with Apple Pay" : "Pay with Google Pay"} — {currency} {totalPrice.toFixed(2)}
                    </button>
                  </div>
                )}
                <button onClick={handleCancel} className="btn-secondary" style={{ marginTop:10 }}>Cancel</button>
                {hasPass && passFlightsLeft > 0 && (
                  <button onClick={() => setStep("pass-allocation")} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",marginTop:8,width:"100%",textAlign:"center" }}>
                    ← Change Pass allocation
                  </button>
                )}
              </div>
            )}


            {/* ─── STEP: CARD ─── */}
            {step === "card" && (
              <div className="fade-up">
                <button onClick={() => setStep("method")} style={{ display:"flex",alignItems:"center",gap:6,color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:20,background:"none",border:"none",cursor:"pointer" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  Back to payment methods
                </button>
                <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>Enter card details</h2>
                <div style={{ background:"linear-gradient(135deg,#00897B,#004D40)",borderRadius:18,padding:24,marginBottom:24,position:"relative",overflow:"hidden",minHeight:160 }}>
                  <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
                  <div style={{ position:"relative",zIndex:1 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:24 }}>
                      <span style={{ fontWeight:700,fontSize:16 }}>GreenWing</span>
                      <div style={{ display:"flex" }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:"rgba(235,87,87,0.9)" }} />
                        <div style={{ width:28,height:28,borderRadius:"50%",background:"rgba(255,185,0,0.9)",marginLeft:-8 }} />
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize:18,letterSpacing:"0.15em",marginBottom:16,color:"rgba(255,255,255,0.9)" }}>{cardNumber||"•••• •••• •••• ••••"}</div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,0.7)" }}>
                      <div><div style={{ fontSize:10,marginBottom:2,opacity:.6 }}>CARD HOLDER</div><div>{cardName||"YOUR NAME"}</div></div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:10,marginBottom:2,opacity:.6 }}>EXPIRES</div><div>{expiry||"MM/YY"}</div></div>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  <div>
                    <label style={{ fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6,display:"block" }}>Card Number</label>
                    <input className={`input-field mono ${errors.cardNumber?"input-error":""}`} value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} />
                    {errors.cardNumber && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.cardNumber}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6,display:"block" }}>Cardholder Name</label>
                    <input className={`input-field ${errors.cardName?"input-error":""}`} value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="JOHN SMITH" style={{ textTransform:"uppercase",letterSpacing:"0.08em" }} />
                    {errors.cardName && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.cardName}</p>}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    <div>
                      <label style={{ fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6,display:"block" }}>Expiry</label>
                      <input className={`input-field mono ${errors.expiry?"input-error":""}`} value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} />
                      {errors.expiry && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6,display:"block" }}>CVV</label>
                      <input className={`input-field mono ${errors.cvv?"input-error":""}`} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" maxLength={4} type="password" />
                      {errors.cvv && <p style={{ color:"#f87171",fontSize:12,marginTop:4 }}>{errors.cvv}</p>}
                    </div>
                  </div>
                  <div style={{ background:"rgba(0,137,123,0.1)",border:"1px solid rgba(0,137,123,0.3)",borderRadius:14,padding:"14px 16px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ color:"rgba(255,255,255,0.6)",fontSize:14 }}>Total to pay</span>
                      <span style={{ fontSize:22,fontWeight:700,color:"#00897B" }}>{currency} {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={handleBook} className="btn-primary">Pay {currency} {totalPrice.toFixed(2)} — Confirm</button>
                  <button onClick={() => setStep("method")} className="btn-secondary">Back</button>
                </div>
              </div>
            )}


            {/* ─── STEP: PROCESSING ─── */}
            {step === "processing" && (
              <div className="fade-up" style={{ textAlign:"center",padding:"40px 0" }}>
                <div style={{ position:"relative",width:80,height:80,margin:"0 auto 28px" }}>
                  <svg style={{ animation:"spin 1s linear infinite",position:"absolute",inset:0 }} width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="36" stroke="rgba(0,137,123,0.2)" strokeWidth="6"/>
                    <path d="M40 4 A36 36 0 0 1 76 40" stroke="#00897B" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#00897B">
                      <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                      <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                    </svg>
                  </div>
                </div>
                <h2 style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>Processing payment</h2>
                <p className="shimmer" style={{ color:"rgba(255,255,255,0.5)",fontSize:15,marginBottom:28 }}>{processingMsg}</p>
                <div style={{ background:"rgba(255,255,255,0.08)",borderRadius:999,height:6,overflow:"hidden",margin:"0 auto",maxWidth:280 }}>
                  <div style={{ height:"100%",background:"linear-gradient(90deg,#00897B,#4ade80)",borderRadius:999,width:`${processingProgress}%`,transition:"width 0.8s ease" }} />
                </div>
                <p style={{ fontSize:12,color:"rgba(255,255,255,0.25)",marginTop:24 }}>Do not close this window</p>
              </div>
            )}


            {/* ─── STEP: SUCCESS ─── */}
            {step === "success" && (
              <div className="fade-up" style={{ textAlign:"center",padding:"20px 0" }}>
                <div style={{ width:80,height:80,borderRadius:"50%",background:"rgba(74,222,128,0.15)",border:"2px solid rgba(74,222,128,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }} className="check-pop">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h1 style={{ fontSize:26,fontWeight:700,marginBottom:8 }}>
                  {isTripBooking ? "Trip booked!" : "Booking confirmed!"}
                </h1>
                <p style={{ color:"rgba(255,255,255,0.5)",fontSize:15,marginBottom:24 }}>
                  {totalP > 1 ? `${totalP} passengers · ` : ""}{isTripBooking ? "Return trip confirmed" : "Your flight has been booked"}
                </p>


                {/* Booking refs */}
                <div className="glass" style={{ borderRadius:18,padding:20,marginBottom:16 }}>
                  {isTripBooking ? (
                    <>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:12 }}>Booking references</div>
                      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(0,137,123,0.1)",borderRadius:12 }}>
                          <div>
                            <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>↗ Outbound · {from} → {to}</div>
                            <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{departDate}</div>
                          </div>
                          <div className="mono" style={{ fontSize:20,fontWeight:700,color:"#00897B" }}>{outboundRef}</div>
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(0,137,123,0.1)",borderRadius:12 }}>
                          <div>
                            <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>↙ Return · {to} → {from}</div>
                            <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{returnDate}</div>
                          </div>
                          <div className="mono" style={{ fontSize:20,fontWeight:700,color:"#00897B" }}>{returnRef}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:8 }}>Booking reference</div>
                      <div className="mono" style={{ fontSize:28,fontWeight:700,color:"#00897B",letterSpacing:"0.1em" }}>{outboundRef}</div>
                    </>
                  )}
                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:16,paddingTop:16,display:"flex",justifyContent:"space-between",fontSize:14 }}>
                    <span style={{ color:"rgba(255,255,255,0.5)" }}>{from} → {to}{isTripBooking ? " → " + from : ""}</span>
                    <span style={{ fontWeight:700,color:"#00897B" }}>{allFree ? "Free 🎉" : `${currency} ${totalPrice.toFixed(2)}`}</span>
                  </div>
                </div>


                <p style={{ fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:20 }}>
                  Confirmation email sent. View in <strong style={{ color:"rgba(255,255,255,0.6)" }}>{isTripBooking ? "My Trips" : "My Flights"}</strong>.
                </p>
                <button onClick={handleClose} className="btn-primary">
                  {isTripBooking ? "View My Trips →" : "Close & return to GreenWing"}
                </button>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  )
}



