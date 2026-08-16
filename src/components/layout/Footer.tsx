import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

// Inline Instagram SVG — lucide-react does not export Instagram
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
                Luxury Bridal
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              To make every bride feel confident, beautiful, elegant, and camera-ready. Specializing in customized luxury bridal makeup.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/maha_unique_brides_23"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "About Maha Shree", href: "/about" },
                { name: "Our Services", href: "/services" },
                { name: "Portfolio Gallery", href: "/gallery" },
                { name: "Jewellery Rental", href: "/jewellery-rental" },
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
            <h4 className="font-heading text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              {[
                { name: "Bridal Packages", href: "/bridal-packages" },
                { name: "Client Testimonials", href: "/testimonials" },
                { name: "FAQ", href: "/faq" },
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
            <h4 className="font-heading text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                <span className="text-muted-foreground text-sm">
                  4/39 Alagusamuthiram<br />
                  Steel Plant, Salem<br />
                  Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <div className="flex flex-col">
                  <a href="tel:+918608194233" className="text-muted-foreground hover:text-primary text-sm transition-colors">
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
            &copy; {new Date().getFullYear()} SKM Luxury Bridal Studio. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Designed for <span className="text-foreground font-medium">Maha Shree</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
