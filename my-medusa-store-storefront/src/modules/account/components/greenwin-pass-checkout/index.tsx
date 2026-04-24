"use client"


import { useState, useRef, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { activateGreenWingPass } from "@lib/data/pass-actions"


type Step = "details" | "plan" | "payment" | "card" | "processing" | "success"
type PaymentMethod = "apple" | "google" | "card" | null


type Props = {
  customer: HttpTypes.StoreCustomer
  onClose: () => void
  onSuccess: () => void
}


export default function GreenWingPassCheckout({ customer, onClose, onSuccess }: Props) {
  // Step 1 — Details
  const [firstName, setFirstName] = useState(customer.first_name || "")
  const [lastName, setLastName] = useState(customer.last_name || "")
  const [email, setEmail] = useState(customer.email || "")
  const [phone, setPhone] = useState(customer.phone || "")


  // Step 2 — Plan
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly")


  // Step 3 — Payment
  const [method, setMethod] = useState<PaymentMethod>(null)


  // Step 4 — Card
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})


  // Processing
  const [step, setStep] = useState<Step>("details")
  const [processingMsg, setProcessingMsg] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)


  const price = plan === "monthly" ? "£29.99" : "£299"
  const priceNum = plan === "monthly" ? 29.99 : 299


  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()


  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d
  }


  const validateDetails = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return false
    return true
  }


  const validateCard = () => {
    const e: Record<string, string> = {}
    if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Enter valid 16-digit number"
    if (!cardName.trim()) e.cardName = "Enter cardholder name"
    if (expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)"
    if (cvv.length < 3) e.cvv = "Enter valid CVV"
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const handlePayment = async () => {
    if (method === "card" && !validateCard()) return


    setStep("processing")


    const messages = [
      method === "apple" ? "Authenticating with Apple Pay..." :
      method === "google" ? "Connecting to Google Pay..." :
      "Verifying card details...",
      "Processing subscription...",
      "Activating GreenWing Pass...",
      "All done!",
    ]


    for (let i = 0; i < messages.length; i++) {
      await new Promise(r => setTimeout(r, 900))
      await activateGreenWingPass()
      setProcessingMsg(messages[i])
      setProcessingProgress(((i + 1) / messages.length) * 100)
    }


    await new Promise(r => setTimeout(r, 500))
    setStep("success")
  }


  const stepNumber = step === "details" ? 1 : step === "plan" ? 2 : (step === "payment" || step === "card") ? 3 : 0


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl" style={{ background: "#0a0a0f", color: "white", maxHeight: "90vh", overflowY: "auto" }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
          @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
          .fade-up { animation: fadeUp 0.4s ease forwards; }
          .shimmer { animation: shimmer 1.5s ease-in-out infinite; }
          .check-pop { animation: checkPop 0.5s cubic-bezier(.36,.07,.19,.97) forwards; }
          .pass-input { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 14px; width: 100%; color: white; font-size: 15px; outline: none; transition: all 0.2s; box-sizing: border-box; }
          .pass-input:focus { border-color: #00897B; background: rgba(0,137,123,0.1); }
          .pass-input::placeholder { color: rgba(255,255,255,0.3); }
          .pass-input-error { border-color: #f87171 !important; background: rgba(248,113,113,0.08) !important; }
          .pass-btn-primary { background: linear-gradient(135deg,#00897B,#00695C); border-radius: 14px; padding: 15px; font-weight: 600; font-size: 16px; transition: all 0.2s; cursor: pointer; width: 100%; border: none; color: white; }
          .pass-btn-primary:hover { background: linear-gradient(135deg,#009688,#00796B); transform: translateY(-1px); }
          .pass-btn-secondary { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; font-weight: 500; font-size: 15px; transition: all 0.2s; cursor: pointer; width: 100%; color: rgba(255,255,255,0.7); }
          .pass-btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }
          .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
          .glass-hover:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
        `}</style>


        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00897B,#004D40)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16 }}>GreenWing Pass</span>
          </div>
          {step !== "processing" && step !== "success" && (
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>


        {/* Steps indicator */}
        {stepNumber > 0 && (
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { n: 1, label: "Details" },
              { n: 2, label: "Plan" },
              { n: 3, label: "Payment" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 && <div style={{ flex: 1, height: 1, width: 24, background: stepNumber > i ? "#00897B" : "rgba(255,255,255,0.1)" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600,
                    background: stepNumber === s.n ? "#00897B" : stepNumber > s.n ? "rgba(0,137,123,0.3)" : "rgba(255,255,255,0.1)",
                    color: stepNumber >= s.n ? "white" : "rgba(255,255,255,0.4)",
                  }}>
                    {stepNumber > s.n ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : s.n}
                  </div>
                  <span style={{ fontSize: 13, color: stepNumber === s.n ? "white" : "rgba(255,255,255,0.4)", fontWeight: stepNumber === s.n ? 600 : 400 }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="px-6 py-6">


          {/* ── STEP 1: DETAILS ── */}
          {step === "details" && (
            <div className="fade-up">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Your details</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Review and confirm your information</p>


              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>First name</label>
                    <input className="pass-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Last name</label>
                    <input className="pass-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Email</label>
                  <input className="pass-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Phone (optional)</label>
                  <input className="pass-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900000" />
                </div>
              </div>


              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="pass-btn-primary" onClick={() => { if (validateDetails()) setStep("plan") }}>
                  Continue →
                </button>
                <button className="pass-btn-secondary" onClick={onClose}>Cancel</button>
              </div>
            </div>
          )}


          {/* ── STEP 2: PLAN ── */}
          {step === "plan" && (
            <div className="fade-up">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Choose your plan</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Select how often you'd like to be billed</p>


              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {/* Monthly */}
                <button onClick={() => setPlan("monthly")} className="glass glass-hover" style={{
                  borderRadius: 16, padding: "18px 20px", textAlign: "left", cursor: "pointer", width: "100%", border: plan === "monthly" ? "1.5px solid #00897B" : "1px solid rgba(255,255,255,0.08)",
                  background: plan === "monthly" ? "rgba(0,137,123,0.1)" : undefined, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Monthly</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Cancel anytime after 12 months</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#00897B" }}>£29.99</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ month</div>
                    </div>
                  </div>
                </button>


                {/* Yearly */}
                <button onClick={() => setPlan("yearly")} className="glass glass-hover" style={{
                  borderRadius: 16, padding: "18px 20px", textAlign: "left", cursor: "pointer", width: "100%", border: plan === "yearly" ? "1.5px solid #00897B" : "1px solid rgba(255,255,255,0.08)",
                  background: plan === "yearly" ? "rgba(0,137,123,0.1)" : undefined, transition: "all 0.2s", position: "relative",
                }}>
                  <div style={{ position: "absolute", top: -10, right: 16, background: "#facc15", color: "#111", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>SAVE £60</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Yearly</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Best value — 2 months free</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#00897B" }}>£299</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ year</div>
                    </div>
                  </div>
                </button>
              </div>


              {/* Perks */}
              <div className="glass" style={{ borderRadius: 16, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12 }}>
                  {plan === "yearly" ? "Yearly plan perks" : "What's included"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "✈️", text: "3 free flights per year" },
                    { icon: "🎫", text: "Priority boarding on all flights" },
                    { icon: "🌍", text: "VIP lounge access — 200+ airports" },
                    { icon: "💼", text: "+20kg extra baggage free" },
                    ...(plan === "yearly" ? [
                      { icon: "🎁", text: "2 months free vs monthly" },
                      { icon: "⭐", text: "Priority customer support" },
                    ] : []),
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
                      <span>{p.icon}</span>
                      <span>{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>


              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="pass-btn-primary" onClick={() => setStep("payment")}>
                  Continue with {plan === "monthly" ? "£29.99/mo" : "£299/yr"} →
                </button>
                <button className="pass-btn-secondary" onClick={() => setStep("details")}>← Back</button>
              </div>
            </div>
          )}


          {/* ── STEP 3: PAYMENT METHOD ── */}
          {step === "payment" && (
            <div className="fade-up">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Payment</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Select how you'd like to pay</p>


              {/* Summary */}
              <div className="glass" style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  GreenWing Pass · {plan === "monthly" ? "Monthly" : "Yearly"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00897B" }}>{price}</div>
              </div>


              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {/* Apple Pay */}
                <button onClick={() => setMethod("apple")} className="glass glass-hover" style={{
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer", width: "100%", textAlign: "left",
                  border: method === "apple" ? "1.5px solid #00897B" : "1px solid rgba(255,255,255,0.08)",
                  background: method === "apple" ? "rgba(0,137,123,0.1)" : undefined, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, background: "#000", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                        <svg width="20" height="20" viewBox="0 0 814 1000" fill="white">
                          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-157.2-77.1-93.5-134.2-97.1-150.7c-2.6-10.2-11.5-60.7-11.5-135.8 0-246.1 155.5-355.8 306.1-355.8 82.3 0 148.8 42.8 203.7 42.8 51.3 0 131.6-43.5 220.8-43.5zM563.2 145.5c22.8-27.5 40.8-66.8 40.8-106.1 0-5.8-.6-11.5-1.3-16.4-39.5 1.9-85.5 26.3-113.6 57-21.5 23.5-42.2 62.8-42.2 102.8 0 6.4.6 12.8 1.9 17.7 3.2.6 8.3 1.3 13.4 1.3 35.3 0 76.6-23.5 101-56.3z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Apple Pay</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Touch ID or Face ID</div>
                      </div>
                    </div>
                    {method === "apple" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#00897B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>}
                  </div>
                </button>


                {/* Google Pay */}
                <button onClick={() => setMethod("google")} className="glass glass-hover" style={{
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer", width: "100%", textAlign: "left",
                  border: method === "google" ? "1.5px solid #00897B" : "1px solid rgba(255,255,255,0.08)",
                  background: method === "google" ? "rgba(0,137,123,0.1)" : undefined, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Google Pay</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Pay with Google account</div>
                      </div>
                    </div>
                    {method === "google" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#00897B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>}
                  </div>
                </button>


                {/* Card */}
                <button onClick={() => setMethod("card")} className="glass glass-hover" style={{
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer", width: "100%", textAlign: "left",
                  border: method === "card" ? "1.5px solid #00897B" : "1px solid rgba(255,255,255,0.08)",
                  background: method === "card" ? "rgba(0,137,123,0.1)" : undefined, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <svg width="22" height="16" viewBox="0 0 24 16" fill="none"><rect width="24" height="16" rx="3" fill="#1a1a2e"/><rect y="3" width="24" height="4" fill="#2a2a4e"/><rect x="2" y="10" width="6" height="2" rx="1" fill="#facc15"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Credit / Debit card</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Visa, Mastercard, Amex</div>
                      </div>
                    </div>
                    {method === "card" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#00897B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>}
                  </div>
                </button>
              </div>


              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="pass-btn-primary"
                  onClick={() => {
                    if (!method) return
                    if (method === "card") { setStep("card") }
                    else { handlePayment() }
                  }}
                  style={{ opacity: method ? 1 : 0.5, cursor: method ? "pointer" : "not-allowed" }}
                >
                  {method === "card" ? "Enter card details →" : `Pay ${price}`}
                </button>
                <button className="pass-btn-secondary" onClick={() => setStep("plan")}>← Back</button>
              </div>
            </div>
          )}


          {/* ── STEP 3b: CARD DETAILS ── */}
          {step === "card" && (
            <div className="fade-up">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Card details</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>Enter your card information</p>


              {/* Card preview */}
              <div style={{ background: "linear-gradient(135deg,#00897B,#004D40)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ fontFamily: "monospace", fontSize: 18, letterSpacing: "0.2em", marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <div>
                    <div style={{ opacity: 0.5, fontSize: 10, marginBottom: 2 }}>CARDHOLDER</div>
                    <div>{cardName || "YOUR NAME"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ opacity: 0.5, fontSize: 10, marginBottom: 2 }}>EXPIRES</div>
                    <div>{expiry || "MM/YY"}</div>
                  </div>
                </div>
              </div>


              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Card Number</label>
                  <input className={`pass-input${errors.cardNumber ? " pass-input-error" : ""}`} style={{ fontFamily: "monospace" }} value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} />
                  {errors.cardNumber && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.cardNumber}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Cardholder Name</label>
                  <input className={`pass-input${errors.cardName ? " pass-input-error" : ""}`} value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="JOHN SMITH" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }} />
                  {errors.cardName && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.cardName}</p>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Expiry Date</label>
                    <input className={`pass-input${errors.expiry ? " pass-input-error" : ""}`} style={{ fontFamily: "monospace" }} value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} />
                    {errors.expiry && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.expiry}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>CVV</label>
                    <input className={`pass-input${errors.cvv ? " pass-input-error" : ""}`} style={{ fontFamily: "monospace" }} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" maxLength={4} type="password" />
                    {errors.cvv && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.cvv}</p>}
                  </div>
                </div>


                <div style={{ background: "rgba(0,137,123,0.1)", border: "1px solid rgba(0,137,123,0.3)", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#00897B" }}>{price}</span>
                </div>
              </div>


              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                <button className="pass-btn-primary" onClick={handlePayment}>
                  Pay {price} — Activate Pass
                </button>
                <button className="pass-btn-secondary" onClick={() => setStep("payment")}>← Back</button>
              </div>
            </div>
          )}


          {/* ── PROCESSING ── */}
          {step === "processing" && (
            <div className="fade-up" style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px" }}>
                <svg style={{ animation: "spin 1s linear infinite", position: "absolute", inset: 0 }} width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="rgba(0,137,123,0.2)" strokeWidth="6"/>
                  <path d="M40 4 A36 36 0 0 1 76 40" stroke="#00897B" strokeWidth="6" strokeLinecap="round"/>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#00897B">
                    <path d="M8.907 5.008L10.404 9.282L15.065 9.364L11.731 5.659C11.349 5.278 10.98 4.973 10.657 5.002H8.907V5.008Z"/>
                    <path d="M1 8.154H2.597C3.583 8.512 4.158 9.458 4.599 10.508H20.719C23.572 11.095 23.871 12.921 20.919 13.467H16.31L11.72 18.95C11.379 19.279 11.033 19.502 10.692 19.555H8.908L10.962 13.461L4.452 13.496C3.501 13.379 2.72 12.557 2.01 11.412L1 8.154Z"/>
                  </svg>
                </div>
              </div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Processing payment</h2>
              <p className="shimmer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 28 }}>{processingMsg}</p>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 6, overflow: "hidden", margin: "0 auto", maxWidth: 280 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#00897B,#4ade80)", borderRadius: 999, width: `${processingProgress}%`, transition: "width 0.8s ease" }} />
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 24 }}>Do not close this window</p>
            </div>
          )}


          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="fade-up" style={{ textAlign: "center", padding: "20px 0" }}>
              <div className="check-pop" style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>


              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>GreenWing Pass activated!</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 24 }}>Welcome to the GreenWing Pass family 🎉</p>


              <div className="glass" style={{ borderRadius: 18, padding: 20, marginBottom: 24, textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your pass</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Plan</span>
                  <span style={{ fontWeight: 600 }}>{plan === "monthly" ? "Monthly" : "Yearly"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Free flights</span>
                  <span style={{ fontWeight: 600, color: "#4ade80" }}>3 available ✈️</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Paid</span>
                  <span style={{ fontWeight: 600, color: "#00897B" }}>{price}</span>
                </div>
              </div>


              <button className="pass-btn-primary" onClick={onSuccess}>
                View my Pass →
              </button>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}

