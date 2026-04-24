import Link from "next/link"

const footerSections = [
  {
    title: "About GreenWing",
    links: [
      { label: "GreenWing Group", href: "/about" },
      { label: "Environmental impact", href: "/environmental-impact" },
      { label: "Modern slavery statement", href: "/slavery-statement" },
      { label: "Careers", href: "/careers" },
      { label: "Sustainability", href: "/sustainability" },
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Help and contacts", href: "/help" },
      { label: "Customer convenience", href: "/customer-service" },
      { label: "Accessibility and site help", href: "/accessibility" },
      { label: "Media centre", href: "/media" },
    ]
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Legal information", href: "/legal" },
      { label: "Website security", href: "/security" },
      { label: "Cookie policy", href: "/cookies" },
    ]
  },
  {
    title: "Useful information",
    links: [
      { label: "Holidays packages", href: "/holidays" },
      { label: "United Kingdom holidays", href: "/uk-holidays" },
      { label: "Flights to Indonesia", href: "/indonesia" },
      { label: "Flights", href: "/flights" },
      { label: "Greenwing.com", href: "/" },
    ]
  }
]

export default function Footer() {
  return (
    <footer className="bg-teal-600 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="font-bold mb-4">{section.title}</h4>
            <ul className="space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:underline transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-teal-500 text-sm text-center">
        © {new Date().getFullYear()} All rights reserved GreenWing
      </div>
    </footer>
  )
}