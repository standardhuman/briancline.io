import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { cn, formatCurrency } from "../lib/utils";
import PageMeta from "../components/PageMeta";
import {
  Ship, MapPin, User, Wrench, CreditCard, ArrowRight, Loader2,
  CheckCircle2, AlertCircle
} from "lucide-react";

// ── Config ──
const SUPABASE_URL = "https://fzygakldvvzxmahkdylq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk";

const BOAT_TYPES = [
  { value: "sailboat", label: "Sailboat" },
  { value: "powerboat", label: "Powerboat" },
  { value: "catamaran", label: "Catamaran" },
  { value: "trimaran", label: "Trimaran" },
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "bimonthly", label: "Every 2 Months" },
  { value: "quarterly", label: "Every 3 Months" },
  { value: "one_time", label: "One-Time Service" },
];

// ── Stripe loader (singleton) ──
let stripePromise = null;

async function getStripe() {
  if (stripePromise) return stripePromise;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-stripe-config`, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const { publishableKey } = await res.json();
  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

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

// ── Main Component ──
export default function DivingOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pre-fill from URL params
  const initialLength = searchParams.get("length") || "";
  const initialType = searchParams.get("type") || "sailboat";
  const initialFrequency = searchParams.get("frequency") || "monthly";
  const initialEstimate = searchParams.get("estimate") || "";

  // Form state
  const [form, setForm] = useState({
    boatName: "",
    boatType: initialType,
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
    serviceType: "hull_cleaning",
    frequency: initialFrequency,
    notes: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // { orderNumber }
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);

  // Stripe refs
  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const cardContainerRef = React.useRef(null);

  // Load Stripe and mount CardElement
  useEffect(() => {
    let mounted = true;
    let element = null;

    getStripe().then((stripeInstance) => {
      if (!mounted || !cardContainerRef.current) return;
      setStripe(stripeInstance);

      const elements = stripeInstance.elements();
      element = elements.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#1f2937",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            "::placeholder": { color: "#9ca3af" },
          },
          invalid: { color: "#ef4444" },
        },
      });
      element.mount(cardContainerRef.current);
      element.on("change", (event) => {
        if (!mounted) return;
        setCardComplete(event.complete);
        setCardError(event.error ? event.error.message : null);
      });
      setCardElement(element);
    });

    return () => {
      mounted = false;
      if (element) element.destroy();
    };
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const estimateAmount = initialEstimate ? parseInt(initialEstimate) : null;

  const canSubmit =
    form.customerName &&
    form.customerEmail &&
    form.billingAddress &&
    form.billingCity &&
    form.billingState &&
    agreed &&
    cardComplete &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !stripe || !cardElement) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Build form data for edge function
      const formData = {
        boatName: form.boatName,
        boatLength: form.boatLength,
        boatMake: form.boatMake,
        boatModel: form.boatModel,
        boatType: form.boatType,
        marinaName: form.marina,
        dock: form.dock,
        slipNumber: form.slip,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        billingAddress: form.billingAddress,
        billingCity: form.billingCity,
        billingState: form.billingState,
        serviceInterval: form.frequency,
        customerNotes: form.notes,
        estimate: estimateAmount || 0,
        service: "Hull Cleaning",
        serviceDetails: `${form.boatType} - ${form.boatLength}ft - ${FREQUENCIES.find((f) => f.value === form.frequency)?.label || form.frequency}`,
      };

      // Call edge function
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

      // Confirm with Stripe
      const billingDetails = {
        name: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        address: {
          line1: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          country: "US",
        },
      };

      let result;
      if (intentType === "setup") {
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: { card: cardElement, billing_details: billingDetails },
        });
      } else {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement, billing_details: billingDetails },
        });
      }

      if (result.error) {
        throw result.error;
      }

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
            <Button variant="outline" onClick={() => navigate("/diving")}>
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
        title="Schedule Hull Cleaning | Brian Cline"
        description="Schedule professional hull cleaning service on San Francisco Bay."
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
            Schedule Hull Cleaning Service
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

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {/* 1. Boat Details */}
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
        </SectionCard>

        {/* 2. Location */}
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

        {/* 3. Your Information */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="City" required>
              <Input placeholder="San Francisco" value={form.billingCity} onChange={(e) => updateField("billingCity", e.target.value)} />
            </Field>
            <Field label="State" required>
              <Input placeholder="CA" value={form.billingState} onChange={(e) => updateField("billingState", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* 4. Service Details */}
        <SectionCard icon={Wrench} title="Service Details" description="What service do you need?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Service Type">
              <select
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                value={form.serviceType}
                onChange={(e) => updateField("serviceType", e.target.value)}
              >
                <option value="hull_cleaning">Hull Cleaning</option>
              </select>
            </Field>
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

        {/* 5. Payment */}
        <SectionCard icon={CreditCard} title="Payment Information" description="Your card will be saved on file — not charged now">
          <div
            ref={cardContainerRef}
            className="border border-gray-200 rounded-md p-3 bg-white"
          />
          {cardError && (
            <p className="text-red-500 text-sm mt-2">{cardError}</p>
          )}

          <div className="mt-4 flex items-start gap-3">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-0.5"
            />
            <label htmlFor="agreement" className="text-sm text-gray-600 cursor-pointer leading-snug">
              I authorize SailorSkills to charge the card on file after service completion.
              {estimateAmount && (
                <span className="font-medium"> Estimated amount: {formatCurrency(estimateAmount)}.</span>
              )}
            </label>
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
    </div>
  );
}
