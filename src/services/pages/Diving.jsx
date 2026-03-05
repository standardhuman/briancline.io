import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { cn, formatCurrency } from "../lib/utils";
import { calculateEstimate, RATES } from "../lib/diving-calculator";
import PageMeta from "../components/PageMeta";

// ── Options ──
const BOAT_TYPES = [
  { value: "sailboat", label: "Sailboat", icon: "⛵" },
  { value: "powerboat", label: "Powerboat", icon: "🚤", badge: "+25%" },
  { value: "catamaran", label: "Catamaran", icon: "🛥️", badge: "+25%" },
  { value: "trimaran", label: "Trimaran", icon: "🚢", badge: "+50%" },
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly", desc: "Every month" },
  { value: "bimonthly", label: "Bi-monthly", desc: "Every 2 months" },
  { value: "quarterly", label: "Quarterly", desc: "Every 3 months" },
  { value: "onetime", label: "One-Time", desc: "Single service" },
];

const PROPELLERS = [
  { value: 1, label: "1", desc: "Standard" },
  { value: 2, label: "2", desc: "+10%" },
  { value: 3, label: "3", desc: "+20%" },
];

const PAINT_AGES = [
  { value: "<6mo", label: "< 6 months", desc: "Fresh paint" },
  { value: "6-12mo", label: "6–12 months" },
  { value: "1-1.5yr", label: "1–1.5 years" },
  { value: "1.5-2yr", label: "1.5–2 years" },
  { value: "2+yr", label: "2+ years" },
];

const LAST_CLEANED = [
  { value: "<2", label: "< 2 months" },
  { value: "2-4", label: "2–4 months" },
  { value: "5-6", label: "5–6 months" },
  { value: "7-8", label: "7–8 months" },
  { value: "9-12", label: "9–12 months" },
  { value: "13-24", label: "1–2 years" },
  { value: "24+", label: "2+ years" },
];

const FAQS = [
  {
    q: "How long does a hull cleaning take?",
    a: "Most boats take 30–90 minutes depending on size and growth level. A 35-foot sailboat with light growth is typically done in about 45 minutes.",
  },
  {
    q: "What if my boat has heavy growth?",
    a: "Heavy or severe growth adds a surcharge because it takes significantly more time and effort. The estimator above factors this in based on your paint age and last cleaning date. After the initial cleaning, growth surcharges drop significantly with regular service.",
  },
  {
    q: "Do you service catamarans and trimarans?",
    a: "Yes. Multi-hull vessels have more surface area, which is reflected in the surcharge. The cleaning process is the same — every hull gets the same attention.",
  },
  {
    q: "What areas do you serve?",
    a: "I service marinas throughout San Francisco Bay — Richmond, Berkeley, Emeryville, Sausalito, San Francisco, and the South Bay. Not sure if I cover your marina? Just ask.",
  },
  {
    q: "How do I schedule a recurring service?",
    a: "Click 'Get Started' above and select your preferred frequency. You'll pick a date and we'll set up your recurring schedule. You can pause or cancel anytime.",
  },
];

// ── Selector Button ──
function OptionButton({ selected, onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border-2 text-center transition-all duration-200",
        selected
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-gray-200 bg-white hover:border-gray-300 text-gray-600",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Input Card wrapper ──
function InputCard({ icon, title, description, children }) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── Estimate Card ──
function EstimateCard({ estimate, boatLength, boatType, frequency }) {
  const freqParam = frequency === "onetime" ? "one_time" : frequency;
  const orderUrl = `https://marketplace.sailorskills.com/order?length=${boatLength}&type=${boatType}&frequency=${freqParam}`;

  return (
    <div>
      <Card className="bg-gradient-to-br from-[#1565c0] to-[#0097a7] text-white border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white/90">Your Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-5xl font-bold">
              {formatCurrency(estimate.total)}
            </div>
            <div className="text-white/70 text-sm mt-1">
              {estimate.isOneTime ? "one-time service" : "per service"}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
            {estimate.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="text-white/70">{item.label}</span>
                <span className="text-right whitespace-nowrap">
                  {item.detail && <span className="text-white/50 mr-2">{item.detail}</span>}
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            {estimate.minimumApplied && (
              <div className="flex justify-between text-amber-300">
                <span>Minimum charge applied</span>
                <span>{formatCurrency(RATES.minimum)}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(estimate.total)}</span>
            </div>
          </div>

          <Button asChild className="w-full bg-white text-primary-700 hover:bg-gray-100 h-12 text-lg font-semibold rounded-xl">
            <a href={orderUrl} className="flex items-center justify-center gap-2">
              Get Started <span aria-hidden>→</span>
            </a>
          </Button>

          <p className="text-xs text-white/60 text-center">
            Questions? Call us at (510) 277-4855
          </p>
        </CardContent>
      </Card>

      {/* About our pricing */}
      <Card className="mt-4 border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">About our pricing</p>
              <ul className="space-y-1 text-xs">
                <li>• Heavy marine growth may add 50%</li>
                <li>• Severe growth may add 100%+</li>
                <li>• Includes basic inspection report</li>
                <li>• Before/after video included</li>
              </ul>
              <a
                href="#services-info"
                className="inline-block mt-2 text-xs text-primary-600 font-medium hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("services-info")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See what's included in every service →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──
export default function Diving() {
  const [boatLength, setBoatLength] = useState(35);
  const [boatType, setBoatType] = useState("sailboat");
  const [frequency, setFrequency] = useState("monthly");
  const [propellerCount, setPropellerCount] = useState(1);
  const [paintAge, setPaintAge] = useState("<6mo");
  const [lastCleaned, setLastCleaned] = useState("<2");
  const [anodeCount, setAnodeCount] = useState(0);

  const estimate = useMemo(
    () => calculateEstimate({ boatLength, boatType, frequency, propellerCount, paintAge, lastCleaned, anodeCount }),
    [boatLength, boatType, frequency, propellerCount, paintAge, lastCleaned, anodeCount]
  );

  return (
    <div>
      <PageMeta
        title="Hull Cleaning Cost Estimator | San Francisco Bay | Brian Cline"
        description="Get an instant hull cleaning quote. Professional diving services on San Francisco Bay from $4.49/ft. Transparent pricing based on your boat's specs."
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-sky-50 px-6 pt-10 pb-14 mb-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-sky-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-600 mb-4">
            <span className="text-3xl">🧮</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hull Cleaning Cost Estimator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get an instant quote for professional hull cleaning services. Our pricing is transparent and based on your boat's specifications.
          </p>
        </div>
      </div>

      {/* Two-column estimator */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Input cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. Boat Length */}
            <InputCard icon="📏" title="Boat Length" description="Enter your boat's length in feet (LOA)">
              <div className="flex items-center gap-4">
                <Input
                  type="number" min={15} max={150}
                  value={boatLength}
                  onChange={(e) => setBoatLength(Math.max(15, Math.min(150, parseInt(e.target.value) || 15)))}
                  className="w-24 h-12 text-xl font-semibold text-center"
                />
                <span className="text-gray-500">feet</span>
                <input
                  type="range" min={15} max={100}
                  value={Math.min(boatLength, 100)}
                  onChange={(e) => setBoatLength(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </InputCard>

            {/* 2. Boat Type */}
            <InputCard icon="⛵" title="Boat Type" description="Select your vessel type">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BOAT_TYPES.map((t) => (
                  <OptionButton key={t.value} selected={boatType === t.value} onClick={() => setBoatType(t.value)}>
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="font-medium text-sm">{t.label}</div>
                    {t.badge && <div className="text-xs text-teal-600 font-medium mt-0.5">{t.badge}</div>}
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 3. Service Frequency */}
            <InputCard icon="📅" title="Service Frequency" description="How often do you need hull cleaning?">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FREQUENCIES.map((f) => (
                  <OptionButton key={f.value} selected={frequency === f.value} onClick={() => setFrequency(f.value)}>
                    <div className="font-semibold text-sm">{f.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 4. Propellers */}
            <InputCard icon="⚙️" title="Propellers" description="First propeller included. Additional propellers add 10% each.">
              <div className="flex gap-3">
                {PROPELLERS.map((p) => (
                  <OptionButton key={p.value} selected={propellerCount === p.value} onClick={() => setPropellerCount(p.value)} className="w-20">
                    <div className="text-xl font-bold">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.desc}</div>
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 5. Bottom Paint Age */}
            <InputCard icon="🎨" title="Bottom Paint Age" description="Paint condition affects marine growth estimates.">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PAINT_AGES.map((p) => (
                  <OptionButton key={p.value} selected={paintAge === p.value} onClick={() => setPaintAge(p.value)}>
                    <div className="font-medium text-sm">{p.label}</div>
                    {p.desc && <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>}
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 6. Last Cleaned */}
            <InputCard icon="🕐" title="Last Cleaned" description="Longer gaps between cleanings may increase marine growth surcharges.">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LAST_CLEANED.map((c) => (
                  <OptionButton key={c.value} selected={lastCleaned === c.value} onClick={() => setLastCleaned(c.value)}>
                    <div className="font-medium text-sm">{c.label}</div>
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 7. Anodes */}
            <InputCard icon="🔩" title="Anode Service" description="$15 per anode installation (labor only — anode parts additional)">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAnodeCount(Math.max(0, anodeCount - 1))}
                  className="w-11 h-11 rounded-xl border-2 border-gray-200 text-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="text-3xl font-bold w-10 text-center">{anodeCount}</span>
                <button
                  onClick={() => setAnodeCount(Math.min(10, anodeCount + 1))}
                  className="w-11 h-11 rounded-xl border-2 border-gray-200 text-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">anodes</span>
              </div>
            </InputCard>
          </div>

          {/* Right: Sticky estimate */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <EstimateCard
                estimate={estimate}
                boatLength={boatLength}
                boatType={boatType}
                frequency={frequency}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support section */}
      <section id="services-info" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* How It Works */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</span>
                  <div><strong className="text-foreground">Get Your Estimate</strong> — Use the calculator above</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">2</span>
                  <div><strong className="text-foreground">Schedule Service</strong> — Pick a date that works</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">3</span>
                  <div><strong className="text-foreground">We Dive</strong> — Professional cleaning with before/after documentation</div>
                </li>
              </ol>
            </Card>

            {/* What's Included */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">What's Included</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Complete hull scrub</li>
                <li>✓ Running gear inspection</li>
                <li>✓ Before/after GoPro video</li>
                <li>✓ Digital service report</li>
                <li>✓ Zinc anode inspection</li>
              </ul>
            </Card>

            {/* FAQ */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">FAQ</h3>
              <Accordion type="single" collapsible className="text-sm">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-sm text-left py-2">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-xs leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
