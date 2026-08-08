import { BadgeCheck } from "lucide-react";
import StarRating from "./StarRating";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getMediaUrl = (media) => {
  if (typeof media === "string") return media;
  return media?.url || media?.secure_url || media?.src || "";
};

const getInitials = (name) => {
  const clean = (name || "N").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Premium review card. Uses neutral base, golden stars, subtle pink/cyan accents.
 * Verified badge renders only when the backend provides a `isVerified` flag.
 */
export default function ReviewCard({ review }) {
  const name = review?.user?.name || "Nayamo Customer";
  const isVerified = Boolean(review?.isVerified);
  const title = review?.title;
  const comment = review?.comment;
  const rating = review?.rating || 0;
  const images = Array.isArray(review?.images) ? review.images : [];
  const videos = Array.isArray(review?.videos) ? review.videos : [];

  const hasMedia = images.length > 0 || videos.length > 0;

  // Compute grid columns for media: videos take a wide cell.
  const mediaCellClass = (index, isVideo) => {
    if (isVideo) return "col-span-full sm:col-span-2";
    return "col-span-1";
  };

  return (
    <article className="group flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#D4A853]/30 hover:bg-white/[0.05] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,168,83,0.08)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#D4A853]/30 bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/10 text-sm font-bold text-[#F0D78C]">
            {getInitials(name)}
            {isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5">
                <BadgeCheck className="h-4 w-4 fill-[#7DD3FC] text-[#070708]" />
              </span>
            )}
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-white">
              {name}
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-[#7DD3FC]/30 bg-[#7DD3FC]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#7DD3FC]">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-500">
              {formatDate(review?.createdAt)}
            </p>
          </div>
        </div>

        <StarRating rating={rating} size={16} />
      </div>

      {/* Title */}
      {title && (
        <h3 className="mt-4 text-base font-semibold leading-snug text-[#FAFAFA]">
          {title}
        </h3>
      )}

      {/* Body */}
      {comment && (
        <p className="mt-2 leading-relaxed text-zinc-300">{comment}</p>
      )}

      {/* Media */}
      {hasMedia && (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          {videos.map((video, index) => (
            <div
              key={`v-${video.publicId || video.url || index}`}
              className={`group/media relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 ${mediaCellClass(
                index,
                true,
              )}`}
            >
              <video
                src={getMediaUrl(video)}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover"
              />
            </div>
          ))}
          {images.map((image, index) => (
            <div
              key={`i-${image.publicId || image.url || index}`}
              className={`relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 ${mediaCellClass(
                index,
                false,
              )}`}
            >
              <img
                src={getMediaUrl(image)}
                alt={`Customer media ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful hint (no fake social buttons) */}
      {typeof review?.helpfulCount === "number" && review.helpfulCount > 0 && (
        <p className="mt-4 text-xs text-zinc-500">
          {review.helpfulCount} found this helpful
        </p>
      )}
    </article>
  );
}
