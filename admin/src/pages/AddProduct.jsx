import { useState } from "react";
import { adminAPI } from "../services/api";
import {
  Save,
  Loader2,
  ImagePlus,
  X,
  IndianRupee,
  Package,
  BadgeInfo,
  CheckCircle2,
  AlertCircle,
  Crown,
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
      <label className="text-sm text-luxury-dim block mb-2">{label}</label>
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
          className="luxury-input focus:shadow-gold-sm focus:border-gold-400/50 pl-10 pr-4 h-12"
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
const imageUrl = (image) => (typeof image === "string" ? image : image?.url);

export default function AddProduct() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      stock: "",
      description: "",
      category: "",
      images: [],
    });
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        uploaded.push({ url: res.data.url, publicId: res.data.publicId });
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
    <div className="page-container">
      <div className="glass-card p-8 rounded-3xl border-gold-animated">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold-lg border-gold-animated">
            <Crown size={24} className="text-black font-bold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-text">
              Add Luxury Product
            </h1>
            <p className="text-lg text-luxury-dim mt-1">
              Create exquisite jewelry pieces for Nayamo collection
            </p>
          </div>
        </div>

        {/* Alert */}
        {message.text && (
          <div
            className={`glass-card p-4 rounded-2xl border flex items-center gap-3 mb-6 ${
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
            {message.text}
          </div>
        )}

        <form
          onSubmit={submitHandler}
          className="grid xl:grid-cols-[1fr_380px] gap-8"
        >
          {/* Main Form */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>

            <div>
              <label className="text-sm text-luxury-dim block mb-3 font-medium">
                Product Description *
              </label>
              <textarea
                rows="6"
                name="description"
                value={form.description}
                onChange={changeHandler}
                placeholder="Describe the luxury craftsmanship..."
                className="luxury-input w-full resize-none focus:shadow-gold-md h-40"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="luxury-btn luxury-btn-secondary px-8 py-3 flex-1"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="luxury-btn luxury-btn-primary px-8 py-3 flex-1 shadow-gold-lg hover:shadow-gold-xl font-semibold flex items-center justify-center gap-2"
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

          {/* Images & Preview */}
          <div className="space-y-6 xl:pl-8">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImagePlus size={20} />
                Luxury Product Images *
              </h3>
              <label className="glass-card p-8 rounded-2xl border-2 border-dashed border-gold-500/30 hover:border-gold-400/50 cursor-pointer transition-all hover:shadow-gold-sm group">
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
                        className="mx-auto mb-3 text-gold-400 group-hover:animate-sparkle"
                      />
                      <p className="text-luxury-text font-medium mb-1">
                        Upload Images
                      </p>
                      <p className="text-sm text-luxury-dim">
                        High-res jewelry photos (JPG, PNG, up to 10MB)
                      </p>
                    </>
                  )}
                </div>
              </label>

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {form.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl(img)}
                        alt="preview"
                        className="h-32 w-full object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-rose-500/90 hover:bg-rose-600 p-1.5 rounded-xl text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Preview Card */}
            <div className="glass-card p-6 rounded-2xl border-gold-animated hover:shadow-gold-lg transition-all">
              <h4 className="font-semibold mb-4 text-gold-gradient">
                Live Preview
              </h4>
              {form.images[0] ? (
                <img
                  src={imageUrl(form.images[0])}
                  alt="main preview"
                  className="w-full h-48 object-cover rounded-2xl mb-4 shadow-gold-sm hover:shadow-gold-md transition-all"
                />
              ) : (
                <div className="w-full h-48 bg-luxury-surface/50 rounded-2xl flex items-center justify-center mb-4">
                  <Crown size={32} className="text-gold-400/50" />
                </div>
              )}
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl truncate">
                  {form.title || "Nayamo Masterpiece"}
                </h3>
                <p className="text-2xl font-bold text-gold-gradient">
                  ₹{form.price || "0"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      Number(form.stock) === 0
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    Stock: {form.stock || 0}
                  </span>
                  {form.category && (
                    <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-luxury-dim">
                      {form.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-luxury-dim line-clamp-2 leading-relaxed mt-2">
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
