import React, { useState } from "react";
import PageHero from "../components/PageHero";
import PageCTA from "../components/PageCTA";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import {
  Sparkles, Droplets, Shield, Camera, MessageSquare,
  CheckCircle2, Send, Zap, Ship, Sailboat,
} from "lucide-react";
import PageMeta from "../components/PageMeta";

const services = [
  { icon: Droplets, label: "Wash & Dry", desc: "Complete exterior wash, deck scrub, and dry" },
  { icon: Sparkles, label: "Polish & Wax", desc: "Restore shine and UV protection" },
  { icon: Shield, label: "Metal Polishing", desc: "Stainless steel, aluminum, chrome brightwork" },
  { label: "Gelcoat & Paint Repair", desc: "Chips, cracks, scratches, and color matching" },
  { label: "Gelcoat Stain Removal", desc: "Waterline stains, rust, oxidation" },
  { label: "Decal Removal", desc: "Clean removal without surface damage" },
  { label: "Teak & Brightwork", desc: "Cleaning, oiling, or varnish renewal" },
];

const serviceCheckboxes = [
  "Wash & Dry",
  "Polish & Wax",
  "Metal Polishing",
  "Gelcoat & Paint Repair",
  "Gelcoat Stain Removal",
  "Complete Detailing",
  "Teak / Brightwork",
  "Other",
];

/* ── Spring Pressure Wash Calculator ── */

const RATE_PER_SQFT = 0.84;
const MIN_CHARGE = 75;
const POWERBOAT_SINGLE_SURCHARGE = 1.35;
const POWERBOAT_MULTI_SURCHARGE = 1.70;
const SAIL_SHAPE_FACTOR = 0.70;
const POWER_SHAPE_FACTOR = 0.85;

function calcSpringWashPrice(length, beam, boatType, multiDeck) {
  if (!length || !beam) return null;
  const l = parseFloat(length);
  const b = parseFloat(beam);
  if (l <= 0 || b <= 0) return null;

  const shapeFactor = boatType === "power" ? POWER_SHAPE_FACTOR : SAIL_SHAPE_FACTOR;
  const area = l * b * shapeFactor;
  let price = area * RATE_PER_SQFT;

  if (boatType === "power") {
    price *= multiDeck ? POWERBOAT_MULTI_SURCHARGE : POWERBOAT_SINGLE_SURCHARGE;
  }

  return Math.max(MIN_CHARGE, Math.round(price));
}

function SpringSpecial() {
  const [length, setLength] = useState("");
  const [beam, setBeam] = useState("");
  const [boatType, setBoatType] = useState("sail");
  const [multiDeck, setMultiDeck] = useState(false);

  const price = calcSpringWashPrice(length, beam, boatType, multiDeck);

  return (
    <section className="py-12 md:py-16" id="spring-special">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="overflow-hidden border-0 shadow-xl">
          {/* Banner header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 md:px-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🌿</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Spring Pressure Wash Special</h2>
            </div>
            <p className="text-emerald-50 text-sm md:text-base ml-11">
              Blast off the winter grime, algae, and green buildup. Dock box &amp; dock cleaning included.
            </p>
          </div>

          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: inputs */}
              <div className="space-y-5">
                <h3 className="font-semibold text-foreground text-lg">Get your price</h3>

                {/* Boat type toggle */}
                <div>
                  <Label className="mb-2 block text-sm">Boat Type</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setBoatType("sail"); setMultiDeck(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        boatType === "sail"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Sailboat className="w-5 h-5" />
                      Sailboat
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoatType("power")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        boatType === "power"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Ship className="w-5 h-5" />
                      Powerboat
                    </button>
                  </div>
                </div>

                {/* Multi-deck toggle (powerboat only) */}
                {boatType === "power" && (
                  <div>
                    <Label className="mb-2 block text-sm">Decks</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMultiDeck(false)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          !multiDeck
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        Single Deck
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiDeck(true)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          multiDeck
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        Flybridge / Multi-Deck
                      </button>
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm">Length (ft)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 32"
                    />
                    <p className="text-xs text-gray-400 mt-1">Model name length (e.g. Dana 24 = 24)</p>
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Beam (ft)</Label>
                    <Input
                      type="number"
                      min="4"
                      max="30"
                      value={beam}
                      onChange={(e) => setBeam(e.target.value)}
                      placeholder="e.g. 10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Widest point of the hull</p>
                  </div>
                </div>
              </div>

              {/* Right: price display */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 w-full">
                  {price !== null ? (
                    <>
                      <p className="text-sm text-gray-500 mb-1">Your price</p>
                      <p className="text-5xl font-bold text-emerald-600">${price}</p>
                      <p className="text-sm text-gray-500 mt-2">One-time spring cleaning</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-1">Enter your boat's dimensions</p>
                      <p className="text-4xl font-bold text-gray-300">$—</p>
                      <p className="text-sm text-gray-400 mt-2">Instant pricing, no surprises</p>
                    </>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 w-full">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Full pressure wash — deck, hull topsides, cockpit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Dock box cleaning included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Dock cleaning included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Removes algae, mildew, and winter grime</span>
                  </div>
                </div>

                {price !== null && (
                  <a
                    href="#estimate"
                    className="mt-6 inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Book This — ${price}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const ESTIMATE_API_URL = "/api/detailing-estimate";

function EstimateForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", marina: "", dockSlip: "", boatName: "", boatLength: "",
    services: [], notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleService(svc) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(svc)
        ? f.services.filter((s) => s !== svc)
        : [...f.services, svc],
    }));
  }

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(ESTIMATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          marina: form.marina,
          dockSlip: form.dockSlip,
          boatName: form.boatName,
          boatLength: form.boatLength,
          services: form.services.join(", "),
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError("Failed to send. Email brian@briancline.co directly.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center p-10">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Request Sent!</h3>
        <p className="text-gray-600">Brian will get back to you within 24 hours with an estimate.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Get an Estimate</CardTitle>
        <CardDescription>Tell me about your boat and what you need. I'll respond within 24 hours.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input required value={form.name} onChange={updateField("name")} /></div>
            <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={updateField("email")} /></div>
            <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={updateField("phone")} placeholder="(510) 555-1234" /></div>
            <div><Label>Marina</Label><Input value={form.marina} onChange={updateField("marina")} placeholder="e.g. Berkeley Marina" /></div>
            <div><Label>Dock / Slip #</Label><Input value={form.dockSlip} onChange={updateField("dockSlip")} placeholder="e.g. F-12" /></div>
            <div><Label>Boat Name</Label><Input value={form.boatName} onChange={updateField("boatName")} /></div>
            <div><Label>Boat Length (ft)</Label><Input type="number" value={form.boatLength} onChange={updateField("boatLength")} /></div>
          </div>

          <div>
            <Label className="mb-3 block">Services Interested In</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceCheckboxes.map((svc) => (
                <label key={svc} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                  <Checkbox
                    checked={form.services.includes(svc)}
                    onCheckedChange={() => toggleService(svc)}
                  />
                  {svc}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={updateField("notes")} placeholder="Anything specific you'd like done?" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Request Estimate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Detailing() {
  return (
    <div>
      <PageMeta title="Boat Detailing | East Bay | Brian Cline" description="Professional boat detailing on the East Bay. Wash, polish, wax, metal polishing, gelcoat, and brightwork. From $5/ft." />
      <PageHero
        title="Boat Detailing"
        subtitle="Above-the-waterline care for your boat. Wash, polish, wax, metal work, and brightwork — done right, on the East Bay."
        price=""
        credentials="Serving Berkeley, Emeryville, Richmond, and Oakland marinas"
        cta="🌿 Spring Pressure Wash Special"
        ctaHref="#spring-special"
      />

      <SpringSpecial />

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, label, desc }) => (
              <Card key={label} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {Icon ? <Icon className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">What to Expect</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Satisfaction Guarantee", desc: "Not happy? I'll come back and make it right." },
              { icon: MessageSquare, title: "Clear Communication", desc: "You'll know exactly what's happening and when." },
              { icon: Camera, title: "Before & After Photos", desc: "Documentation of every job." },
              { icon: CheckCircle2, title: "Service Log", desc: "Track what's been done and when it's due again." },
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

      {/* Estimate Form */}
      <section className="py-16 md:py-24" id="estimate">
        <div className="max-w-2xl mx-auto px-6">
          <EstimateForm />
        </div>
      </section>

      <PageCTA
        title="Get Your Boat Looking Its Best"
        subtitle="Drop me a line for a free estimate."
        buttonText="Request an Estimate"
        href="#estimate"
      />
    </div>
  );
}
