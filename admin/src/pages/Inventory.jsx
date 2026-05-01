import { useEffect, useMemo, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  Search,
  RefreshCcw,
  AlertTriangle,
  Plus,
  Trash2,
  Minus,
  Pencil,
  Save,
  X,
  ImagePlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-zinc-400 block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500"
      />
    </div>
  );
}

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2327272a'/%3E%3Ctext x='50' y='50' font-size='12' fill='%2371717a' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

const imageUrl = (image) => (typeof image === "string" ? image : image?.url);

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    images: [],
  });

  const debouncedSearch = useDebounce(search, 300);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getProducts({ limit: 100 });
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.products || res.data.products || []);
      setProducts(list);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateStock = async (product, delta) => {
    try {
      setActionLoading(product._id);
      const newStock = Math.max(0, (product.stock || 0) + delta);

      await adminAPI.updateProduct(product._id, { stock: newStock });

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, stock: newStock } : item
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Stock update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone."))
      return;

    try {
      setActionLoading(id);
      await adminAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (product) => {
    setEditId(product._id);
    setEditForm({
      title: product.title || "",
      price: product.price || "",
      stock: product.stock || "",
      description: product.description || "",
      category: product.category || "",
      images: product.images?.length > 0 ? [...product.images] : [],
    });
    setError("");
  };

  const uploadImages = async (files) => {
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

      setEditForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));
    } catch (error) {
      setError(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const saveEdit = async () => {
    try {
      setSavingEdit(true);
      setError("");

      const payload = {
        title: editForm.title,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        description: editForm.description,
        category: editForm.category,
        images: editForm.images,
      };

      await adminAPI.updateProduct(editId, payload);

      setProducts((prev) =>
        prev.map((item) => (item._id === editId ? { ...item, ...payload } : item))
      );

      setEditId(null);
    } catch (error) {
      setError(error.response?.data?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const name = (p.title || p.name || "").toLowerCase();
        if (!debouncedSearch) return true;
        return name.includes(debouncedSearch.toLowerCase());
      })
      .filter((p) => {
        const stock = Number(p.stock ?? 0);
        if (filter === "all") return true;
        if (filter === "in_stock") return stock > 5;
        if (filter === "low_stock") return stock > 0 && stock <= 5;
        if (filter === "out_stock") return stock === 0;
        return true;
      });
  }, [products, debouncedSearch, filter]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-400" };
    if (stock <= 5) return { label: "Low Stock", color: "text-yellow-400" };
    return { label: "In Stock", color: "text-emerald-400" };
  };

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold">Inventory</h1>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock ({'>'}5)</option>
            <option value="low_stock">Low Stock (1-5)</option>
            <option value="out_stock">Out of Stock</option>
          </select>

          <button
            onClick={loadProducts}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No products found
          </div>
        ) : (
          filtered.map((product) => {
            const stock = Number(product.stock ?? 0);
            const status = getStockStatus(stock);

            return (
              <div
                key={product._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
              >
                <div className="flex gap-4">
                  <img
                    src={imageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE}
                    alt={product.title || "Product"}
                    className="w-20 h-20 rounded-2xl object-cover bg-zinc-800"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />

                  <div>
                    <h3 className="text-xl font-semibold">{product.title || "Untitled"}</h3>
                    <p className="text-zinc-400">₹{product.price}</p>
                    <p className={`text-sm mt-1 ${status.color}`}>
                      {status.label}: {stock}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateStock(product, -1)}
                    disabled={actionLoading === product._id || stock <= 0}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>

                  <button
                    onClick={() => updateStock(product, 1)}
                    disabled={actionLoading === product._id}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => openEdit(product)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(product._id)}
                    disabled={actionLoading === product._id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT MODAL */}
      {editId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-zinc-950 p-6 grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <button onClick={() => setEditId(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                  <X size={18} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Product Name"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <Field label="Price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                <Field label="Stock" type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
                <Field label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">Description</label>
                <textarea
                  rows="5"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
                />
              </div>

              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>

            {/* Right */}
            <div>
              <h3 className="font-semibold mb-4">Product Images</h3>

              <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 grid place-items-center cursor-pointer hover:bg-white/5 transition">
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => uploadImages(Array.from(e.target.files))}
                />
                {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              </label>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {editForm.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={imageUrl(img)} alt="" className="w-full h-28 object-cover rounded-2xl" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-black/90"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
                {editForm.images[0] && (
                  <img src={imageUrl(editForm.images[0])} alt="" className="w-full h-40 object-cover rounded-xl" />
                )}
                <h3 className="font-semibold truncate">{editForm.title || "Product Name"}</h3>
                <p className="text-emerald-400 font-bold">₹{editForm.price || 0}</p>
                <p className="text-zinc-400 text-sm">Stock: {editForm.stock || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
