import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { cn, formatCurrency } from "../lib/utils";
import { calculateEstimate, RATES, SERVICES, SERVICE_VISIBILITY } from "../lib/diving-calculator";
import PageMeta from "../components/PageMeta";
import {
  Ruler, Ship, Sailboat, CalendarDays, Settings, Paintbrush, Clock, Wrench,
  Calculator, ListChecks, CheckCircle2, HelpCircle, ArrowRight, Info, Anchor
} from "lucide-react";

// ── Custom boat type icons ──
function CatamaranIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 4 C5 4, 4 12, 5 20 C5 20, 6 21, 7 20 C8 12, 7 4, 7 4 Z" />
      <path d="M17 4 C17 4, 16 12, 17 20 C17 20, 18 21, 19 20 C20 12, 19 4, 19 4 Z" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="16" x2="17" y2="16" />
    </svg>
  );
}

function TrimaranIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M11 3 C11 3, 10 12, 11 21 C11 21, 12 22, 13 21 C14 12, 13 3, 13 3 Z" />
      <path d="M4 7 C4 7, 3.5 12, 4 17 C4 17, 4.5 17.5, 5 17 C5.5 12, 5 7, 5 7 Z" />
      <path d="M19 7 C19 7, 18.5 12, 19 17 C19 17, 19.5 17.5, 20 17 C20.5 12, 20 7, 20 7 Z" />
      <line x1="5" y1="10" x2="11" y2="10" />
      <line x1="13" y1="10" x2="19" y2="10" />
      <line x1="5" y1="14" x2="11" y2="14" />
      <line x1="13" y1="14" x2="19" y2="14" />
    </svg>
  );
}

function MonohullIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      {/* Single hull — top-down view */}
      <path d="M12 2 C10 2, 9 6, 8.5 12 C9 18, 10 21, 12 22 C14 21, 15 18, 15.5 12 C15 6, 14 2, 12 2 Z" />
      {/* Centerline keel */}
      <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="2 2" strokeWidth="1" />
    </svg>
  );
}

const BOAT_TYPE_ICONS = {
  sailboat: Sailboat,
  powerboat: Ship,
  catamaran: CatamaranIcon,
  trimaran: TrimaranIcon,
};

// ── Options ──
const BOAT_TYPES = [
  { value: "sailboat", label: "Sailboat" },
  { value: "powerboat", label: "Powerboat" },
];

const HULL_TYPES = [
  { value: "monohull", label: "Monohull" },
  { value: "catamaran", label: "Catamaran" },
  { value: "trimaran", label: "Trimaran" },
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly", desc: "Every month" },
  { value: "bimonthly", label: "Bi-monthly", desc: "Every 2 months" },
  { value: "quarterly", label: "Quarterly", desc: "Every 3 months" },
  { value: "onetime", label: "One-Time", desc: "Single service" },
];

const PROPELLERS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
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

const SERVICE_LIST = [
  "cleaning",
  "underwater_inspection",
  "item_recovery",
  "propeller_service",
  "anodes_only",
];

const FAQS = [
  {
    q: "How do you rate levels of marine growth?",
    a: "We use a 5-level scale: None (clean hull, no visible growth), Minimal (light slime or algae film), Moderate (visible soft growth, some barnacle starts), Heavy (dense barnacles, mussels, or hard growth), Severe (thick multi-layer growth requiring extensive effort).",
  },
  {
    q: "How do you rate paint condition?",
    a: "Also a 5-level scale: Excellent (fresh, smooth, fully intact), Good (minor wear, still effective), Fair (noticeable wear, reduced antifouling), Poor (significant erosion, bare spots), Missing (no antifouling paint present).",
  },
  {
    q: "How does billing work?",
    a: "We bill within a week after service is completed. Any anode replacements or variable charges are included on the same invoice.",
  },
  {
    q: "Are anodes extra?",
    a: "Yes, anodes are an additional charge. You can provide your own or we'll supply them at roughly chandlery prices plus tax. There's a $15 installation fee per anode.",
  },
  {
    q: "Can you provide an estimate before beginning work?",
    a: "Yes — we're happy to stop by your boat for a quick look before your first service so there are no surprises.",
  },
  {
    q: "Do you offer a referral program?",
    a: "Yes! Refer someone who signs up for recurring service and you get a free cleaning. Your friend gets 50% off their first cleaning. No limit on referrals.",
  },
  {
    q: "What do you use to clean the bottom?",
    a: "We match tools to the type and severity of growth, using the minimum effective abrasion. If the paint needs more help than cleaning can provide, we'll recommend a haul-out.",
  },
  {
    q: "Will my paint look perfectly clean afterward?",
    a: "It depends on the paint's biocidal properties. Some algae may remain in the paint texture — removing it would damage the paint itself. We clean as thoroughly as the paint allows.",
  },
  {
    q: "How high up do you clean?",
    a: "Up to the antifouling paint line only. We don't clean unpainted surfaces below the waterline.",
  },
  {
    q: "Do you offer one-time services?",
    a: "Yes, especially useful for voyage prep or a one-off cleaning before the season.",
  },
  {
    q: "I need a cleaning before a race. Can you help?",
    a: "Absolutely. We'll schedule as close to race day as possible to give you a clean bottom when it matters most.",
  },
  {
    q: "I dropped something in the water. Can you retrieve it?",
    a: "Yes — book as a one-time service. We'll do a 20-minute search plus a 20-minute bonus search. No guarantee of recovery, but we'll do our best. Please don't disturb the bottom before we arrive.",
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
function InputCard({ icon: Icon, title, description, children, visible = true }) {
  if (!visible) return null;
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#0073a8]" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── Estimate Card ──
function EstimateCard({ estimate, boatLength, boatType, hullType, frequency, serviceKey }) {
  const navigate = useNavigate();
  const service = SERVICES[serviceKey];

  const handleGetStarted = () => {
    const freqParam = frequency === "onetime" ? "one_time" : frequency;
    navigate(`/diving/order?service=${serviceKey}&length=${boatLength}&type=${boatType}&hull=${hullType}&frequency=${freqParam}&estimate=${Math.round(estimate.total)}`);
  };

  return (
    <div>
      <Card className="bg-gradient-to-br from-[#1565c0] to-[#0097a7] text-white border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white/90">Your Estimate</CardTitle>
          <p className="text-white/60 text-sm">{service?.name}</p>
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

          <Button
            onClick={handleGetStarted}
            className="w-full bg-[#0073a8] text-white hover:bg-[#005f8a] h-12 text-lg font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
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
            <Info className="w-5 h-5 text-[#0073a8] flex-shrink-0 mt-0.5" />
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
  const [serviceKey, setServiceKey] = useState("cleaning");
  const [boatLength, setBoatLength] = useState(35);
  const [boatType, setBoatType] = useState("sailboat");
  const [hullType, setHullType] = useState("monohull");
  const [frequency, setFrequency] = useState("monthly");
  const [propellerCount, setPropellerCount] = useState(1);
  const [paintAge, setPaintAge] = useState("<6mo");
  const [lastCleaned, setLastCleaned] = useState("<2");
  const [anodeCount, setAnodeCount] = useState(0);

  const vis = SERVICE_VISIBILITY[serviceKey] || {};

  const estimate = useMemo(
    () => calculateEstimate({ serviceKey, boatLength, boatType, hullType, frequency, propellerCount, paintAge, lastCleaned, anodeCount }),
    [serviceKey, boatLength, boatType, hullType, frequency, propellerCount, paintAge, lastCleaned, anodeCount]
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
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Diving Services Estimator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get an instant quote for professional diving services. Our pricing is transparent and based on your boat's specifications.
          </p>
        </div>
      </div>

      {/* Two-column estimator */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Input cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* 0. Service Type */}
            <InputCard icon={Anchor} title="Service Type" description="Select the service you need">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICE_LIST.map((key) => {
                  const svc = SERVICES[key];
                  return (
                    <OptionButton
                      key={key}
                      selected={serviceKey === key}
                      onClick={() => setServiceKey(key)}
                    >
                      <div className="font-medium text-sm leading-tight">{svc.name}</div>
                    </OptionButton>
                  );
                })}
              </div>
            </InputCard>

            {/* 1. Boat Length */}
            <InputCard icon={Ruler} title="Boat Length" description="Use the length from your boat's model name (e.g. Dana 24 = 24, Islander 36 = 36)" visible={vis.boatLength}>
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

            {/* 2. Boat Type (sail vs power) */}
            <InputCard icon={Ship} title="Boat Type" description="Sail or power?" visible={vis.boatType}>
              <div className="grid grid-cols-2 gap-3">
                {BOAT_TYPES.map((t) => {
                  const IconComp = BOAT_TYPE_ICONS[t.value];
                  return (
                    <OptionButton key={t.value} selected={boatType === t.value} onClick={() => setBoatType(t.value)}>
                      <IconComp className="w-8 h-8 mx-auto mb-1 text-[#0073a8]" />
                      <div className="font-medium text-sm">{t.label}</div>
                    </OptionButton>
                  );
                })}
              </div>
            </InputCard>

            {/* 2b. Hull Type (mono/cat/tri) */}
            <InputCard icon={Anchor} title="Hull Type" description="Select your hull configuration" visible={vis.boatType}>
              <div className="grid grid-cols-3 gap-3">
                {HULL_TYPES.map((h) => {
                  const IconComp = h.value === "catamaran" ? CatamaranIcon : h.value === "trimaran" ? TrimaranIcon : MonohullIcon;
                  return (
                    <OptionButton key={h.value} selected={hullType === h.value} onClick={() => setHullType(h.value)}>
                      <IconComp className="w-8 h-8 mx-auto mb-1 text-[#0073a8]" />
                      <div className="font-medium text-sm">{h.label}</div>
                    </OptionButton>
                  );
                })}
              </div>
            </InputCard>

            {/* 3. Service Frequency (recurring only) */}
            <InputCard icon={CalendarDays} title="Service Frequency" description="How often do you need hull cleaning?" visible={vis.frequency}>
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
            <InputCard icon={Settings} title="Propellers" description={serviceKey === "propeller_service" ? "$349 per propeller" : "First propeller included. Additional propellers add 10% each."} visible={vis.propellers}>
              <div className="flex gap-3">
                {PROPELLERS.map((p) => (
                  <OptionButton key={p.value} selected={propellerCount === p.value} onClick={() => setPropellerCount(p.value)} className="w-20">
                    <div className="text-xl font-bold">{p.label}</div>
                    {serviceKey !== "propeller_service" && <div className="text-xs text-gray-500">{p.desc}</div>}
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 5. Bottom Paint Age */}
            <InputCard icon={Paintbrush} title="Bottom Paint Age" description="Paint condition affects marine growth estimates." visible={vis.paintAge}>
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
            <InputCard icon={Clock} title="Last Cleaned" description="Longer gaps between cleanings may increase marine growth surcharges." visible={vis.lastCleaned}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LAST_CLEANED.map((c) => (
                  <OptionButton key={c.value} selected={lastCleaned === c.value} onClick={() => setLastCleaned(c.value)}>
                    <div className="font-medium text-sm">{c.label}</div>
                  </OptionButton>
                ))}
              </div>
            </InputCard>

            {/* 7. Anodes */}
            <InputCard icon={Wrench} title="Anode Service" description={serviceKey === "anodes_only" ? "$149 minimum + $15 per anode installation" : "$15 per anode installation (labor only — anode parts additional)"} visible={vis.anodes}>
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

          {/* Right: Sticky estimate — vertically centered */}
          <div className="lg:col-span-2">
            <div
              className="lg:sticky"
              style={{
                top: "calc(50vh - 200px)",
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              <EstimateCard
                estimate={estimate}
                boatLength={boatLength}
                boatType={boatType}
                hullType={hullType}
                frequency={frequency}
                serviceKey={serviceKey}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support section */}
      <section id="services-info" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* How It Works */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#0073a8]" />
                How It Works
              </h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</span>
                  <div><strong className="text-foreground">Get Your Estimate</strong> — Use the calculator above</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">2</span>
                  <div><strong className="text-foreground">Place Your Order</strong> — Submit your info and we'll get you on the schedule</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">3</span>
                  <div><strong className="text-foreground">We Dive</strong> — Professional cleaning with before/after documentation</div>
                </li>
              </ol>
            </Card>

            {/* What's Included */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0073a8]" />
                What's Included
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Complete hull scrub</li>
                <li>✓ Running gear inspection</li>
                <li>✓ Before/after GoPro video</li>
                <li>✓ Digital service report</li>
                <li>✓ Zinc anode inspection</li>
              </ul>
            </Card>

          </div>

          {/* FAQ — full width */}
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0073a8]" />
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="text-sm">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left py-3 font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>
    </div>
  );
}
