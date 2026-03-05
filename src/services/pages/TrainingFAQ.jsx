import React from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import PageCTA from "../components/PageCTA";
import PageMeta from "../components/PageMeta";

const faqs = [
  { q: "What experience level do I need?", a: "None. I teach complete beginners through advanced sailors. Most of my students are adults who bought a boat and want to feel confident sailing it. A few sessions is usually enough to get comfortable." },
  { q: "Do I need my own boat?", a: "Ideally, yes — lessons on your boat mean you learn your specific systems, rigging, and dock. If you don't have a boat yet, reach out and we'll figure something out." },
  { q: "How many lessons will I need?", a: "Depends on your goals. Most people see a real difference after 3–5 sessions. Some want one refresher; others want ongoing coaching. We'll talk about it in the free consultation." },
  { q: "Where do lessons take place?", a: "Wherever your boat is on San Francisco Bay — Richmond, Berkeley, Emeryville, Sausalito, SF Marina, and others. We'll use the local waters you'll actually be sailing." },
  { q: "What about weather cancellations?", a: "Safety first. If conditions aren't suitable for your skill level, we reschedule at no charge. I'll never take you out in conditions I'm not comfortable teaching in." },
  { q: "Can I bring a partner or crew member?", a: "Sure. Lessons can include one additional person at no extra cost. It's actually great for couples who want to sail together — you both learn, and you develop a shared language for crewing." },
  { q: "How do I schedule?", a: "Email me to set up a free consultation. We'll talk about what you want to learn, I'll take a look at your boat if needed, and we'll pick a time that works. Weekdays and weekends available." },
  { q: "What's your cancellation policy?", a: "24 hours notice for a full reschedule. Less than 24 hours, the session is charged. Exceptions for genuine emergencies — I'm reasonable about it." },
];

export default function TrainingFAQ() {
  return (
    <div>
      <PageMeta title="Sailing Lessons FAQ | Brian Cline" description="Common questions about private sailing lessons on San Francisco Bay." />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-4">
            <Link to="/training" className="text-sm text-primary font-medium hover:underline">← Back to Sailing Lessons</Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Sailing Lessons FAQ</h1>
          <p className="text-gray-600 mb-10">Common questions about private sailing instruction on San Francisco Bay.</p>

          <Accordion type="single" collapsible className="space-y-0">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <PageCTA
        title="Ready to Get Started?"
        subtitle="Book a free consultation — no obligation."
        buttonText="Schedule a Consultation"
        href="mailto:brian@briancline.co?subject=Sailing%20Lessons%20-%20Free%20Consultation"
      />
    </div>
  );
}
