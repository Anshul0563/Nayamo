import { AnimatePresence, motion } from "framer-motion";
import { Camera, Play, X } from "lucide-react";
import { useMemo, useState } from "react";

const getMediaUrl = (media) => {
  if (typeof media === "string") return media;
  return media?.url || media?.secure_url || media?.src || "";
};

/**
 * Horizontal "Customer photos & videos" strip.
 * Renders nothing (returns null) when there is no media at all.
 * Clicking a thumbnail opens a lightweight fullscreen preview.
 *
 * @param {Array} reviews - Approved reviews (each may carry images/videos)
 */
export default function ReviewMedia({ reviews = [] }) {
  const [preview, setPreview] = useState(null);

  const items = useMemo(() => {
    const list = [];
    (reviews || []).forEach((review) => {
      (review?.images || []).forEach((img) => {
        if (getMediaUrl(img)) {
          list.push({
            type: "image",
            src: getMediaUrl(img),
            reviewId: review._id,
          });
        }
      });
      (review?.videos || []).forEach((video) => {
        if (getMediaUrl(video)) {
          list.push({
            type: "video",
            src: getMediaUrl(video),
            reviewId: review._id,
          });
        }
      });
    });
    return list;
  }, [reviews]);

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="nayamo-divider mb-6" />
      <div className="mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-[#D4A853]" />
        <h3 className="text-lg font-bold text-white sm:text-xl">
          Customer photos &amp; videos
        </h3>
        <span className="rounded-full border border-[#D4A5A5]/25 bg-[#D4A5A5]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ECC5C5]">
          {items.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 sm:gap-4">
        {items.map((item, index) => (
          <button
            key={`${item.reviewId}-${index}`}
            type="button"
            onClick={() => setPreview(item)}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30 transition-all duration-300 hover:border-[#D4A853]/50 hover:shadow-[0_8px_24px_rgba(212,168,83,0.2)] sm:h-28 sm:w-28"
            aria-label={
              item.type === "video"
                ? `Open review video ${index + 1}`
                : `Open review photo ${index + 1}`
            }
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                className="h-full w-full object-cover"
                preload="metadata"
                muted
                playsInline
              />
            ) : (
              <img
                src={item.src}
                alt={`Customer review media ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            )}
            {item.type === "video" && (
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover:bg-black/20">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[#7DD3FC]/50 bg-black/50">
                  <Play className="ml-0.5 h-4 w-4 fill-[#7DD3FC] text-[#7DD3FC]" />
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightweight preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Review media preview"
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/[0.15] bg-white/[0.05] text-white transition hover:bg-white/[0.12]"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            {preview.type === "video" ? (
              <video
                src={preview.src}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] max-w-full rounded-2xl"
              />
            ) : (
              <img
                src={preview.src}
                alt="Review media preview"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
