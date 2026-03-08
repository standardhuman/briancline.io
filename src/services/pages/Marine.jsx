import React from "react";
import { Link } from "react-router-dom";
import { Anchor, Sparkles, GraduationCap, Ship, ArrowRight } from "lucide-react";
import PageMeta from "../components/PageMeta";
import JsonLd from "../components/JsonLd";
import OptImage from "../components/OptImage";

const mainServices = [
  {
    to: "/hull-cleaning",
    icon: Anchor,
    title: "Hull Cleaning",
    tagline: "Subscription hull cleaning, inspections, propeller service, and item recovery.",
    cta: "Get an instant estimate",
  },
  {
    to: "/boat-detailing",
    icon: Sparkles,
    title: "Boat Detailing",
    tagline: "Wash, wax, brightwork, teak, and interior — sail and power.",
    cta: "Get a quote",
  },
  {
    to: "/sailing-lessons",
    icon: GraduationCap,
    title: "Sailing Lessons",
    tagline: "Private lessons on SF Bay — docking to offshore passage making.",
    cta: "Learn more",
  },
];

const secondaryService = {
  to: "/deliveries",
  icon: Ship,
  title: "Vessel Deliveries",
  tagline: "Professional delivery, West Coast and beyond. USCG Licensed Master.",
  cta: "Plan your delivery",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://briancline.co/#marine-services",
  "name": "Brian Cline Marine Services",
  "url": "https://briancline.co/marine",
  "description": "Professional hull cleaning, boat detailing, sailing lessons, and vessel delivery services on San Francisco Bay. Serving Berkeley Marina, Oakland, Alameda, Emeryville, Richmond, Sausalito, and San Francisco marinas.",
  "founder": {
    "@type": "Person",
    "@id": "https://briancline.co/#brian-cline",
    "name": "Brian Cline"
  },
  "areaServed": [
    { "@type": "City", "name": "Berkeley", "containedInPlace": { "@type": "State", "name": "California" } },
    { "@type": "City", "name": "Oakland" },
    { "@type": "City", "name": "Alameda" },
    { "@type": "City", "name": "Emeryville" },
    { "@type": "City", "name": "Richmond" },
    { "@type": "City", "name": "San Francisco" },
    { "@type": "City", "name": "Sausalito" }
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.8694",
    "longitude": "-122.3153"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Berkeley",
    "addressRegion": "CA",
    "postalCode": "94710",
    "addressCountry": "US"
  },
  "telephone": "+1-510-277-4855",
  "priceRange": "$$",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Marine Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Hull Cleaning",
          "url": "https://briancline.co/hull-cleaning"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Boat Detailing",
          "url": "https://briancline.co/boat-detailing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Sailing Lessons",
          "url": "https://briancline.co/sailing-lessons"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Vessel Deliveries",
          "url": "https://briancline.co/deliveries"
        }
      }
    ]
  }
};

function ServiceCard({ to, icon: Icon, title, tagline, cta, secondary = false }) {
  return (
    <Link
      to={to}
      className={`group block rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-200 hover:border-gray-300 hover:shadow-lg ${
        secondary ? "" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`font-bold text-foreground mb-2 ${secondary ? "text-lg" : "text-xl md:text-2xl"}`}>
            {title}
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
            {tagline}
          </p>
          <span className="inline-flex items-center gap-1.5 text-primary font-medium text-sm group-hover:gap-2.5 transition-all">
            {cta}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Marine() {
  return (
    <div>
      <PageMeta
        title="Marine Services on San Francisco Bay | Brian Cline"
        description="Hull cleaning, boat detailing, sailing lessons, and vessel deliveries on San Francisco Bay. USCG Licensed Master and US Sailing Cruising Instructor with nearly 20 years on the water."
      />
      <JsonLd data={localBusinessSchema} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0f7fa] via-white to-[#e3f2fd]">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#80deea] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#90caf9] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Marine Services on San Francisco Bay
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl">
                Professional hull cleaning, boat detailing, private sailing instruction, and vessel deliveries. Serving marinas across the Bay Area.
              </p>
              <p className="text-sm text-gray-500">
                USCG Licensed Master · US Sailing Cruising Instructor · Nearly 20 years on San Francisco Bay
              </p>
            </div>
            <div className="hidden md:flex justify-center">
              <OptImage
                src="/images/sailorskills-action.png"
                alt="Brian Cline at the helm in Berkeley Marina"
                className="rounded-2xl shadow-xl max-h-[400px] w-auto object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid gap-6">
            {/* Three main services */}
            {mainServices.map((service) => (
              <ServiceCard key={service.to} {...service} />
            ))}

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Also available</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Secondary service */}
            <ServiceCard {...secondaryService} secondary />
          </div>
        </div>
      </section>

      {/* Credentials bar */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">20 years</p>
              <p className="text-sm text-gray-500">on San Francisco Bay</p>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-300" />
            <div>
              <p className="text-2xl font-bold text-foreground">USCG Master</p>
              <p className="text-sm text-gray-500">Licensed Captain</p>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-300" />
            <div>
              <p className="text-2xl font-bold text-foreground">US Sailing</p>
              <p className="text-sm text-gray-500">Cruising Instructor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary to-[#0097a7] rounded-2xl p-10 md:p-14 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
            <p className="text-white/80 mb-8 text-lg">
              Reach out anytime. I'm happy to talk through what your boat needs.
            </p>
            <a
              href="mailto:brian@briancline.co?subject=Marine%20Services%20Inquiry"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-lg"
            >
              Contact Brian
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
