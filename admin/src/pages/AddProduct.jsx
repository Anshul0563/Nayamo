import { useState } from "react";
import { adminAPI } from "../services/api";

import {
  AlertCircle,
  BadgeInfo,
  CheckCircle2,
  Crown,
  ImagePlus,
  IndianRupee,
  Loader2,
  Package,
  Save,
  X,
} from "lucide-react";

function Input({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-luxury-dim">{label}</label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="luxury-input h-12 pl-10 pr-4 focus:border-gold-400/50 focus:shadow-gold-sm"
        />
      </div>
    </div>
  );
}

const VALID_CATEGORIES = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

const JEWELLERY_TYPES = [
  { value: "earrings", label: "Earrings" },
  { value: "necklaces", label: "Necklaces" },
  { value: "rings", label: "Rings" },
  { value: "bracelets", label: "Bracelets" },
  { value: "bangles", label: "Bangles" },
  { value: "anklets", label: "Anklets" },
  { value: "sets", label: "Jewellery Sets" },
  { value: "other", label: "Other" },
];

const VALID_JEWELLERY_TYPES = [
  "earrings",
  "necklaces",
  "rings",
  "bracelets",
  "bangles",
  "anklets",
  "sets",
  "other",
];

const imageUrl = (image) => (typeof image === "string" ? image : image?.url);

export default function AddProduct() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    jewelleryType: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const notify = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      stock: "",
      description: "",
      category: "",
      jewelleryType: "",
      images: [],
    });
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Product name is required";

    if (!form.price || Number(form.price) <= 0) return "Enter valid price";

    if (form.stock === "" || Number(form.stock) < 0) return "Enter valid stock";

    if (!form.category.trim()) return "Category is required";

    if (!VALID_CATEGORIES.includes(form.category.toLowerCase())) {
      return "Category must be party, daily, traditional, western, statement, or bridal";
    }

    if (!form.jewelleryType.trim()) return "Jewellery Type is required";

    if (!VALID_JEWELLERY_TYPES.includes(form.jewelleryType.toLowerCase())) {
      return "Jewellery Type must be earrings, necklaces, rings, bracelets, bangles, anklets, sets, or other";
    }

    if (!form.description.trim()) return "Description is required";

    if (form.images.length === 0) return "Please upload at least 1 image";

    return null;
  };

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      const uploaded = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const data = new FormData();

        data.append("image", file);

        const res = await adminAPI.uploadImage(data);

        uploaded.push({
          url: res.data.url,
          publicId: res.data.publicId,
        });
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));

      notify("success", `${uploaded.length} image(s) uploaded successfully ✨`);
    } catch (error) {
      notify("error", error.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const errorText = validateForm();

    if (errorText) {
      notify("error", errorText);

      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),

        price: Number(form.price),

        stock: Number(form.stock),

        description: form.description.trim(),

        category: form.category.toLowerCase(),

        jewelleryType: form.jewelleryType.toLowerCase(),

        images: form.images,
      };

      await adminAPI.createProduct(payload);

      notify(
        "success",
        "Product created successfully! ✨ Ready for Nayamo luxury collection.",
      );

      resetForm();
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container overflow-hidden px-3 sm:px-4">
      <div className="glass-card border-gold-animated overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gold-gradient shadow-gold-lg border-gold-animated">
            <Crown size={24} className="font-bold text-black" />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-text">
              Add Luxury Product
            </h1>

            <p className="mt-1 text-sm sm:text-base lg:text-lg text-luxury-dim">
              Create exquisite jewelry pieces for Nayamo collection
            </p>
          </div>
        </div>

        {/* ALERT */}
        {message.text && (
          <div
            className={`glass-card mb-6 flex items-center gap-3 rounded-2xl border p-3 sm:p-4 ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/5 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}

            <span className="text-sm sm:text-base">{message.text}</span>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={submitHandler}
          className="grid gap-6 lg:gap-8 xl:grid-cols-[1fr_380px]"
        >
          {/* LEFT */}
          <div className="space-y-6">
            {/* INPUTS */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Input
                label="Product Title *"
                name="title"
                value={form.title}
                onChange={changeHandler}
                placeholder="18K Gold Diamond Necklace"
                icon={<BadgeInfo size={16} />}
              />

              <Input
                label="Price (₹) *"
                name="price"
                type="number"
                value={form.price}
                onChange={changeHandler}
                placeholder="125000"
                icon={<IndianRupee size={16} />}
              />

              <Input
                label="Stock Quantity *"
                name="stock"
                type="number"
                value={form.stock}
                onChange={changeHandler}
                placeholder="15"
                icon={<Package size={16} />}
              />

              <Input
                label="Category *"
                name="category"
                value={form.category}
                onChange={changeHandler}
                placeholder="party | daily | traditional | western | statement | bridal"
              />

              <div>
                <label className="mb-2 block text-sm text-luxury-dim">
                  Jewellery Type *
                </label>

                <div className="relative">
                  <select
                    name="jewelleryType"
                    value={form.jewelleryType}
                    onChange={changeHandler}
                    className="luxury-input h-12 w-full appearance-none pl-4 pr-10 focus:border-gold-400/50 focus:shadow-gold-sm"
                  >
                    <option value="" disabled>
                      Select jewellery type
                    </option>
                    {JEWELLERY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-3 block text-sm font-medium text-luxury-dim">
                Product Description *
              </label>

              <textarea
                rows="6"
                name="description"
                value={form.description}
                onChange={changeHandler}
                placeholder="Describe the luxury craftsmanship..."
                className="luxury-input h-32 sm:h-40 w-full resize-none focus:shadow-gold-md"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="luxury-btn luxury-btn-secondary w-full flex-1 px-6 sm:px-8 py-3"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading || uploading}
                className="luxury-btn luxury-btn-primary shadow-gold-lg hover:shadow-gold-xl flex w-full flex-1 items-center justify-center gap-2 px-6 sm:px-8 py-3 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Add to Collection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="mt-2 space-y-6 xl:mt-0 xl:pl-8">
            {/* IMAGE UPLOAD */}
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <ImagePlus size={20} />
                Luxury Product Images *
              </h3>

              <label className="glass-card border-gold-500/30 hover:border-gold-400/50 group cursor-pointer rounded-2xl border-2 border-dashed p-5 sm:p-8 transition-all hover:shadow-gold-sm">
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => uploadImages(Array.from(e.target.files))}
                />

                <div className="text-center">
                  {uploading ? (
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold-400" />
                  ) : (
                    <>
                      <ImagePlus
                        size={40}
                        className="group-hover:animate-sparkle mx-auto mb-3 text-gold-400"
                      />

                      <p className="mb-1 font-medium text-luxury-text">
                        Upload Images
                      </p>

                      <p className="text-sm text-luxury-dim">
                        High-res jewelry photos (JPG, PNG, up to 10MB)
                      </p>
                    </>
                  )}
                </div>
              </label>

              {/* PREVIEW IMAGES */}
              {form.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {form.images.map((img, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={imageUrl(img)}
                        alt="preview"
                        className="h-28 sm:h-32 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-xl bg-rose-500/90 p-1.5 text-white opacity-0 transition-all hover:bg-rose-600 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE PREVIEW */}
            <div className="glass-card border-gold-animated hover:shadow-gold-lg rounded-2xl p-4 sm:p-6 transition-all">
              <h4 className="text-gold-gradient mb-4 font-semibold">
                Live Preview
              </h4>

              {form.images[0] ? (
                <img
                  src={imageUrl(form.images[0])}
                  alt="main preview"
                  className="shadow-gold-sm hover:shadow-gold-md mb-4 h-40 sm:h-48 w-full rounded-2xl object-cover transition-all"
                />
              ) : (
                <div className="bg-luxury-surface/50 mb-4 flex h-40 sm:h-48 w-full items-center justify-center rounded-2xl">
                  <Crown size={32} className="text-gold-400/50" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-display truncate text-lg sm:text-xl font-bold">
                  {form.title || "Nayamo Masterpiece"}
                </h3>

                <p className="text-gold-gradient text-2xl font-bold">
                  ₹{form.price || "0"}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      Number(form.stock) === 0
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    Stock: {form.stock || 0}
                  </span>

                  {form.category && (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-luxury-dim">
                      {form.category}
                    </span>
                  )}

                  {form.jewelleryType && (
                    <span className="rounded-full bg-[#D4A853]/15 px-2 py-1 text-xs text-[#D4A853]">
                      {form.jewelleryType}
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-luxury-dim">
                  {form.description ||
                    "Crafted with unparalleled luxury for the modern connoisseur..."}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
