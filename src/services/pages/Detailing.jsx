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
  CheckCircle2, Send,
} from "lucide-react";
import PageMeta from "../components/PageMeta";

const services = [
  { icon: Droplets, label: "Wash & Dry", desc: "Complete exterior wash, deck scrub, and dry" },
  { icon: Sparkles, label: "Polish & Wax", desc: "Restore shine and UV protection" },
  { icon: Shield, label: "Metal Polishing", desc: "Stainless steel, aluminum, chrome brightwork" },
  { label: "Gelcoat Stain Removal", desc: "Waterline stains, rust, oxidation" },
  { label: "Decal Removal", desc: "Clean removal without surface damage" },
  { label: "Teak & Brightwork", desc: "Cleaning, oiling, or varnish renewal" },
];

const serviceCheckboxes = [
  "Wash & Dry",
  "Polish & Wax",
  "Metal Polishing",
  "Gelcoat Stain Removal",
  "Complete Detailing",
  "Teak / Brightwork",
  "Other",
];

// Using Formspree for simplicity
const FORMSPREE_URL = "https://formspree.io/f/xgeggrwb";

function EstimateForm() {
  const [form, setForm] = useState({
    name: "", email: "", marina: "", boatName: "", boatLength: "",
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
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          marina: form.marina,
          boatName: form.boatName,
          boatLength: form.boatLength,
          services: form.services.join(", "),
          notes: form.notes,
          _subject: `Detailing Estimate Request — ${form.name}`,
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
            <div><Label>Marina</Label><Input value={form.marina} onChange={updateField("marina")} placeholder="e.g. Berkeley Marina" /></div>
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
        price="From $5.00/ft"
        credentials="Serving Berkeley, Emeryville, Richmond, and Oakland marinas"
        cta="Get an Estimate"
        ctaHref="#estimate"
      />

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
