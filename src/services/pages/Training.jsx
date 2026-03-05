import React from "react";
import PageHero from "../components/PageHero";
import PageCTA from "../components/PageCTA";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  GraduationCap, Compass, Anchor, Radio, Navigation,
  ShieldCheck, BookOpen, User, Ship, LifeBuoy, Quote,
} from "lucide-react";
import PageMeta from "../components/PageMeta";

const skills = [
  { icon: Anchor, label: "Line Handling & Docking" },
  { icon: LifeBuoy, label: "Emergency Procedures" },
  { icon: Navigation, label: "Navigation & Chart Work" },
  { icon: Radio, label: "VHF Communications" },
  { icon: Ship, label: "Singlehanding" },
  { icon: Compass, label: "Seamanship & Local Knowledge" },
];

const testimonials = [
  {
    name: "Emily Richards",
    title: "Film Producer",
    image: "/images/training/emily.jpg",
    quote: "Brian is an adaptive teacher who meets you exactly where you are. He has a knack for making complex concepts click, and his patience is extraordinary. I went from nervous to confident in just a few sessions.",
  },
  {
    name: "Evan McDonald",
    title: "Three-time Bay Area Multihull Champion",
    image: "/images/training/evan.jpg",
    quote: "Brian builds confidence through understanding. He doesn't just teach you what to do — he teaches you why, which makes all the difference when you're out on your own.",
  },
  {
    name: "Aimee P",
    title: "Adult Educator",
    image: "/images/training/aimee.png",
    quote: "The most patient teacher I've ever had. Brian creates a safe space to learn, ask questions, and make mistakes. I never felt rushed or judged. Just supported.",
  },
];

export default function Training() {
  return (
    <div>
      <PageMeta title="Sailing Lessons | $72/hr | San Francisco Bay | Brian Cline" description="Private one-on-one sailing lessons on your boat. $72/hr. USCG Master, US Sailing Cruising Instructor, 20+ years experience." />
      <PageHero
        title="Private Sailing Lessons"
        subtitle="One-on-one instruction on your boat, tailored to your goals. No group classes, no strangers — just you, your boat, and 20+ years of experience."
        price="$72/hr"
        credentials="USCG Licensed Master · US Sailing Cruising Instructor · 20+ years"
        cta="Book a Free Consultation"
        ctaHref="mailto:brian@briancline.co?subject=Sailing%20Lessons%20-%20Free%20Consultation"
      />

      {/* The Approach */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Your Boat. Your Goals.</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Every lesson happens on your boat, in your slip, on the water you actually sail. No classrooms, no shared boats with strangers. You learn the systems you'll actually use.
                </p>
                <p>
                  I teach you to think through situations, not just follow a checklist. That means you'll handle the unexpected — an engine that won't start, a sudden wind shift, a tight dock under pressure — because you understand what's happening, not just what to do.
                </p>
                <p>
                  Singlehanding is part of every lesson plan. Even if you usually sail with crew, knowing you can handle the boat alone changes everything about your confidence on the water.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/training/brian-sailing.jpg"
                alt="Brian teaching on San Francisco Bay"
                className="rounded-2xl shadow-lg max-h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Skills Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map(({ icon: Icon, label }) => (
              <Card key={label} className="p-5 flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground text-sm">{label}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <Quote className="w-6 h-6 text-primary/30 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.title}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">What's Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: User, title: "Free Consultation", desc: "We'll talk through your experience, goals, and what you want to get out of lessons." },
              { icon: ShieldCheck, title: "Vessel Inspection", desc: "Before your first lesson, I'll look over your boat's safety gear and systems." },
              { icon: GraduationCap, title: "Satisfaction Guarantee", desc: "If a lesson doesn't meet your expectations, I'll make it right." },
              { icon: BookOpen, title: "Online Resources", desc: "Access to reference materials and guides between sessions." },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center p-6">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        title="Schedule Your Free Consultation"
        subtitle="Tell me about your boat and what you'd like to learn. No obligation."
        buttonText="Get Started"
        href="mailto:brian@briancline.co?subject=Sailing%20Lessons%20-%20Free%20Consultation"
      />
    </div>
  );
}
