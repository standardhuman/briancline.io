import React from "react";

/**
 * Serves WebP with JPG/PNG fallback.
 * Assumes a .webp sibling exists for the given src.
 */
export default function OptImage({ src, alt, className, loading = "lazy", ...props }) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt || ""} className={className} loading={loading} {...props} />
    </picture>
  );
}
