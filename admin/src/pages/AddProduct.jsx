import { useMemo, useState } from "react";
import axios from "axios";
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
  Sparkles,
} from "lucide-react";

export default function AddProduct() {
  const token = localStorage.getItem("token");

  const api = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:5050/api/admin",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    [token]
  );

  const initialForm = {
    title: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    material: "",
    color: "",
    occasion: "",
    brand: "",
    images: [],
  };

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // -----------------------------
  // HELPERS
  // -----------------------------
  const notify = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const resetForm = () => {
    setForm(initialForm);
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

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateForm = () => {
    if (!form.title.trim()) {
      return "Product name is required";
    }

    if (!form.price || Number(form.price) <= 0) {
      return "Enter valid price";
    }

    if (!form.stock || Number(form.stock) < 0) {
      return "Enter valid stock";
    }

    if (!form.category.trim()) {
      return "Category is required";
    }

    if (!form.description.trim()) {
      return "Description is required";
    }

    if (form.images.length === 0) {
      return "Please upload at least 1 image";
    }

    return null;
  };

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  const uploadImages = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      const uploaded = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const data = new FormData();
        data.append("image", file);

        const res = await api.post("/products/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploaded.push(res.data.url);
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));

      notify("success", "Images uploaded successfully");
    } catch (error) {
      console.log(error.response?.data || error);
      notify("error", "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fileChangeHandler = (e) => {
    uploadImages(Array.from(e.target.files));
  };

  const dropHandler = (e) => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    uploadImages(files);
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
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
        title: form.title,
        name: form.title,
        price: Number(form.price),
        stock: Number(form.stock),
        quantity: Number(form.stock),
        countInStock: Number(form.stock),
        description: form.description,
        category: form.category,
        material: form.material,
        color: form.color,
        occasion: form.occasion,
        brand: form.brand,
        image: form.images[0],
        images: form.images,
      };

      await api.post("/products", payload);

      notify("success", "Product added successfully 🚀");
      resetForm();
    } catch (error) {
      console.log(error.response?.data || error);
      notify("error", "Product create failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI INPUT COMPONENT
  // -----------------------------
  const Input = ({
    label,
    name,
    type = "text",
    placeholder,
    icon,
  }) => (
    <div>
      <label className="text-sm text-zinc-300 block mb-2">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={changeHandler}
          placeholder={placeholder}
          className={`w-full rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500 transition py-3 ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 grid place-items-center">
            <Sparkles size={22} className="text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl md:text-4xl font-bold">
              Add Product
            </h1>

            <p className="text-zinc-400 mt-1">
              Create products with premium admin UI.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {message.text && (
        <div
          className={`rounded-2xl px-4 py-3 border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {message.text}
        </div>
      )}

      <form
        onSubmit={submitHandler}
        className="grid xl:grid-cols-[1fr_360px] gap-6"
      >
        {/* LEFT SIDE */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="title"
              placeholder="Gold Earrings"
              icon={<BadgeInfo size={16} />}
            />

            <Input
              label="Price"
              name="price"
              type="number"
              placeholder="299"
              icon={<IndianRupee size={16} />}
            />

            <Input
              label="Stock"
              name="stock"
              type="number"
              placeholder="10"
              icon={<Package size={16} />}
            />

            <Input
              label="Category"
              name="category"
              placeholder="Jewellery"
            />

            <Input
              label="Brand"
              name="brand"
              placeholder="Nayamo"
            />

            <Input
              label="Material"
              name="material"
              placeholder="Alloy"
            />

            <Input
              label="Color"
              name="color"
              placeholder="Gold"
            />

            <Input
              label="Occasion"
              name="occasion"
              placeholder="Party"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-zinc-300 block mb-2">
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              value={form.description}
              onChange={changeHandler}
              placeholder="Write product details..."
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none resize-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {loading
                ? "Creating..."
                : "Submit Product"}
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 h-fit sticky top-4">
          <h2 className="text-lg font-semibold mb-4">
            Product Images
          </h2>

          {/* Upload Box */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={dropHandler}
            className={`border-2 border-dashed rounded-2xl p-6 grid place-items-center cursor-pointer transition ${
              dragging
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-white/15 hover:bg-white/5"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={fileChangeHandler}
            />

            <div className="text-center">
              {uploading ? (
                <Loader2 className="mx-auto animate-spin mb-3" />
              ) : (
                <ImagePlus className="mx-auto mb-3" />
              )}

              <p className="font-medium">
                {uploading
                  ? "Uploading..."
                  : "Click or Drag Images"}
              </p>

              <p className="text-sm text-zinc-400 mt-1">
                JPG, PNG, WEBP
              </p>
            </div>
          </label>

          {/* Preview */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {form.images.map((img, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-2xl"
              >
                <img
                  src={img}
                  alt="preview"
                  className="w-full h-32 object-cover border border-white/10 group-hover:scale-105 transition duration-300"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Live Preview Card */}
          <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
            {form.images[0] && (
              <img
                src={form.images[0]}
                alt="main"
                className="w-full h-40 object-cover rounded-xl"
              />
            )}

            <h3 className="font-semibold truncate">
              {form.title || "Product Name"}
            </h3>

            <p className="text-emerald-400 font-bold">
              ₹{form.price || 0}
            </p>

            <p className="text-zinc-400 text-sm">
              Stock: {form.stock || 0}
            </p>

            <p className="text-zinc-500 text-xs line-clamp-2">
              {form.description ||
                "Your product preview will appear here."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}