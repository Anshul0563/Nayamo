
import { useState } from "react";
import axios from "axios";
import {
  Upload,
  Save,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";

export default function AddProduct() {
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
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
  });

  const changeHandler = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // CLOUDINARY IMAGE UPLOAD
  const uploadImages = async (files) => {
    try {
      setUploading(true);

      const uploaded = [];

      for (const file of files) {
        const data = new FormData();
        data.append("image", file);

        const res = await api.post(
          "/products/upload",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploaded.push(res.data.url);
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const submitHandler = async () => {
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
        image: form.images[0] || "",
        images: form.images,
      };

      await api.post("/products", payload);

      alert("Product Added Successfully 🚀");

      setForm({
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
      });
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Product create failed");
    } finally {
      setLoading(false);
    }
  };

  const Input = ({
    label,
    name,
    type = "text",
    placeholder,
  }) => (
    <div>
      <label className="text-sm text-zinc-300 block mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={changeHandler}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500"
      />
    </div>
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold">
          Add Product
        </h1>

        <p className="text-zinc-400 mt-2">
          Upload images to Cloudinary and add products professionally.
        </p>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* LEFT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="title"
              placeholder="Gold Earrings"
            />

            <Input
              label="Price"
              name="price"
              type="number"
              placeholder="299"
            />

            <Input
              label="Stock"
              name="stock"
              type="number"
              placeholder="10"
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
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none resize-none focus:border-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={submitHandler}
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

        {/* RIGHT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 h-fit sticky top-4">
          <h2 className="text-lg font-semibold mb-4">
            Product Images
          </h2>

          {/* Upload */}
          <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 grid place-items-center cursor-pointer hover:bg-white/5 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) =>
                uploadImages(
                  Array.from(e.target.files)
                )
              }
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
                  : "Click to Upload Images"}
              </p>

              <p className="text-sm text-zinc-400 mt-1">
                Cloudinary Upload
              </p>
            </div>
          </label>

          {/* Preview */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {form.images.map((img, index) => (
              <div
                key={index}
                className="relative group"
              >
                <img
                  src={img}
                  alt="preview"
                  className="w-full h-32 object-cover rounded-2xl border border-white/10"
                />

                <button
                  onClick={() =>
                    removeImage(index)
                  }
                  className="absolute top-2 right-2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Live Card */}
          <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 p-4">
            <h3 className="font-semibold truncate">
              {form.title || "Product Name"}
            </h3>

            <p className="text-emerald-400 font-bold mt-2">
              ₹{form.price || 0}
            </p>

            <p className="text-zinc-400 text-sm mt-2">
              Stock: {form.stock || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}