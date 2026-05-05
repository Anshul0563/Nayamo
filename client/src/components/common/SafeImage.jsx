import React, { useState } from "react";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23060607'/%3E%3Cstop offset='1' stop-color='%2318181c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='1000' fill='url(%23g)'/%3E%3Ccircle cx='400' cy='430' r='86' fill='none' stroke='%23D4A853' stroke-width='10' opacity='.55'/%3E%3Cpath d='M315 560h170l-42 58h-86z' fill='%23D4A853' opacity='.55'/%3E%3Ctext x='400' y='690' text-anchor='middle' fill='%23a1a1aa' font-family='Arial, sans-serif' font-size='34'%3ENayamo%3C/text%3E%3C/svg%3E";

const isExternalImage = (src) => {
  if (typeof src !== "string") return false;
  try {
    const url = new URL(src);
    return url.hostname !== window.location.hostname;
  } catch {
    return false;
  }
};

const getImageSrc = (src) => {
  if (!src) return FALLBACK_IMAGE;
  if (typeof src === "string") {
    // If it's an external image, proxy it through our backend
    if (isExternalImage(src)) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      return `${apiUrl}/images/proxy?url=${encodeURIComponent(src)}`;
    }
    return src;
  }
  return src.url || src.secure_url || FALLBACK_IMAGE;
};

export default function SafeImage({
  src,
  alt = "",
  fallbackSrc = FALLBACK_IMAGE,
  loading = "lazy",
  decoding = "async",
  referrerPolicy = "no-referrer",
  crossOrigin,
  onError,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(getImageSrc(src));
  const [failed, setFailed] = useState(false);

  const handleError = (event) => {
    onError?.(event);

    if (!failed) {
      setFailed(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      crossOrigin={crossOrigin}
      onError={handleError}
    />
  );
}

export { FALLBACK_IMAGE, getImageSrc };
