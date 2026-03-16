import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { cn, formatCurrency } from "../lib/utils";
import { SERVICES } from "../lib/diving-calculator";
import PageMeta from "../components/PageMeta";
import {
  Ship, MapPin, User, Wrench, CreditCard, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, Anchor, Calendar
} from "lucide-react";

// ── Config ──
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const BOAT_TYPES = [
  { value: "monohull_sailboat", label: "Monohull Sailboat", hull: "monohull", type: "sailboat" },
  { value: "monohull_powerboat", label: "Monohull Powerboat", hull: "monohull", type: "powerboat" },
  { value: "catamaran_sailboat", label: "Catamaran Sailboat", hull: "catamaran", type: "sailboat" },
  { value: "catamaran_powerboat", label: "Catamaran Powerboat", hull: "catamaran", type: "powerboat" },
  { value: "trimaran_sailboat", label: "Trimaran Sailboat", hull: "trimaran", type: "sailboat" },
  { value: "trimaran_powerboat", label: "Trimaran Powerboat", hull: "trimaran", type: "powerboat" },
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "bimonthly", label: "Every 2 Months" },
  { value: "quarterly", label: "Every 3 Months" },
];

// ── Stripe loader (singleton) ──
// Fetches publishable key from edge function to stay in sync with backend mode (test/live)
let stripePromise = null;

function getStripePromise() {
  if (stripePromise) return stripePromise;
  stripePromise = fetch(`${SUPABASE_URL}/functions/v1/get-stripe-config`, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
    .then((res) => res.json())
    .then(({ publishableKey }) => loadStripe(publishableKey));
  return stripePromise;
}

// ── Stripe Element Styling ──
const STRIPE_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

// ── Section Card ──
function SectionCard({ icon: Icon, title, description, children }) {
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

// ── Form Field ──
function Field({ label, required, children, className }) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// ── Floating Profile Card ──
function ProfileCard({ form, service, estimateAmount, isItemRecovery, showFrequency }) {
  const boatTypeInfo = BOAT_TYPES.find((t) => t.value === form.boatType);
  const frequencyInfo = FREQUENCIES.find((f) => f.value === form.frequency);

  const hasBoatName = form.boatName?.trim();
  const hasLocation = form.marina?.trim();
  const hasOwner = form.customerName?.trim();

  return (
    <Card className="bg-gradient-to-br from-[#1565c0] to-[#0097a7] text-white border-0 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg text-white truncate">
              {hasBoatName || "Your Boat"}
            </CardTitle>
            <p className="text-white/60 text-sm truncate">
              {boatTypeInfo?.label || "—"}
              {form.boatLength && ` · ${form.boatLength}ft`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {/* Boat info */}
        {!isItemRecovery && (form.boatMake || form.boatModel) && (
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Make / Model</p>
            <p className="text-sm font-medium">
              {[form.boatMake, form.boatModel].filter(Boolean).join(" ") || "—"}
            </p>
          </div>
        )}

        {/* Location */}
        {!isItemRecovery && (
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <MapPin className="w-3 h-3 text-white/50" />
              <p className="text-white/50 text-xs uppercase tracking-wider">Location</p>
            </div>
            {hasLocation ? (
              <p className="text-sm font-medium">
                {form.marina}
                {(form.dock || form.slip) && (
                  <span className="text-white/70">
                    {form.dock && ` · Dock ${form.dock}`}
                    {form.slip && ` · Slip ${form.slip}`}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-white/40 italic">Not yet entered</p>
            )}
          </div>
        )}

        {/* Owner */}
        <div className="bg-white/10 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <User className="w-3 h-3 text-white/50" />
            <p className="text-white/50 text-xs uppercase tracking-wider">Owner</p>
          </div>
          {hasOwner ? (
            <div>
              <p className="text-sm font-medium">{form.customerName}</p>
              {form.customerEmail && (
                <p className="text-xs text-white/60">{form.customerEmail}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/40 italic">Not yet entered</p>
          )}
        </div>

        {/* Service + Estimate */}
        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench className="w-3 h-3 text-white/50" />
            <p className="text-white/50 text-xs uppercase tracking-wider">Service</p>
          </div>
          <p className="text-sm font-medium">{service.name}</p>
          {showFrequency && frequencyInfo && (
            <p className="text-xs text-white/60 mt-0.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              {frequencyInfo.label}
            </p>
          )}
        </div>

        {estimateAmount && (
          <div className="bg-white/15 rounded-xl p-4 text-center">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Estimated Cost</p>
            <p className="text-3xl font-bold">{formatCurrency(estimateAmount)}</p>
            <p className="text-white/50 text-xs mt-1">Charged after service completion</p>
          </div>
        )}

        <p className="text-xs text-white/40 text-center pt-1">
          Questions? Email{" "}
          <a href="mailto:diving@briancline.co" className="underline hover:text-white/60">
            diving@briancline.co
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

// ── Stripe-wrapped inner form ──
function OrderForm({ searchParams, navigate }) {
  const stripe = useStripe();
  const elements = useElements();

  // Pre-fill from URL params
  const serviceKey = searchParams.get("service") || "recurring_cleaning";
  const initialLength = searchParams.get("length") || "";
  const initialType = searchParams.get("type") || "sailboat";
  const initialHull = searchParams.get("hull") || "monohull";
  const initialFrequency = searchParams.get("frequency") || "monthly";
  const initialEstimate = searchParams.get("estimate") || "";
  const initialPropellers = searchParams.get("propellers") || "1";
  const initialPaintAge = searchParams.get("paintAge") || "";
  const initialLastCleaned = searchParams.get("lastCleaned") || "";
  const initialAnodes = searchParams.get("anodes") || "0";

  const service = SERVICES[serviceKey] || SERVICES.recurring_cleaning;

  // Combine hull + type into a single boat type value
  const initialBoatType = `${initialHull}_${initialType}`;
  // Validate it exists in our options, fall back to monohull_sailboat
  const validBoatType = BOAT_TYPES.some((t) => t.value === initialBoatType) ? initialBoatType : "monohull_sailboat";

  const isItemRecovery = serviceKey === "item_recovery";
  const isAnodesOnly = serviceKey === "anodes_only";
  const isPropellerService = serviceKey === "propeller_service";
  const isRecurring = serviceKey === "recurring_cleaning";
  const showBoatInfo = !isItemRecovery;
  const showFrequency = isRecurring;

  // Form state
  const [form, setForm] = useState({
    boatName: "",
    boatType: validBoatType,
    boatMake: "",
    boatModel: "",
    boatLength: initialLength,
    marina: "",
    dock: "",
    slip: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    frequency: isRecurring ? initialFrequency : "one_time",
    notes: "",
    // Item recovery fields
    recoveryLocation: "",
    itemDescription: "",
    dateLost: "",
    // Anodes only
    anodeInfo: "",
    // Propeller service
    propellerCount: searchParams.get("propellers") || "1",
  });

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cardState, setCardState] = useState({
    numberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
  });
  const [cardError, setCardError] = useState(null);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const estimateAmount = initialEstimate ? parseInt(initialEstimate) : null;

  const allCardComplete = cardState.numberComplete && cardState.expiryComplete && cardState.cvcComplete;

  const canSubmit =
    form.customerName &&
    form.customerEmail &&
    form.billingAddress &&
    form.billingCity &&
    form.billingState &&
    form.billingZip &&
    agreed &&
    allCardComplete &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);

      // Split combined boat type back into hull + type
      const selectedBoatType = BOAT_TYPES.find((t) => t.value === form.boatType);
      const hullType = selectedBoatType?.hull || initialHull;
      const boatPropulsion = selectedBoatType?.type || initialType;

      const formData = {
        boatName: isItemRecovery ? "N/A - Item Recovery" : form.boatName,
        boatLength: isItemRecovery ? "0" : form.boatLength,
        boatMake: isItemRecovery ? "N/A" : form.boatMake,
        boatModel: isItemRecovery ? "N/A" : form.boatModel,
        boatType: boatPropulsion,
        hullType: hullType,
        marinaName: isItemRecovery ? "See recovery location" : form.marina,
        dock: isItemRecovery ? "N/A" : form.dock,
        slipNumber: isItemRecovery ? "N/A" : form.slip,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        billingAddress: form.billingAddress,
        billingCity: form.billingCity,
        billingState: form.billingState,
        serviceInterval: isRecurring ? form.frequency : "one-time",
        customerNotes: form.notes,
        estimate: estimateAmount || 0,
        service: service.name,
        serviceDetails: {
          serviceName: service.name,
          boatLength: form.boatLength || initialLength,
          boatType: boatPropulsion,
          hullType: hullType,
          frequency: isRecurring ? form.frequency : "one-time",
          propellerCount: initialPropellers,
          paintAge: initialPaintAge,
          lastCleaned: initialLastCleaned,
          anodeCount: initialAnodes,
          includesAnodes: parseInt(initialAnodes) > 0,
        },
      };

      if (isItemRecovery) {
        formData.recoveryLocation = form.recoveryLocation;
        formData.itemDescription = form.itemDescription;
        formData.dropDate = form.dateLost;
      }
      if (isAnodesOnly) {
        formData.anodeDetails = form.anodeInfo;
      }
      if (isPropellerService) {
        formData.propellerCount = form.propellerCount;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create payment intent");
      }

      const { clientSecret, intentType, orderNumber } = await res.json();

      const billingDetails = {
        name: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        address: {
          line1: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          postal_code: form.billingZip,
          country: "US",
        },
      };

      let result;
      if (intentType === "setup") {
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: { card: cardNumberElement, billing_details: billingDetails },
        });
      } else {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardNumberElement, billing_details: billingDetails },
        });
      }

      if (result.error) throw result.error;

      setSuccess({ orderNumber });
    } catch (err) {
      console.error("Order submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Success State ──
  if (success) {
    return (
      <div>
        <PageMeta title="Order Confirmed | Brian Cline" />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Thank you for your order.</p>
          <p className="text-lg font-medium mb-2">
            Order Number: <span className="font-mono bg-gray-100 px-3 py-1 rounded">{success.orderNumber}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your card is securely saved and will be charged after service completion.
            You'll receive a confirmation email shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/hull-cleaning")}>
              Back to Estimator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div>
      <PageMeta
        title={`Schedule ${service.name} | Brian Cline`}
        description={`Schedule professional ${service.name.toLowerCase()} service on San Francisco Bay.`}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-sky-50 px-6 pt-10 pb-14 mb-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-sky-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-600 mb-4">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Schedule {service.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill out the form below to get on the schedule.
            {estimateAmount && (
              <span className="block mt-1 font-medium text-[#0073a8]">
                Estimated cost: {formatCurrency(estimateAmount)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
      {/* Mobile: Profile card at top */}
      <div className="lg:hidden mb-6">
        <ProfileCard
          form={form}
          service={service}
          estimateAmount={estimateAmount}
          isItemRecovery={isItemRecovery}
          showFrequency={showFrequency}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left: Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
        {/* Boat Details (hidden for item recovery) */}
        {showBoatInfo && (
          <SectionCard icon={Ship} title="Boat Details" description="Tell us about your vessel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Boat Name">
                <Input placeholder="Sea Spirit" value={form.boatName} onChange={(e) => updateField("boatName", e.target.value)} />
              </Field>
              <Field label="Boat Type">
                <select
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  value={form.boatType}
                  onChange={(e) => updateField("boatType", e.target.value)}
                >
                  {BOAT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Field label="Make">
                <Input placeholder="Beneteau" value={form.boatMake} onChange={(e) => updateField("boatMake", e.target.value)} />
              </Field>
              <Field label="Model">
                <Input placeholder="Oceanis 40.1" value={form.boatModel} onChange={(e) => updateField("boatModel", e.target.value)} />
              </Field>
              <Field label="Length (ft)">
                <Input type="number" placeholder="40" value={form.boatLength} onChange={(e) => updateField("boatLength", e.target.value)} />
              </Field>
            </div>

            {/* Propeller count for propeller service */}
            {isPropellerService && (
              <div className="mt-4">
                <Field label="Number of Propellers">
                  <Input type="number" min="1" max="4" value={form.propellerCount} onChange={(e) => updateField("propellerCount", e.target.value)} />
                </Field>
              </div>
            )}

            {/* Anode info for anodes only */}
            {isAnodesOnly && (
              <div className="mt-4">
                <Field label="Anode Information">
                  <Textarea
                    placeholder="Describe your anode needs — sizes, types, locations, how many you think need replacing..."
                    rows={3}
                    value={form.anodeInfo}
                    onChange={(e) => updateField("anodeInfo", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </SectionCard>
        )}

        {/* Item Recovery Section */}
        {isItemRecovery && (
          <SectionCard icon={MapPin} title="Recovery Location" description="Where did you lose the item?">
            <Field label="Location" required>
              <Textarea
                placeholder="Describe the location — marina name, dock, slip number, approximate area..."
                rows={3}
                value={form.recoveryLocation}
                onChange={(e) => updateField("recoveryLocation", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Item Description" required>
                <Input
                  placeholder="What did you lose? (phone, keys, tool, etc.)"
                  value={form.itemDescription}
                  onChange={(e) => updateField("itemDescription", e.target.value)}
                />
              </Field>
              <Field label="Date Lost">
                <Input
                  type="date"
                  value={form.dateLost}
                  onChange={(e) => updateField("dateLost", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>
        )}

        {/* Boat Location (not for item recovery) */}
        {showBoatInfo && (
          <SectionCard icon={MapPin} title="Boat Location" description="Where is your boat kept?">
            <Field label="Marina">
              <Input placeholder="Harbor Island West Marina" value={form.marina} onChange={(e) => updateField("marina", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Dock">
                <Input placeholder="C" value={form.dock} onChange={(e) => updateField("dock", e.target.value)} />
              </Field>
              <Field label="Slip">
                <Input placeholder="42" value={form.slip} onChange={(e) => updateField("slip", e.target.value)} />
              </Field>
            </div>
          </SectionCard>
        )}

        {/* Your Information */}
        <SectionCard icon={User} title="Your Information" description="Contact and billing details">
          <Field label="Full Name" required>
            <Input placeholder="John Smith" value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Email" required>
              <Input type="email" placeholder="john@example.com" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input type="tel" placeholder="(510) 555-1234" value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Billing Address" required>
              <Input placeholder="123 Main St" value={form.billingAddress} onChange={(e) => updateField("billingAddress", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field label="City" required>
              <Input placeholder="San Francisco" value={form.billingCity} onChange={(e) => updateField("billingCity", e.target.value)} />
            </Field>
            <Field label="State" required>
              <Input placeholder="CA" value={form.billingState} onChange={(e) => updateField("billingState", e.target.value)} />
            </Field>
            <Field label="ZIP" required>
              <Input placeholder="94107" value={form.billingZip} onChange={(e) => updateField("billingZip", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* Service Details */}
        <SectionCard icon={Wrench} title="Service Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Service">
              <div className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-700">
                {service.name}
              </div>
            </Field>

            {showFrequency && (
              <Field label="Frequency">
                <select
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  value={form.frequency}
                  onChange={(e) => updateField("frequency", e.target.value)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <div className="mt-4">
            <Field label="Additional Notes">
              <Textarea
                placeholder="Any special instructions, access codes, or things we should know..."
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        {/* Payment — Separate Stripe Elements */}
        <SectionCard icon={CreditCard} title="Payment Information" description="Your card will be saved on file — not charged now">
          {/* Card Number */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</Label>
            <div className="border border-gray-200 rounded-md p-3 bg-white">
              <CardNumberElement
                options={STRIPE_ELEMENT_OPTIONS}
                onChange={(e) => {
                  setCardState((prev) => ({ ...prev, numberComplete: e.complete }));
                  setCardError(e.error ? e.error.message : null);
                }}
              />
            </div>
          </div>

          {/* Expiry + CVC side by side */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Expiration</Label>
              <div className="border border-gray-200 rounded-md p-3 bg-white">
                <CardExpiryElement
                  options={STRIPE_ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setCardState((prev) => ({ ...prev, expiryComplete: e.complete }));
                    if (e.error) setCardError(e.error.message);
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">CVC</Label>
              <div className="border border-gray-200 rounded-md p-3 bg-white">
                <CardCvcElement
                  options={STRIPE_ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setCardState((prev) => ({ ...prev, cvcComplete: e.complete }));
                    if (e.error) setCardError(e.error.message);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Billing ZIP (plain input, already collected above but Stripe needs it too) */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Billing ZIP Code</Label>
            <Input
              placeholder="94107"
              value={form.billingZip}
              onChange={(e) => updateField("billingZip", e.target.value)}
              className="max-w-[200px]"
            />
          </div>

          {cardError && (
            <p className="text-red-500 text-sm mt-2">{cardError}</p>
          )}

          {/* Full Service Agreement */}
          <div className="mt-6 border rounded-lg p-4 bg-gray-50 space-y-3">
            <h4 className="font-semibold text-gray-900">Important Service Agreement</h4>

            <p className="text-sm text-gray-700">
              <strong>Billing:</strong> Your card will be charged only after service completion.
            </p>

            <p className="text-sm text-gray-700">
              <strong>Estimate Notice:</strong> The final amount may vary from the provided estimate based on actual conditions found during service. Common variations include:
            </p>

            <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
              <li>Unexpected marine growth levels</li>
              <li>Additional anode replacements needed</li>
            </ul>

            <p className="text-sm text-gray-700">
              Any variations and their reasons will be documented in your service logs and underwater video.
            </p>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="service-agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="service-agreement" className="text-sm text-gray-700 cursor-pointer leading-snug">
                I understand and agree to be billed for the service at time of completion, and that the final amount may vary from the estimate provided.
                {estimateAmount && (
                  <span className="font-medium"> Estimated amount: {formatCurrency(estimateAmount)}.</span>
                )}
              </label>
            </div>
          </div>
        </SectionCard>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Failed to submit order</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="bg-[#0073a8] text-white hover:bg-[#005f8a] px-8 h-12 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Order
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Right: Sticky profile card */}
      <div className="lg:col-span-2 hidden lg:block">
        <div
          className="lg:sticky"
          style={{
            top: "calc(50vh - 240px)",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          }}
        >
          <ProfileCard
            form={form}
            service={service}
            estimateAmount={estimateAmount}
            isItemRecovery={isItemRecovery}
            showFrequency={showFrequency}
          />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

// ── Main Component (wraps in Elements provider) ──
export default function DivingOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stripeReady, setStripeReady] = useState(null);

  useEffect(() => {
    getStripePromise().then((s) => setStripeReady(s));
  }, []);

  if (!stripeReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0073a8]" />
      </div>
    );
  }

  return (
    <Elements stripe={stripeReady}>
      <OrderForm searchParams={searchParams} navigate={navigate} />
    </Elements>
  );
}
