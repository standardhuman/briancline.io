import React from "react";
import { cn } from "../lib/utils";
import OptImage from "./OptImage";

export default function PageHero({ title, subtitle, price, credentials, cta, ctaHref, image, imageAlt, imagePosition = "right", className }) {
  const hasImage = !!image;

  return (
    <section className={cn("relative overflow-hidden bg-gradient-to-br from-[#e0f7fa] via-white to-[#e3f2fd]", className)}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#80deea] rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#90caf9] rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className={cn(
          hasImage && "grid md:grid-cols-2 gap-10 items-center",
          !hasImage && ""
        )}>
          <div className={cn("max-w-3xl", hasImage && "max-w-none", hasImage && imagePosition === "left" && "md:order-2")}>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl">{subtitle}</p>
            )}
            {price && (
              <p className="text-2xl font-bold text-primary mb-2">{price}</p>
            )}
            {credentials && (
              <p className="text-sm text-gray-500 mb-6">{credentials}</p>
            )}
            {cta && (
              <a
                href={ctaHref || "#"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                {cta}
              </a>
            )}
          </div>
          {hasImage && (
            <div className={cn("hidden md:flex justify-center", imagePosition === "left" && "md:order-1")}>
              <OptImage
                src={image}
                alt={imageAlt || ""}
                className="rounded-2xl shadow-xl max-h-[400px] w-auto object-cover"
                loading="eager"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
