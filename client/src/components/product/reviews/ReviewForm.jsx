import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Star, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const MAX_REVIEW_IMAGES = 3;
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;
const REVIEW_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_REVIEW_VIDEOS = 1;
const MAX_REVIEW_VIDEO_SIZE = 50 * 1024 * 1024;
const REVIEW_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

/**
 * Review submission form. Reuses the existing submission flow.
 * @param {object} props
 * @param {function} onClose       - close the form
 * @param {function} onSubmit      - async fn(payload) -> Promise; payload is FormData if media else object
 * @param {boolean}  submitting    - submission in progress
 * @param {string}   error         - submission error message
 */
export default function ReviewForm({ onClose, onSubmit, submitting, error }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mediaError, setMediaError] = useState("");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const previewsRef = useRef(new Set());

  const revokePreview = useCallback((preview) => {
    if (
      preview &&
      previewsRef.current.has(preview) &&
      typeof URL !== "undefined" &&
      typeof URL.revokeObjectURL === "function"
    ) {
      URL.revokeObjectURL(preview);
      previewsRef.current.delete(preview);
    }
  }, []);

  const clearAll = useCallback(() => {
    previewsRef.current.forEach((preview) => {
      if (
        typeof URL !== "undefined" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        URL.revokeObjectURL(preview);
      }
    });
    previewsRef.current.clear();
    setImages([]);
    setVideos([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    setMediaError("");
  }, []);

  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const imageKeys = new Set(images.map((i) => i.key));
    const videoKeys = new Set(videos.map((v) => v.key));
    const remainingImageSlots = MAX_REVIEW_IMAGES - images.length;
    const remainingVideoSlots = MAX_REVIEW_VIDEOS - videos.length;
    const acceptedImages = [];
    const acceptedVideos = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      const fileKey = getFileKey(file);
      const type = (file.type || "").toLowerCase();
      const isImage = REVIEW_IMAGE_TYPES.has(type);
      const isVideo = REVIEW_VIDEO_TYPES.has(type);

      if (!isImage && !isVideo) {
        errors.push(
          `${file.name} must be a JPG, PNG, WebP image or MP4, WebM, MOV, AVI video.`,
        );
        return;
      }

      if (isImage) {
        if (file.size > MAX_REVIEW_IMAGE_SIZE) {
          errors.push(`${file.name} is larger than 5 MB.`);
          return;
        }
        if (imageKeys.has(fileKey)) {
          errors.push(`${file.name} has already been added.`);
          return;
        }
        if (acceptedImages.length >= remainingImageSlots) {
          errors.push(
            `You can add up to ${MAX_REVIEW_IMAGES} photos to a review.`,
          );
          return;
        }
        imageKeys.add(fileKey);
        acceptedImages.push({ file, key: fileKey });
      } else {
        if (file.size > MAX_REVIEW_VIDEO_SIZE) {
          errors.push(`${file.name} is larger than 50 MB.`);
          return;
        }
        if (videoKeys.has(fileKey)) {
          errors.push(`${file.name} has already been added.`);
          return;
        }
        if (acceptedVideos.length >= remainingVideoSlots) {
          errors.push(
            `You can add up to ${MAX_REVIEW_VIDEOS} video to a review.`,
          );
          return;
        }
        videoKeys.add(fileKey);
        acceptedVideos.push({ file, key: fileKey });
      }
    });

    if (acceptedImages.length > 0) {
      const withPreviews = acceptedImages.map(({ file, key }) => {
        const preview =
          typeof URL !== "undefined" &&
          typeof URL.createObjectURL === "function"
            ? URL.createObjectURL(file)
            : "";
        if (preview) previewsRef.current.add(preview);
        return { file, key, preview };
      });
      setImages((cur) => [...cur, ...withPreviews]);
    }
    if (acceptedVideos.length > 0) {
      const withPreviews = acceptedVideos.map(({ file, key }) => {
        const preview =
          typeof URL !== "undefined" &&
          typeof URL.createObjectURL === "function"
            ? URL.createObjectURL(file)
            : "";
        if (preview) previewsRef.current.add(preview);
        return { file, key, preview };
      });
      setVideos((cur) => [...cur, ...withPreviews]);
    }

    setMediaError(errors.join(" "));
  };

  const removeImage = (key) => {
    setImages((cur) => {
      const img = cur.find((i) => i.key === key);
      revokePreview(img?.preview);
      return cur.filter((i) => i.key !== key);
    });
    setMediaError("");
  };

  const removeVideo = (key) => {
    setVideos((cur) => {
      const v = cur.find((i) => i.key === key);
      revokePreview(v?.preview);
      return cur.filter((i) => i.key !== key);
    });
    setMediaError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    const payload = {
      title: title.trim() || trimmedComment.substring(0, 30) || "User Review",
      rating: Number(rating),
      comment: trimmedComment,
    };

    const hasMedia = images.length > 0 || videos.length > 0;

    if (hasMedia) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) =>
        formData.append(key, String(value)),
      );
      images.forEach(({ file }) => formData.append("images", file));
      videos.forEach(({ file }) => formData.append("videos", file));
      onSubmit(formData);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <AnimatePresence>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="rounded-3xl border border-[#D4A853]/25 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-white">Share your review</h3>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Star rating"
          >
            {Array.from({ length: 5 }).map((_, index) => {
              const ratingValue = index + 1;
              return (
                <button
                  key={ratingValue}
                  type="button"
                  disabled={submitting}
                  onClick={() => setRating(ratingValue)}
                  className="p-1 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`${ratingValue} star rating`}
                  role="radio"
                  aria-checked={ratingValue === Number(rating)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      ratingValue <= Number(rating)
                        ? "fill-[#D4A853] text-[#D4A853]"
                        : "text-zinc-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="nayamo-input mb-3"
          maxLength={80}
          disabled={submitting}
        />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you liked, how it looked, and how it felt to wear."
          className="min-h-32 w-full resize-y rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#D4A853]/60"
          maxLength={2000}
          required
          disabled={submitting}
        />

        <div className="mt-4 rounded-2xl border border-dashed border-white/[0.14] bg-black/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="review-media"
                className="text-sm font-semibold text-white"
              >
                Media Upload <span className="text-zinc-500">(optional)</span>
              </label>
              <p id="review-media-help" className="mt-1 text-xs text-zinc-400">
                Add up to {MAX_REVIEW_IMAGES} photos (JPG, PNG, or WebP, 5 MB
                each) and {MAX_REVIEW_VIDEOS} video (MP4, WebM, MOV, or AVI, 50
                MB).
              </p>
            </div>
            <label
              htmlFor="review-media"
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D4A853]/40 px-4 py-2.5 text-sm font-semibold text-[#F0D78C] transition hover:bg-[#D4A853]/10 ${
                submitting ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <ImagePlus className="h-4 w-4" />
              Upload media
            </label>
            <input
              ref={imageInputRef}
              id="review-media"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.avi"
              multiple
              disabled={
                submitting ||
                (images.length >= MAX_REVIEW_IMAGES &&
                  videos.length >= MAX_REVIEW_VIDEOS)
              }
              onChange={handleChange}
              className="sr-only"
              aria-describedby={
                mediaError
                  ? "review-media-help review-media-error"
                  : "review-media-help"
              }
            />
          </div>

          {(images.length > 0 || videos.length > 0) && (
            <ul
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              aria-label="Selected review media"
            >
              {images.map((image) => (
                <li
                  key={image.key}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.1] bg-black/30"
                >
                  {image.preview ? (
                    <img
                      src={image.preview}
                      alt={`Preview of ${image.file.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center px-2 text-center text-xs text-zinc-400">
                      {image.file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.key)}
                    disabled={submitting}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${image.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {videos.map((video) => (
                <li
                  key={video.key}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.1] bg-black/30"
                >
                  {video.preview ? (
                    <video
                      src={video.preview}
                      controls
                      playsInline
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center px-2 py-10 text-center text-xs text-zinc-400">
                      {video.file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeVideo(video.key)}
                    disabled={submitting}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${video.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {mediaError && (
            <p
              id="review-media-error"
              role="alert"
              className="mt-3 text-sm text-red-200"
            >
              {mediaError}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              clearAll();
              onClose();
            }}
            disabled={submitting}
            className="rounded-2xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#D4A853] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#F0D78C] disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
