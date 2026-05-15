import React from "react";
import PageMeta from "../components/PageMeta";
import Markdown from "../components/Markdown";
import { ACTIVE_VERSION, TERMS_OF_SERVICE } from "./legal/terms-content";

export default function Terms() {
  const doc = TERMS_OF_SERVICE[ACTIVE_VERSION];

  return (
    <div className="min-h-screen bg-white">
      <PageMeta
        title="Terms of Service — SailorSkills"
        description="SailorSkills Terms of Service. Service description, pricing and estimates, recurring charge authorization, cancellation, and dispute resolution."
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-gray-500">
          Version {ACTIVE_VERSION} · Effective {doc.effectiveDate}
        </p>
        <Markdown source={doc.body} />
        <p className="mt-12 text-sm text-gray-500">
          Questions? Email{" "}
          <a href="mailto:diving@briancline.co" className="text-[#0073a8] underline">
            diving@briancline.co
          </a>
          .
        </p>
      </div>
    </div>
  );
}
