import React from "react";
import PageHero from "../components/PageHero";
import PageCTA from "../components/PageCTA";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import {
  ClipboardCheck, Ship, Route, MapPin, Handshake,
  DollarSign, Clock, Users,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import JsonLd from "../components/JsonLd";

const steps = [
  { icon: ClipboardCheck, title: "Consultation", desc: "Free discussion about your delivery — origin, destination, timeline, any special requirements." },
  { icon: Ship, title: "Vessel Inspection", desc: "I'll review your boat's systems, safety gear, and readiness for the passage." },
  { icon: Route, title: "Route Planning", desc: "Weather windows, fuel stops, harbor entries — all planned before we leave the dock." },
  { icon: MapPin, title: "Delivery", desc: "Professional, careful transit. Regular updates along the way." },
  { icon: Handshake, title: "Handoff", desc: "Walk-through at the destination. Everything documented." },
];

export default function Deliveries() {
  return (
    <div>
      <PageMeta
        title="Vessel Deliveries – West Coast & Beyond | Brian Cline"
        description="Professional vessel delivery along the West Coast and beyond. USCG Licensed Master with extensive coastal and offshore passage experience. Free consultation."
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Vessel Deliveries - West Coast",
        "description": "Professional vessel delivery along the US West Coast and beyond. USCG Licensed Master with extensive coastal and offshore passage experience.",
        "provider": { "@id": "https://briancline.co/#marine-services" },
        "areaServed": { "@type": "Place", "name": "US West Coast" },
        "serviceType": "Vessel Delivery",
        "url": "https://briancline.co/deliveries"
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What about weather delays?", "acceptedAnswer": { "@type": "Answer", "text": "Standby rate applies when we're waiting for a safe weather window. I won't push through unsafe conditions to save money. Good route planning minimizes delays — most deliveries go smoothly." }},
          { "@type": "Question", "name": "Can I come along on the delivery?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Many owners join for all or part of the trip. It's a great way to learn your boat on a real passage. You're welcome aboard as long as you're comfortable with the conditions." }},
          { "@type": "Question", "name": "What about insurance?", "acceptedAnswer": { "@type": "Answer", "text": "I carry professional liability insurance. Your boat should be covered under your own marine insurance policy for the transit. I'll ask for a copy of your policy before departure." }},
          { "@type": "Question", "name": "What areas do you cover?", "acceptedAnswer": { "@type": "Answer", "text": "Primarily the West Coast — San Francisco Bay to Alaska, Mexico, and everything in between. Deliveries to Hawaii and through the Canal are also available." }}
        ]
      }} />
      <PageHero
        title="Vessel Deliveries"
        subtitle="Safe, professional boat delivery along the West Coast and beyond. Your boat gets there in the same condition it left — or better."
        credentials="USCG Licensed Master · Experienced offshore and coastal passages"
        cta="Plan Your Delivery"
        ctaHref="mailto:brian@briancline.co?subject=Vessel%20Delivery%20Inquiry"
      />

      {/* Process */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">The Process</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">{title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Rates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">On-Duty (Underway)</h3>
                  <p className="text-xs text-gray-500">Captain actively navigating</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Captain rate</span>
                  <span className="font-semibold">$100/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily maximum</span>
                  <span className="font-semibold">$1,200/day</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Standby</h3>
                  <p className="text-xs text-gray-500">Waiting for weather, parts, etc.</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Captain rate</span>
                  <span className="font-semibold">$50/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily maximum</span>
                  <span className="font-semibold">$600/day</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-6 p-4 bg-primary/5 border-primary/10">
            <p className="text-sm text-gray-600">
              <strong className="text-foreground">Additional costs:</strong> Fuel, provisioning, dockage, and return travel are billed at cost. Crew rates available for larger vessels or longer passages. Free initial consultation to discuss your specific needs.
            </p>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Common Questions</h2>
          <Accordion type="single" collapsible>
            {[
              { q: "What about weather delays?", a: "Standby rate applies when we're waiting for a safe weather window. I won't push through unsafe conditions to save money. That said, good route planning minimizes delays — most deliveries go smoothly." },
              { q: "Can I come along on the delivery?", a: "Absolutely. Many owners join for all or part of the trip. It's a great way to learn your boat on a real passage. You're welcome aboard as long as you're comfortable with the conditions." },
              { q: "What about insurance?", a: "I carry professional liability insurance. Your boat should be covered under your own marine insurance policy for the transit. I'll ask for a copy of your policy before departure." },
              { q: "Who makes safety decisions during the delivery?", a: "I do. As captain, I have final authority on route, timing, and go/no-go decisions. That's non-negotiable and it's for the safety of the crew and your vessel." },
              { q: "What areas do you cover?", a: "Primarily the West Coast — San Francisco Bay to Alaska, Mexico, and everything in between. I've done deliveries to Hawaii and through the Canal. Reach out with your route and I'll let you know." },
            ].map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <PageCTA
        title="Let's Plan Your Delivery"
        subtitle="Tell me where your boat is and where it needs to go."
        buttonText="Start Planning"
        href="mailto:brian@briancline.co?subject=Vessel%20Delivery%20-%20Let's%20Plan"
      />
    </div>
  );
}
