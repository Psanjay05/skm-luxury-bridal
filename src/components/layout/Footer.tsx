import Link from "next/link";
import { MapPin, Phone, Mail, Award, Plane } from "lucide-react";

// Inline Instagram SVG
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary/5 border-t border-primary/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-3xl tracking-wider text-primary font-bold block">
                SKM
              </span>
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-foreground">
                Luxury Bridal Studio
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Certified Professional MUA studio by lead artist <strong className="text-foreground">Maha Shree</strong>. Specialized in HD & Airbrush Bridal Makeup, Mehendi, Saree Pre-pleating, and Antique Jewellery Rental.
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Award size={14} className="text-primary shrink-0" />
                <span>Certified Professional MUA 🎓</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Plane size={14} className="text-primary shrink-0" />
                <span>Salem Base | Open to Travel ✈️</span>
              </div>
            </div>

            {/* Instagram Link Widget */}
            <a
              href="https://www.instagram.com/maha_unique_brides_23"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
              <InstagramIcon size={16} /> @maha_unique_brides_23
            </a>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-foreground font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "About Maha Shree", href: "/about" },
                { name: "Signature Services", href: "/services" },
                { name: "Real Bride Portfolio", href: "/gallery" },
                { name: "Jewellery Rental Catalog", href: "/jewellery-rental" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-foreground font-semibold">Bridal Packages</h4>
            <ul className="space-y-3">
              {[
                { name: "Packages & Customizer", href: "/bridal-packages" },
                { name: "Bride Reviews & Stories", href: "/testimonials" },
                { name: "Frequently Asked Questions", href: "/faq" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms & Conditions", href: "/terms" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-foreground font-semibold">Studio & Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                <span className="text-muted-foreground text-sm">
                  4/39 Alagusamuthiram<br />
                  Near Steel Plant, Salem<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <div className="flex flex-col">
                  <a href="tel:+918608194233" className="text-muted-foreground hover:text-primary text-sm transition-colors font-medium">
                    +91 8608194233
                  </a>
                  <a href="https://wa.me/918973587806" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    +91 8973587806 (WhatsApp)
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={18} />
                <a href="mailto:Mahashreesanjeevi48@gmail.com" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Mahashreesanjeevi48@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} SKM Luxury Bridal Studio (Salem Makeover Artistry). All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Founder & Artist: <span className="text-foreground font-semibold">Maha Shree</span> (@mahsri_sanjeev_23)
          </p>
        </div>
      </div>
    </footer>
  );
}
