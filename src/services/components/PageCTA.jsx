import React from "react";
import { Button } from "./ui/button";

export default function PageCTA({ title, subtitle, buttonText, href, variant = "primary" }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary to-[#0097a7] rounded-2xl p-10 md:p-14 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-white/80 mb-8 text-lg">{subtitle}</p>}
          <a
            href={href || "mailto:brian@briancline.co"}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-lg"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
