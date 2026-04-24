"use client"


import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import GreenWingPassCTA from "@modules/layout/components/greenwin-pass-cta"
import FlightTrendingGallery from "@modules/flights/components/flight-trending-gallery"
import { getTranslation } from "@lib/util/translations"


// Типи для пропсів
type HelpClientProps = {
  currentLocale: string | null
}


// Типи для blog posts
interface BlogPostContent {
  intro?: string
  paragraphs?: string[]
  keyTakeaways?: {
    title: string
    points: string[]
  }
  additionalSections?: {
    title: string
    paragraphs: string[]
  }[]
}


interface BlogPost {
  id: number
  title: string
  description: string
  content: BlogPostContent
  image: string
  imageLarge: string
}


export default function HelpClient({ currentLocale }: HelpClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)


  // Функція для перекладів з fallback на оригінальний текст
  const t = (key: string, defaultValue: string) => {
    const translation = getTranslation(currentLocale, key)
    return translation || defaultValue
  }


  // Blog Posts / Articles data - ЗАЛИШАЄМО ВСІ 12 СТАТЕЙ ЯК БУЛО
  const blogPosts = useMemo((): BlogPost[] => [
    {
      "id": 1,
      "title": t("help.article1.title", "What happens after I complete a payment?"),
      "description": t("help.article1.description", "Step-by-step explanation of what happens once your payment is successful."),
      "content": {
        "intro": t("help.article1.content.intro", "After you complete a payment, our system automatically verifies the transaction and confirms your booking."),
        "paragraphs": [
          t("help.article1.content.para1", "You'll be redirected back to our platform once the payment is processed. This usually takes just a few seconds."),
          t("help.article1.content.para2", "As soon as we receive confirmation from the payment provider, your booking status will update and a confirmation email will be sent to you.")
        ],
        "keyTakeaways": {
          "title": t("help.article1.keyTakeaways.title", "What to expect"),
          "points": [
            t("help.article1.keyTakeaways.point1", "Automatic payment verification"),
            t("help.article1.keyTakeaways.point2", "Instant booking confirmation"),
            t("help.article1.keyTakeaways.point3", "Email confirmation sent right away"),
            t("help.article1.keyTakeaways.point4", "No manual action required")
          ]
        }
      },
      "image": "https://plus.unsplash.com/premium_photo-1682503147228-25f40121574e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI0fHx8ZW58MHx8fHx8",
      "imageLarge": "https://plus.unsplash.com/premium_photo-1682503147228-25f40121574e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI0fHx8ZW58MHx8fHx8"
    },
    {
      "id": 2,
      "title": t("help.article2.title", "Payment completed but booking not confirmed"),
      "description": t("help.article2.description", "What to do if your payment went through but you don't see a confirmation."),
      "content": {
        "intro": t("help.article2.content.intro", "Sometimes payment confirmation can take a little longer than expected. Don't worry — your money is safe."),
        "paragraphs": [
          t("help.article2.content.para1", "In rare cases, there may be a delay between the payment provider and our system."),
          t("help.article2.content.para2", "If your booking is not confirmed within 15 minutes, we recommend checking your email (including spam folder).")
        ],
        "keyTakeaways": {
          "title": t("help.article2.keyTakeaways.title", "Recommended actions"),
          "points": [
            t("help.article2.keyTakeaways.point1", "Wait up to 15 minutes"),
            t("help.article2.keyTakeaways.point2", "Check your email inbox and spam"),
            t("help.article2.keyTakeaways.point3", "Avoid retrying payment immediately"),
            t("help.article2.keyTakeaways.point4", "Contact support if the issue persists")
          ]
        }
      },
      "image": "https://plus.unsplash.com/premium_photo-1681923752435-5231d83efbf2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGF5bWVudCUyMGZhaWxlZHxlbnwwfHwwfHx8MA%3D%3D",
      "imageLarge": "https://plus.unsplash.com/premium_photo-1681923752435-5231d83efbf2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGF5bWVudCUyMGZhaWxlZHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      "id": 3,
      "title": t("help.article3.title", "Why was my payment declined?"),
      "description": t("help.article3.description", "Common reasons why payments fail and how to fix them."),
      "content": {
        "intro": t("help.article3.content.intro", "Payment failures are usually related to your bank or card provider, not our platform."),
        "paragraphs": [
          t("help.article3.content.para1", "Your bank may block a transaction for security reasons, especially for international payments."),
          t("help.article3.content.para2", "Insufficient funds, incorrect card details, or expired cards are also common causes.")
        ],
        "keyTakeaways": {
          "title": t("help.article3.keyTakeaways.title", "Most common reasons"),
          "points": [
            t("help.article3.keyTakeaways.point1", "Bank security restrictions"),
            t("help.article3.keyTakeaways.point2", "Incorrect card details"),
            t("help.article3.keyTakeaways.point3", "Expired or blocked card"),
            t("help.article3.keyTakeaways.point4", "Insufficient balance")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1629119882640-7121fa4cfc64?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VGhlJTIwYmFuayUyMGRpZCUyMG5vdCUyMGNvbmZpcm0lMjB0aGUlMjBwYXltZW50LnxlbnwwfHwwfHx8MA%3D%3D",
      "imageLarge": "https://images.unsplash.com/photo-1629119882640-7121fa4cfc64?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VGhlJTIwYmFuayUyMGRpZCUyMG5vdCUyMGNvbmZpcm0lMjB0aGUlMjBwYXltZW50LnxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      "id": 4,
      "title": t("help.article4.title", "How membership works on our platform"),
      "description": t("help.article4.description", "Everything you need to know about membership and processing times."),
      "content": {
        "intro": t("help.article4.content.intro", "membership eligibility depends on the airline, rental provider, or property you booked with."),
        "paragraphs": [
          t("help.article4.content.para1", "If your booking is refundable, we'll process the membership as soon as the provider confirms it."),
          t("help.article4.content.para2", "membership usually take 5–10 business days to appear on your account, depending on your bank.")
        ],
        "keyTakeaways": {
          "title": t("help.article4.keyTakeaways.title", "membership basics"),
          "points": [
            t("help.article4.keyTakeaways.point1", "membership follow provider policies"),
            t("help.article4.keyTakeaways.point2", "Processing starts immediately after approval"),
            t("help.article4.keyTakeaways.point3", "Funds return to original payment method"),
            t("help.article4.keyTakeaways.point4", "Bank processing times may vary")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1565688842882-e0b2693d349a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVtYmVyc2hpcHxlbnwwfHwwfHx8MA%3D%3D",
      "imageLarge": "https://images.unsplash.com/photo-1565688842882-e0b2693d349a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVtYmVyc2hpcHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      "id": 5,
      "title": t("help.article5.title", "How membership payments work"),
      "description": t("help.article5.description", "Clear explanation of our membership model and billing cycle."),
      "content": {
        "intro": t("help.article5.content.intro", "Our membership is designed for frequent travelers who want predictable pricing and flexibility."),
        "paragraphs": [
          t("help.article5.content.para1", "With an active membership, you get access to three free flights covered by your monthly fee."),
          t("help.article5.content.para2", "The membership renews automatically each month and cannot be canceled before one year.")
        ],
        "keyTakeaways": {
          "title": t("help.article5.keyTakeaways.title", "Membership essentials"),
          "points": [
            t("help.article5.keyTakeaways.point1", "Monthly fixed payment"),
            t("help.article5.keyTakeaways.point2", "Includes 3 flights"),
            t("help.article5.keyTakeaways.point3", "Applies to flights only"),
            t("help.article5.keyTakeaways.point4", "Minimum commitment: 1 year")
          ]
        }
      },
      "image": "https://plus.unsplash.com/premium_photo-1679830513873-5f9163fcc04a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGxhbmV8ZW58MHx8MHx8fDA%3D",
      "imageLarge": "https://plus.unsplash.com/premium_photo-1679830513873-5f9163fcc04a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGxhbmV8ZW58MHx8MHx8fDA%3D"
    },
    {
      "id": 6,
      "title": t("help.article6.title", "Can I cancel my Membership?"),
      "description": t("help.article6.description", "Important information about membership cancellation rules."),
      "content": {
        "intro": t("help.article6.content.intro", "We believe in transparency, so it's important to understand membership commitments upfront."),
        "paragraphs": [
          t("help.article6.content.para1", "membership cannot be canceled during the first year of activation."),
          t("help.article6.content.para2", "After the one-year period, you can cancel anytime from your account settings.")
        ],
        "keyTakeaways": {
          "title": t("help.article6.keyTakeaways.title", "Cancellation rules"),
          "points": [
            t("help.article6.keyTakeaways.point1", "No cancellation in first year"),
            t("help.article6.keyTakeaways.point2", "Cancel anytime after 12 months"),
            t("help.article6.keyTakeaways.point3", "No hidden fees"),
            t("help.article6.keyTakeaways.point4", "Clear terms before activation")
          ]
        }
      },
      "image": "http://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TWVtYmVyc2hpcHxlbnwwfHwwfHx8MA%3D%3D",
      "imageLarge": "http://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TWVtYmVyc2hpcHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      "id": 7,
      "title": t("help.article7.title", "What if my flight is canceled by the airline?"),
      "description": t("help.article7.description", "Your options when airlines cancel or change flights."),
      "content": {
        "intro": t("help.article7.content.intro", "Airline cancellations happen, and we're here to help you navigate the next steps."),
        "paragraphs": [
          t("help.article7.content.para1", "In most cases, airlines offer a refund or rebooking option."),
          t("help.article7.content.para2", "We'll notify you as soon as we receive an update from the airline.")
        ],
        "keyTakeaways": {
          "title": t("help.article7.keyTakeaways.title", "If your flight is canceled"),
          "points": [
            t("help.article7.keyTakeaways.point1", "Notification via email"),
            t("help.article7.keyTakeaways.point2", "Refund or rebooking options"),
            t("help.article7.keyTakeaways.point3", "Airline policies apply"),
            t("help.article7.keyTakeaways.point4", "Support team available")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWlycG9ydHxlbnwwfHwwfHx8MA%3D%3D",
      "imageLarge": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWlycG9ydHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      "id": 8,
      "title": t("help.article8.title", "How to change or correct passenger details"),
      "description": t("help.article8.description", "Learn how name changes and corrections work."),
      "content": {
        "intro": t("help.article8.content.intro", "Passenger details must match official travel documents exactly."),
        "paragraphs": [
          t("help.article8.content.para1", "Minor corrections may be allowed depending on airline rules."),
          t("help.article8.content.para2", "Some airlines charge a fee for name changes or do not allow them at all.")
        ],
        "keyTakeaways": {
          "title": t("help.article8.keyTakeaways.title", "Passenger details"),
          "points": [
            t("help.article8.keyTakeaways.point1", "Must match ID or passport"),
            t("help.article8.keyTakeaways.point2", "Changes depend on airline"),
            t("help.article8.keyTakeaways.point3", "Fees may apply"),
            t("help.article8.keyTakeaways.point4", "Contact support early")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1655722725332-9925c96dd627?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFzc3BvcnR8ZW58MHx8MHx8fDA%3D",
      "imageLarge": "https://images.unsplash.com/photo-1655722725332-9925c96dd627?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFzc3BvcnR8ZW58MHx8MHx8fDA%3D"
    },
    {
      "id": 9,
      "title": t("help.article9.title", "Is my payment information secure?"),
      "description": t("help.article9.description", "How we protect your data and transactions."),
      "content": {
        "intro": t("help.article9.content.intro", "Security is a top priority for us."),
        "paragraphs": [
          t("help.article9.content.para1", "All payments are processed through certified payment providers."),
          t("help.article9.content.para2", "We never store your full card details on our servers.")
        ],
        "keyTakeaways": {
          "title": t("help.article9.keyTakeaways.title", "Security measures"),
          "points": [
            t("help.article9.keyTakeaways.point1", "Encrypted transactions"),
            t("help.article9.keyTakeaways.point2", "Trusted payment providers"),
            t("help.article9.keyTakeaways.point3", "No card data storage"),
            t("help.article9.keyTakeaways.point4", "Continuous monitoring")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNlY3VyaXR5fGVufDB8fDB8fHww",
      "imageLarge": "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNlY3VyaXR5fGVufDB8fDB8fHww"
    },
    {
      "id": 10,
      "title": t("help.article10.title", "Booking flights vs apartments and cars"),
      "description": t("help.article10.description", "Understanding differences between booking types."),
      "content": {
        "intro": t("help.article10.content.intro", "Each booking type follows slightly different rules and policies."),
        "paragraphs": [
          t("help.article10.content.para1", "Flight bookings are governed by airline policies."),
          t("help.article10.content.para2", "Apartments and car rentals follow partner-specific terms.")
        ],
        "keyTakeaways": {
          "title": t("help.article10.keyTakeaways.title", "Booking differences"),
          "points": [
            t("help.article10.keyTakeaways.point1", "Flights: airline rules"),
            t("help.article10.keyTakeaways.point2", "Cars: rental provider terms"),
            t("help.article10.keyTakeaways.point3", "Apartments: host policies"),
            t("help.article10.keyTakeaways.point4", "Details shown before payment")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1614607660006-945b019c188a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZsaWdodHMlMjBhbmQlMjBjYXJzfGVufDB8fDB8fHww",
      "imageLarge": "https://images.unsplash.com/photo-1614607660006-945b019c188a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZsaWdodHMlMjBhbmQlMjBjYXJzfGVufDB8fDB8fHww"
    },
    {
      "id": 11,
      "title": t("help.article11.title", "Didn't receive your confirmation email?"),
      "description": t("help.article11.description", "What to do if your confirmation email is missing."),
      "content": {
        "intro": t("help.article11.content.intro", "Confirmation emails are sent automatically after booking."),
        "paragraphs": [
          t("help.article11.content.para1", "Email delivery can sometimes be delayed by providers."),
          t("help.article11.content.para2", "Always check your spam or promotions folder.")
        ],
        "keyTakeaways": {
          "title": t("help.article11.keyTakeaways.title", "Email tips"),
          "points": [
            t("help.article11.keyTakeaways.point1", "Check spam folder"),
            t("help.article11.keyTakeaways.point2", "Verify email address"),
            t("help.article11.keyTakeaways.point3", "Wait a few minutes"),
            t("help.article11.keyTakeaways.point4", "Contact support if needed")
          ]
        }
      },
      "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=60",
      "imageLarge": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop&q=80"
    },
    {
      "id": 12,
      "title": t("help.article12.title", "How to contact support"),
      "description": t("help.article12.description", "When and how to reach our support team."),
      "content": {
        "intro": t("help.article12.content.intro", "Our support team is here to help when you need it."),
        "paragraphs": [
          t("help.article12.content.para1", "We recommend checking the Help Center first for instant answers."),
          t("help.article12.content.para2", "If you still need assistance, contact us through your account.")
        ],
        "keyTakeaways": {
          "title": t("help.article12.keyTakeaways.title", "Support options"),
          "points": [
            t("help.article12.keyTakeaways.point1", "Help Center available 24/7"),
            t("help.article12.keyTakeaways.point2", "Fast in-platform support"),
            t("help.article12.keyTakeaways.point3", "Booking-specific assistance"),
            t("help.article12.keyTakeaways.point4", "Friendly human help")
          ]
        }
      },
      "image": "https://plus.unsplash.com/premium_photo-1665203604603-e097954797e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNvbnRhY3QlMjBzdXBwb3J0fGVufDB8fDB8fHww",
      "imageLarge": "https://plus.unsplash.com/premium_photo-1665203604603-e097954797e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNvbnRhY3QlMjBzdXBwb3J0fGVufDB8fDB8fHww"
    }
  ], [currentLocale])


  // FAQ data - ЗАЛИШАЄМО ЯК БУЛО
  const faqData = useMemo(() => [
    {
      category: t("help.faq.category1.title", "Booking & Payment"),
      questions: [
        {
          q: t("help.faq.category1.q1", "What payment methods do you accept?"),
          a: t("help.faq.category1.a1", "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and Apple Pay.")
        },
        {
          q: t("help.faq.category1.q2", "Can I change my booking?"),
          a: t("help.faq.category1.a2", "Yes, you can change your booking up to 24 hours before departure. Changes may be subject to fare differences and a change fee.")
        }
      ]
    },
    {
      category: t("help.faq.category2.title", "GreenWing Pass"),
      questions: [
        {
          q: t("help.faq.category2.q1", "What is GreenWing Pass?"),
          a: t("help.faq.category2.a1", "GreenWing Pass is a monthly subscription that lets you fly up to 3 times per year within Europe on 100% emission-free flights.")
        },
        {
          q: t("help.faq.category2.q2", "How much does it cost?"),
          a: t("help.faq.category2.a2", "GreenWing Pass costs £29.99 per month with no long-term commitment required.")
        },
        {
          q: t("help.faq.category2.q3", "Can I cancel anytime?"),
          a: t("help.faq.category2.a3", "Yes, you can cancel your subscription at any time with no cancellation fees.")
        }
      ]
    },
    {
      category: t("help.faq.category3.title", "Flights & Travel"),
      questions: [
        {
          q: t("help.faq.category3.q1", "What are your baggage allowances?"),
          a: t("help.faq.category3.a1", "Economy class: 1 cabin bag (10kg) and 1 checked bag (23kg). Business class: 2 cabin bags (20kg) and 2 checked bags (32kg each).")
        },
        {
          q: t("help.faq.category3.q2", "How early should I arrive at the airport?"),
          a: t("help.faq.category3.a2", "We recommend arriving 2 hours before departure for domestic flights and 3 hours for international flights.")
        }
      ]
    },
    {
      category: t("help.faq.category4.title", "Sustainability"),
      questions: [
        {
          q: t("help.faq.category4.q1", "How are your flights zero emission?"),
          a: t("help.faq.category4.a1", "We use sustainable aviation fuel (SAF), invest in carbon offset programs, and continuously upgrade to more efficient aircraft.")
        },
        {
          q: t("help.faq.category4.q2", "What is your environmental policy?"),
          a: t("help.faq.category4.a2", "Our environmental policy focuses on achieving net-zero emissions by 2030 through innovation, sustainable fuels, and carbon offsetting.")
        }
      ]
    }
  ], [currentLocale])




  const featuredFlights = [
    { id: "1", city: "Paris", price: "£89", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600" },
    { id: "2", city: "Barcelona", price: "£76", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600" },
    { id: "3", city: "Amsterdam", price: "£65", image: "https://images.unsplash.com/photo-1534081333815-ae5019106622?w=600" },
    { id: "4", city: "Berlin", price: "£72", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600" },
  ]


  // Filter blog posts based on search query
  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  )


  // Get selected post content
  const selectedPostData = blogPosts.find(p => p.id === selectedPost)


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="relative h-[400px] bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-400">
        <div className="absolute inset-0 opacity-90">
          <img
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600&auto=format&fit=crop"
            alt="Ocean background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 to-cyan-500/40"></div>
        </div>


        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("help.heroTitle", "How can we help you?")}
          </h1>
          <p className="text-lg text-white/90 mb-8">
            {t("help.heroSubtitle", "Search for answers or browse our help center")}
          </p>


          {/* Search Bar */}
          <div className="w-full max-w-2xl relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("help.searchPlaceholder", "Search for help articles, FAQs, or topics...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400"
            />
          </div>


          {/* Quick Links */}
          <div className="mt-6">
            {!searchQuery && (
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="px-4 py-2 bg-white/90 hover:bg-white text-teal-700 rounded-full text-sm font-medium transition shadow-sm">
                  {t("help.quickLink1", "Booking Help")}
                </button>
                <button className="px-4 py-2 bg-white/90 hover:bg-white text-teal-700 rounded-full text-sm font-medium transition shadow-sm">
                  {t("help.quickLink2", "GreenWing Pass")}
                </button>
                <button className="px-4 py-2 bg-white/90 hover:bg-white text-teal-700 rounded-full text-sm font-medium transition shadow-sm">
                  {t("help.quickLink3", "Flight Changes")}
                </button>
                <button className="px-4 py-2 bg-white/90 hover:bg-white text-teal-700 rounded-full text-sm font-medium transition shadow-sm">
                  {t("help.quickLink4", "Refunds")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Article Modal */}
      {selectedPost !== null && selectedPostData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* STICKY HEADER */}
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedPostData.title}</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition flex-shrink-0"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>


            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto flex-1">
              <div className="p-8">
                {/* LARGE IMAGE */}
                <div className="relative h-96 mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedPostData.imageLarge}
                    alt={selectedPostData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0"></div>
                </div>


                {/* CONTENT */}
                <div className="prose prose-lg max-w-none">
                  {/* INTRO */}
                  {selectedPostData.content.intro && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {selectedPostData.content.intro}
                    </p>
                  )}


                  {/* PARAGRAPHS */}
                  {selectedPostData.content.paragraphs && selectedPostData.content.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}


                  {/* KEY TAKEAWAYS */}
                  {selectedPostData.content.keyTakeaways && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                        {selectedPostData.content.keyTakeaways.title}
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {selectedPostData.content.keyTakeaways.points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </>
                  )}


                  {/* ADDITIONAL SECTIONS */}
                  {(selectedPostData.content.additionalSections || []).map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                        {section.title}
                      </h3>
                      {(section.paragraphs || []).map((paragraph, paraIdx) => (
                        <p key={paraIdx} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Search Results */}
      {searchQuery && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("help.searchResults", "Search Results for")} "{searchQuery}"
            </h2>


            {filteredPosts.length > 0 ? (
              <div>
                <h3 className="text-lg font-bold text-teal-600 mb-4">
                  {t("help.articlesCount", "Articles")} ({filteredPosts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group cursor-pointer"
                      onClick={() => setSelectedPost(post.id)}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-700/20"></div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 flex-1">{post.title}</h3>
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{post.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("help.noResultsTitle", "No results found")}
                </h3>
                <p className="text-gray-600">
                  {t("help.noResultsDescription", "Try different keywords or browse our articles below")}
                </p>
              </div>
            )}
          </div>
        </section>
      )}


      {/* Blog Posts / Articles Section */}
      {!searchQuery && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-teal-600 text-center mb-12">
              {t("help.tipsTitle", "Tips for more sustainable travel")}
            </h2>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group cursor-pointer"
                  onClick={() => setSelectedPost(post.id)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0"></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">
                        {post.title}
                      </h3>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 0C26.3888 0 34 7.61116 34 17C34 26.3888 26.3888 34 17 34C7.61116 34 0 26.3888 0 17C0 7.61116 7.61116 0 17 0ZM17 1.5C8.43959 1.5 1.5 8.43959 1.5 17C1.5 25.5604 8.43959 32.5 17 32.5C25.5604 32.5 32.5 25.5604 32.5 17C32.5 8.43959 25.5604 1.5 17 1.5ZM16.9287 9.92871C17.3191 9.53829 17.9522 9.53848 18.3428 9.92871L24.707 16.293C25.0976 16.6835 25.0976 17.3165 24.707 17.707L18.3428 24.0713C17.9522 24.4615 17.3191 24.4617 16.9287 24.0713C16.5383 23.6809 16.5385 23.0478 16.9287 22.6572L21.5859 18H10V16H21.5859L16.9287 11.3428C16.5385 10.9522 16.5383 10.3191 16.9287 9.92871Z" fill="#0A9C89" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {post.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* GreenWing Pass */}
      <GreenWingPassCTA currentLocale={currentLocale} />


      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-teal-600 text-center mb-12">
            {t("help.faqTitle", "FAQ")}
          </h2>


          <div className="space-y-4">
            {faqData.map((category, categoryIdx) => (
              <div key={categoryIdx}>
                <h3 className="text-xl font-bold text-teal-600 mb-4">{category.category}</h3>
                <div className="space-y-3 mb-8">
                  {category.questions.map((item, qIdx) => {
                    const faqIndex = categoryIdx * 100 + qIdx
                    const isOpen = openFaqIndex === faqIndex


                    return (
                      <div key={qIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : faqIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                          <svg
                            className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                        >
                          <div className="px-6 pb-4 text-gray-600">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Flights */}
      <FlightTrendingGallery
        title={t("help.featuredDestinations", "Featured destinations")}
        flights={featuredFlights}
        currentLocale={currentLocale}
      />
    </div>
  )
}

