import React, { useState, useMemo, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import PageHero from "../components/PageHero";
import PageCTA from "../components/PageCTA";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { cn, formatCurrency } from "../lib/utils";
import {
  serviceData, serviceDisplayOrder, calculateServiceCost, lookupFoulingSeverity,
  paintAgeOptions, cleaningAgeOptions, boatTypeOptions, hullTypeOptions, intervalOptions,
  fetchStripeConfig, createPaymentIntent, stripeConfig,
} from "../lib/diving-calculator";
import {
  Anchor, Ship, Sailboat, Camera, FileCheck, ShieldCheck,
  ArrowRight, ArrowLeft, ChevronRight, ClipboardCheck, Waves, Users,
} from "lucide-react";
import PageMeta from "../components/PageMeta";

// ── Multi-step Calculator ──
function DivingCalculator() {
  const [step, setStep] = useState(0);
  const [serviceKey, setServiceKey] = useState(null);
  const [boatLength, setBoatLength] = useState(30);
  const [boatType, setBoatType] = useState("sailboat");
  const [hullType, setHullType] = useState("monohull");
  const [propellerCount, setPropellerCount] = useState(1);
  const [lastPainted, setLastPainted] = useState("0-6_months");
  const [lastCleaned, setLastCleaned] = useState("0-2_months");
  const [anodesToInstall, setAnodesToInstall] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  const service = serviceKey ? serviceData[serviceKey] : null;
  const isPerFoot = service?.type === "per_foot";
  const isCleaning = serviceKey === "recurring_cleaning" || serviceKey === "onetime_cleaning";

  const estimate = useMemo(() => {
    if (!serviceKey) return null;
    return calculateServiceCost({
      serviceKey, boatLength, boatType, hullType, propellerCount,
      lastPaintedTime: lastPainted, lastCleanedTime: lastCleaned, anodesToInstall,
    });
  }, [serviceKey, boatLength, boatType, hullType, propellerCount, lastPainted, lastCleaned, anodesToInstall]);

  // Step flow depends on service
  const getSteps = useCallback(() => {
    if (!serviceKey) return [0];
    if (serviceKey === "item_recovery") return [0, "results"];
    if (serviceKey === "underwater_inspection") return [0, "length", "hull", "results"];
    if (service?.type === "flat") return [0, "anodes", "results"];
    // per_foot cleaning
    const steps = [0, "length", "boatType", "hull", "propellers", "paint", "cleaned", "anodes", "results"];
    return steps;
  }, [serviceKey, service]);

  const steps = getSteps();
  const currentStepId = steps[step];
  const isResults = currentStepId === "results";
  const canGoBack = step > 0 && !showCheckout;

  function nextStep() {
    if (step < steps.length - 1) setStep(step + 1);
  }
  function prevStep() {
    if (step > 0) setStep(step - 1);
  }
  function selectService(key) {
    setServiceKey(key);
    // Auto-advance on second click
    if (serviceKey === key) {
      setStep(1);
    }
  }

  // Reset when service changes
  useEffect(() => {
    setStep(0);
    setShowCheckout(false);
  }, [serviceKey]);

  if (showCheckout && estimate?.success) {
    return (
      <CheckoutForm
        serviceKey={serviceKey}
        estimate={estimate}
        boatLength={boatLength}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 0: Service Selection */}
      {currentStepId === 0 && (
        <div className="space-y-3">
          {serviceDisplayOrder.map((key) => {
            if (key === "separator") {
              return (
                <div key="sep" className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Other Services</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              );
            }
            const svc = serviceData[key];
            const isSelected = serviceKey === key;
            return (
              <button
                key={key}
                onClick={() => selectService(key)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{svc.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {svc.type === "per_foot" ? `$${svc.rate}/ft` : `$${svc.rate} flat rate`}
                    </div>
                  </div>
                  {key === "recurring_cleaning" && (
                    <Badge variant="accent" className="text-xs">Save 25%</Badge>
                  )}
                </div>
                {isSelected && (
                  <div className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {svc.description}
                    <div className="text-primary font-medium mt-2 flex items-center gap-1">
                      Click again to continue <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Boat Length */}
      {currentStepId === "length" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" /> Boat Length
            </CardTitle>
            <CardDescription>Enter your boat's overall length in feet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number" min={10} max={200}
                value={boatLength}
                onChange={(e) => setBoatLength(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-24 h-12 text-xl font-semibold text-center"
              />
              <span className="text-gray-500">feet</span>
              <input
                type="range" min={15} max={100} value={Math.min(boatLength, 100)}
                onChange={(e) => setBoatLength(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boat Type */}
      {currentStepId === "boatType" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sailboat className="w-5 h-5 text-primary" /> Boat Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {boatTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBoatType(opt.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    boatType === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-semibold">{opt.label}</div>
                  {opt.note && <div className="text-xs text-amber-600 mt-1">{opt.note}</div>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hull Type */}
      {currentStepId === "hull" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Anchor className="w-5 h-5 text-primary" /> Hull Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {hullTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHullType(opt.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    hullType === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-semibold">{opt.label}</div>
                  {opt.note && <div className="text-xs text-amber-600 mt-1">{opt.note}</div>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Propellers */}
      {currentStepId === "propellers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Number of Propellers</CardTitle>
            <CardDescription>First propeller is included. Additional propellers add 10% each.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPropellerCount(n)}
                  className={cn(
                    "w-14 h-14 rounded-xl border-2 text-lg font-semibold transition-all",
                    propellerCount === n
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paint Age */}
      {currentStepId === "paint" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">When Was Your Hull Last Painted?</CardTitle>
            <CardDescription>Paint age helps estimate growth conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paintAgeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLastPainted(opt.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm",
                    lastPainted === opt.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Cleaned */}
      {currentStepId === "cleaned" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">When Was Your Hull Last Cleaned?</CardTitle>
            <CardDescription>This is the biggest factor in estimating marine growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cleaningAgeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLastCleaned(opt.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm",
                    lastCleaned === opt.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anodes */}
      {currentStepId === "anodes" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zinc Anodes to Install</CardTitle>
            <CardDescription>$15 labor per anode (anode material cost not included). Set to 0 if none needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <button onClick={() => setAnodesToInstall(Math.max(0, anodesToInstall - 1))} className="w-10 h-10 rounded-lg border border-gray-200 font-bold text-lg hover:bg-gray-50">−</button>
              <span className="text-2xl font-bold w-12 text-center">{anodesToInstall}</span>
              <button onClick={() => setAnodesToInstall(anodesToInstall + 1)} className="w-10 h-10 rounded-lg border border-gray-200 font-bold text-lg hover:bg-gray-50">+</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isResults && estimate && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-[#1565c0] to-[#0097a7] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white/90">Your Estimate</CardTitle>
              <CardDescription className="text-white/60">{estimate.service}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl font-bold">{formatCurrency(estimate.total)}</div>
                <div className="text-white/70 text-sm mt-1">
                  {isCleaning ? "estimated cost" : "total"}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
                {estimate.breakdown.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-white/70">{item.description}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {estimate.breakdown.minimumApplied && (
                  <div className="flex justify-between text-amber-300">
                    <span>Minimum charge applied</span>
                    <span>$149.00</span>
                  </div>
                )}
                <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(estimate.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isCleaning && anodesToInstall > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-4 text-sm text-amber-800">
                <strong>Anode materials not included.</strong> This estimate covers installation labor only (${anodesToInstall * 15}).
                Anode material cost varies by size and type.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      {step > 0 && (
        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" onClick={prevStep} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {isResults ? (
            <Button onClick={() => setShowCheckout(true)} className="gap-1">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={nextStep} className="gap-1">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Checkout Form ──
function CheckoutForm({ serviceKey, estimate, boatLength, onBack }) {
  const [stripeKey, setStripeKey] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);
  const [cardExpiry, setCardExpiry] = useState(null);
  const [cardCvc, setCardCvc] = useState(null);
  const [interval, setInterval] = useState(serviceKey === "recurring_cleaning" ? "2" : "one-time");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    billingAddress: "", billingCity: "", billingState: "",
    boatName: "", boatMake: "", boatModel: "",
    marinaName: "", dock: "", slipNumber: "",
    customerNotes: "",
  });
  const [agreement, setAgreement] = useState(false);
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false, postal: false });

  // Init Stripe
  useEffect(() => {
    (async () => {
      const config = await fetchStripeConfig();
      if (config.publishableKey) {
        setStripeKey(config.publishableKey);
        const s = await loadStripe(config.publishableKey);
        setStripe(s);
      }
    })();
  }, []);

  // Mount Stripe elements
  const cardNumberRef = React.useRef(null);
  const cardExpiryRef = React.useRef(null);
  const cardCvcRef = React.useRef(null);
  const postalRef = React.useRef(null);

  useEffect(() => {
    if (!stripe || cardNumber) return;
    const elems = stripe.elements();
    const style = { base: { fontSize: "16px", color: "#000", fontFamily: "Inter, system-ui, sans-serif", "::placeholder": { color: "#999" } } };

    const cn = elems.create("cardNumber", { style });
    cn.mount(cardNumberRef.current);
    cn.on("change", (e) => setCardComplete((p) => ({ ...p, number: e.complete })));

    const ce = elems.create("cardExpiry", { style });
    ce.mount(cardExpiryRef.current);
    ce.on("change", (e) => setCardComplete((p) => ({ ...p, expiry: e.complete })));

    const cc = elems.create("cardCvc", { style });
    cc.mount(cardCvcRef.current);
    cc.on("change", (e) => setCardComplete((p) => ({ ...p, cvc: e.complete })));

    const pc = elems.create("postalCode", { style, placeholder: "12345" });
    pc.mount(postalRef.current);
    pc.on("change", (e) => setCardComplete((p) => ({ ...p, postal: e.complete })));

    setCardNumber(cn);
    setCardExpiry(ce);
    setCardCvc(cc);
    setElements(elems);
  }, [stripe]);

  const allCardComplete = cardComplete.number && cardComplete.expiry && cardComplete.cvc && cardComplete.postal;
  const allFieldsFilled = form.customerName && form.customerEmail && form.customerPhone && form.billingAddress && form.billingCity && form.billingState;
  const canSubmit = allCardComplete && allFieldsFilled && agreement && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !stripe || !cardNumber) return;
    setSubmitting(true);
    setError("");

    try {
      const formData = {
        ...form,
        serviceInterval: interval,
        estimate: estimate.total,
        service: estimate.service,
        boatLength: boatLength.toString(),
        serviceDetails: estimate,
      };

      const { clientSecret, intentType, orderNumber } = await createPaymentIntent(formData);

      const billingDetails = {
        name: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        address: { line1: form.billingAddress, city: form.billingCity, state: form.billingState, country: "US" },
      };

      let result;
      if (intentType === "setup") {
        result = await stripe.confirmCardSetup(clientSecret, { payment_method: { card: cardNumber, billing_details: billingDetails } });
      } else {
        result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardNumber, billing_details: billingDetails } });
      }

      if (result.error) throw result.error;
      setConfirmed(orderNumber);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <Card className="text-center p-10">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-2">Order Number: <strong>{confirmed}</strong></p>
        <p className="text-gray-500 mb-6">Your card is saved and will be charged after service completion. You'll receive a confirmation email shortly.</p>
        <Button onClick={() => window.location.reload()}>Start New Estimate</Button>
      </Card>
    );
  }

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Order</CardTitle>
          <CardDescription>
            {estimate.service} — {formatCurrency(estimate.total)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Boat Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Boat Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Boat Name</Label><Input value={form.boatName} onChange={updateField("boatName")} placeholder="Optional" /></div>
                <div><Label>Boat Length</Label><Input value={boatLength} readOnly className="bg-gray-50" /></div>
                <div><Label>Make</Label><Input value={form.boatMake} onChange={updateField("boatMake")} placeholder="Optional" /></div>
                <div><Label>Model</Label><Input value={form.boatModel} onChange={updateField("boatModel")} placeholder="Optional" /></div>
                <div><Label>Marina</Label><Input value={form.marinaName} onChange={updateField("marinaName")} placeholder="Optional" /></div>
                <div><Label>Dock / Slip</Label><Input value={form.slipNumber} onChange={updateField("slipNumber")} placeholder="Optional" /></div>
              </div>
            </div>

            {/* Service Interval (recurring only) */}
            {serviceKey === "recurring_cleaning" && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Service Interval</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {intervalOptions.map((opt) => (
                    <button
                      type="button" key={opt.value}
                      onClick={() => setInterval(opt.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-center text-sm font-medium transition-all",
                        interval === opt.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input required value={form.customerName} onChange={updateField("customerName")} /></div>
                <div><Label>Email *</Label><Input type="email" required value={form.customerEmail} onChange={updateField("customerEmail")} /></div>
                <div><Label>Phone *</Label><Input type="tel" required value={form.customerPhone} onChange={updateField("customerPhone")} /></div>
              </div>
            </div>

            {/* Billing */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Billing Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><Label>Street Address *</Label><Input required value={form.billingAddress} onChange={updateField("billingAddress")} /></div>
                <div><Label>City *</Label><Input required value={form.billingCity} onChange={updateField("billingCity")} /></div>
                <div><Label>State *</Label><Input required value={form.billingState} onChange={updateField("billingState")} /></div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Payment</h3>
              <div className="space-y-3">
                <div>
                  <Label>Card Number</Label>
                  <div ref={cardNumberRef} className="h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Expiry</Label>
                    <div ref={cardExpiryRef} className="h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <Label>CVC</Label>
                    <div ref={cardCvcRef} className="h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <Label>ZIP</Label>
                    <div ref={postalRef} className="h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optional)</Label>
              <textarea
                value={form.customerNotes} onChange={updateField("customerNotes")}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Anything we should know?"
              />
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={agreement} onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">
                I agree to the service terms. I understand my card will be charged after service completion and that the final cost may vary based on actual conditions.
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full h-12 text-base">
              {submitting ? "Processing..." : "Complete Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Diving Page ──
export default function Diving() {
  return (
    <div>
      <PageMeta title="Hull Cleaning | San Francisco Bay | Brian Cline" description="Professional hull cleaning on San Francisco Bay. From $4.49/ft recurring. USCG Licensed Master, SSI Certified Diver." />
      <PageHero
        title="Professional Hull Cleaning"
        subtitle="San Francisco Bay · Expert underwater hull maintenance with detailed condition reports and photos."
        price="From $4.49/ft (recurring) · $5.99/ft (one-time)"
        credentials="USCG Licensed Master · SSI Certified Diver · 20+ years on the Bay"
        cta="Get a Free Assessment"
        ctaHref="mailto:brian@briancline.co?subject=Hull%20Cleaning%20Assessment"
      />

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ClipboardCheck, title: "Schedule", desc: "Tell me about your boat and where it's docked. I'll give you a quick assessment and schedule the service." },
              { icon: Waves, title: "Clean", desc: "Professional hull cleaning with a full condition assessment. I inspect anodes, through-hulls, and running gear while I'm down there." },
              { icon: Camera, title: "Report", desc: "You get underwater photos, a growth rating, paint condition report, and anode status — every time." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-16 md:py-24 bg-gray-50" id="calculator">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Cost Calculator</h2>
            <p className="text-gray-600">Select a service and walk through the steps for an instant estimate.</p>
          </div>
          <DivingCalculator />
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">What's Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Growth Assessment", desc: "Detailed condition rating so you know exactly where your hull stands." },
              { icon: FileCheck, title: "Paint Report", desc: "Current paint condition documented to help plan your next haul-out." },
              { icon: Camera, title: "Underwater Photos", desc: "Before and after photos of the hull, running gear, and anodes." },
              { icon: Anchor, title: "Anode Inspection", desc: "Zinc anodes checked every visit. Replacement recommended when needed." },
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

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Common Questions</h2>
          <Accordion type="single" collapsible>
            {[
              { q: "How often should I have my hull cleaned?", a: "Most boats on SF Bay do well with monthly or bi-monthly cleaning. Boats in warmer slips or with older paint may need more frequent service. I'll recommend a schedule based on your specific situation." },
              { q: "What's the difference between recurring and one-time pricing?", a: "Recurring clients get a lower per-foot rate ($4.49/ft vs $5.99/ft) because regular maintenance keeps growth minimal, which means less work per visit. It's a better deal for both of us." },
              { q: "What happens if my hull has heavy growth?", a: "Heavy or severe growth adds a surcharge because it takes significantly more time and effort. The calculator above factors this in based on your paint age and last cleaning. First-time cleanings with heavy growth are common — the surcharge drops after the initial cleaning." },
              { q: "Do you replace zinc anodes?", a: "I inspect anodes every visit and will let you know when they need replacement. Installation labor is $15 per anode — you provide the anodes, or I can source them for you at cost." },
              { q: "What areas do you serve?", a: "I service marinas throughout San Francisco Bay — Richmond, Berkeley, Emeryville, Sausalito, San Francisco, and the South Bay. If you're not sure whether I cover your marina, just ask." },
              { q: "How do I get started?", a: "Use the calculator above to get an estimate, or email me directly for a free assessment. I'll usually respond within a few hours." },
            ].map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Referral */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Card className="p-6 md:p-8 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Referral Program</h3>
                <p className="text-sm text-gray-600 mt-1">Know someone who needs hull cleaning? Refer them and you both get a discount on your next service. <a href="mailto:brian@briancline.co?subject=Referral%20Program" className="text-primary font-medium hover:underline">Ask me about it.</a></p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <PageCTA
        title="Ready for a Cleaner Hull?"
        subtitle="Email me for a free assessment or use the calculator above to get started."
        buttonText="Get a Free Assessment"
        href="mailto:brian@briancline.co?subject=Hull%20Cleaning%20-%20Free%20Assessment"
      />
    </div>
  );
}
