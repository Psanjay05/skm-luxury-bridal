export type Language = "en" | "ta";

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    services: string;
    gallery: string;
    jewellery: string;
    packages: string;
    testimonials: string;
    contact: string;
    bookNow: string;
  };
  hero: {
    badge: string;
    title1: string;
    titleAccent: string;
    title2: string;
    subtitle: string;
    bookCta: string;
    portfolioCta: string;
    certifiedBadge: string;
    sweatProofBadge: string;
    jewelleryBadge: string;
  };
  booking: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    fullName: string;
    phone: string;
    email: string;
    servicePackage: string;
    eventDate: string;
    timeSlot: string;
    venueLocation: string;
    specialNotes: string;
    submitBtn: string;
    policyTitle: string;
    urgentBanner: string;
    urgentCheckBtn: string;
  };
  packages: {
    title: string;
    subtitle: string;
    builderTitle: string;
    builderSubtitle: string;
    estPrice: string;
    reserveOnline: string;
    whatsappQuote: string;
  };
  common: {
    whatsapp: string;
    callNow: string;
    getDirections: string;
    viewAll: string;
    reviews: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      gallery: "Gallery",
      jewellery: "Jewellery",
      packages: "Packages",
      testimonials: "Testimonials",
      contact: "Contact",
      bookNow: "Book Now",
    },
    hero: {
      badge: "Salem's Premier Certified MUA Studio",
      title1: "Unveiling Your",
      titleAccent: "Radiant Elegance",
      title2: "On Your Big Day",
      subtitle: "Transforming every bride into a timeless masterpiece. Certified MUA packages by Maha Shree starting from ₹999 for guest glam & ₹9,999 for bridal makeovers.",
      bookCta: "Book Consultation",
      portfolioCta: "Explore Portfolio",
      certifiedBadge: "Certified Professional MUA",
      sweatProofBadge: "Sweat-Proof HD Base",
      jewelleryBadge: "Antique Jewellery Rental",
    },
    booking: {
      title: "Reserve Your Wedding Date",
      subtitle: "Lock your special day with certified MUA Maha Shree. Fill out your wedding ceremony details below for instant slot verification.",
      step1: "1. Bride / Client Information",
      step2: "2. Choose Bridal Package or Service",
      step3: "3. Wedding Date & Event Venue",
      fullName: "Full Name *",
      phone: "WhatsApp Mobile Number *",
      email: "Email Address (Optional)",
      servicePackage: "Desired Bridal Package *",
      eventDate: "Event Date *",
      timeSlot: "Time Slot *",
      venueLocation: "Venue / City *",
      specialNotes: "Special Notes / Saree Draping / Jewellery Requests",
      submitBtn: "Submit Reservation Request",
      policyTitle: "Muhurtham Slot Lock & Cancellation Terms",
      urgentBanner: "Need Urgent Date Verification?",
      urgentCheckBtn: "Instant WhatsApp Check",
    },
    packages: {
      title: "Bridal Makeover Packages",
      subtitle: "Transparent pricing packages designed to make every bride shine on her Muhurtham and Reception nights. Custom combo packages tailored by Maha Shree.",
      builderTitle: "Build Your Custom Combo Package",
      builderSubtitle: "Select your wedding functions and optional addons to calculate instant package estimate.",
      estPrice: "Estimated Package Price",
      reserveOnline: "Reserve Online",
      whatsappQuote: "WhatsApp Quote",
    },
    common: {
      whatsapp: "WhatsApp",
      callNow: "Call Studio",
      getDirections: "Get Directions",
      viewAll: "View All",
      reviews: "Verified Reviews",
    },
  },
  ta: {
    nav: {
      home: "முகப்பு",
      about: "எங்களைப் பற்றி",
      services: "சேவைகள்",
      gallery: "புகைப்படங்கள்",
      jewellery: "நகைகள் வாடகை",
      packages: "பேக்கேஜ்கள்",
      testimonials: "மதிப்புரைகள்",
      contact: "தொடர்பு கொள்ள",
      bookNow: "முன்பதிவு செய்",
    },
    hero: {
      badge: "சேலத்தின் முன்னணி மணப்பெண் ஒப்பனை நிலையம்",
      title1: "உங்கள் திருமண நாளில்",
      titleAccent: "பேரழகு பொலியும்",
      title2: "ராஜகுமாரி தோற்றம்",
      subtitle: "மஹா ஶ்ரீயின் கைவண்ணத்தில் வியர்வைக்கு அழியாத HD மேக்கப் மற்றும் பாரம்பரிய கோயில் நகைகளுடன் ஜொலித்திடுங்கள். ஆரம்ப விலை ₹999 முதல்.",
      bookCta: "ஆலோசனை முன்பதிவு",
      portfolioCta: "மணப்பெண் அலங்காரங்கள்",
      certifiedBadge: "சான்றிதழ் பெற்ற MUA",
      sweatProofBadge: "வியர்வைக்கு அழியாத HD பேஸ்",
      jewelleryBadge: "பாரம்பரிய ஆபரணங்கள் வாடகை",
    },
    booking: {
      title: "உங்கள் திருமண தேதியை முன்பதிவு செய்யுங்கள்",
      subtitle: "சான்றிதழ் பெற்ற மணப்பெண் ஒப்பனை கலைஞர் மஹா ஶ்ரீயுடன் உங்கள் சிறப்பு தினத்தை உறுதி செய்யுங்கள்.",
      step1: "1. மணப்பெண் / வாடிக்கையாளர் விவரங்கள்",
      step2: "2. மேக்கப் பேக்கேஜ் தேர்வு",
      step3: "3. முகூர்த்த தேதி & திருமண மண்டப இடம்",
      fullName: "முழுப் பெயர் *",
      phone: "வாட்ஸ்அப் மொபைல் எண் *",
      email: "மின்னஞ்சல் முகவரி (விருப்பத்திற்குரியது)",
      servicePackage: "தேவையான பிரைடல் பேக்கேஜ் *",
      eventDate: "திருமண முகூர்த்த தேதி *",
      timeSlot: "நேரம் *",
      venueLocation: "மண்டபம் / ஊர் பெயர் *",
      specialNotes: "புடவை மடிப்பு / நகை வாடகை கோரிக்கைகள்",
      submitBtn: "முன்பதிவு கோரிக்கையை சமர்ப்பிக்கவும்",
      policyTitle: "முகூர்த்த தேதி முன்பதிவு & ரத்து விதிகள்",
      urgentBanner: "அவசர முகூர்த்த தேதி சரிபார்ப்பு தேவையா?",
      urgentCheckBtn: "வாட்ஸ்அப்பில் உடனடியாக சரிபார்க்கவும்",
    },
    packages: {
      title: "பிரைடல் மேக்கப் பேக்கேஜ்கள்",
      subtitle: "முகூர்த்தம் மற்றும் வரவேற்பு விழாக்களுக்கு ஏற்ற மிகச்சிறந்த விலை பேக்கேஜ்கள். மஹா ஶ்ரீயின் கைவண்ணத்தில் உங்கள் விருப்பத்திற்கேற்ப தேர்வு செய்யுங்கள்.",
      builderTitle: "உங்கள் தனிப்பயன் பேக்கேஜை உருவாக்குங்கள்",
      builderSubtitle: "திருமண நிகழ்வுகள் மற்றும் கூடுதல் சேவைகளைத் தேர்ந்தெடுத்து உடனடி கட்டண மதிப்பீட்டைப் பெறுங்கள்.",
      estPrice: "மதிப்பிடப்பட்ட கட்டணம்",
      reserveOnline: "ஆன்லைனில் முன்பதிவு",
      whatsappQuote: "வாட்ஸ்அப் கட்டண விவரம்",
    },
    common: {
      whatsapp: "வாட்ஸ்அப்",
      callNow: "அழைக்க",
      getDirections: "வழித்தடம்",
      viewAll: "அனைத்தும் காண்க",
      reviews: "நம்பகமான மதிப்புரைகள்",
    },
  },
};
