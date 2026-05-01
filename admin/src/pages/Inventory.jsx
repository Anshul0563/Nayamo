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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Tag,
} from "lucide-react";
import ExportButton from "../components/ExportButton";

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

const CATEGORIES = ["party", "daily", "traditional", "western", "statement", "bridal"];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selected, setSelected] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

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

  const loadProducts = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getProducts({
        page: currentPage,
        limit: 20,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        sortBy,
        sortOrder,
      });
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.products || res.data.products || []);
      setProducts(list);
      setPage(res.data.pagination?.currentPage || 1);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.totalItems || list.length);

      // Calculate category stats from all products (simplified client-side for now)
      const stats = {};
      list.forEach(p => {
        const cat = p.category || 'uncategorized';
        stats[cat] = (stats[cat] || 0) + 1;
      });
      setCategoryStats(stats);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const updateStock = async (product, delta) => {
    try {
      setActionLoading(product._id);
      const newStock = Math.max(0, (product.stock || 0) + delta);
      await adminAPI.updateProduct(product._id, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, stock: newStock } : p))
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update stock");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setActionLoading(id);
      await adminAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSelected((prev) => prev.filter((sid) => sid !== id));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected products?`)) return;

    try {
      setActionLoading("bulk");
      for (const id of selected) {
        await adminAPI.deleteProduct(id);
      }
      setProducts((prev) => prev.filter((p) => !selected.includes(p._id)));
      setSelected([]);
    } catch (error) {
      setError(error.response?.data?.message || "Bulk delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditForm({
      title: product.title || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      description: product.description || "",
      category: product.category || "",
      images: product.images || [],
    });
  };

  const saveEdit = async () => {
    try {
      setSavingEdit(true);
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
        prev.map((p) => (p._id === editId ? { ...p, ...payload } : p))
      );
      setEditId(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  const uploadImages = async (files) => {
    try {
      setUploading(true);
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await adminAPI.uploadImage(formData);
        uploaded.push({ url: res.data.url, publicId: res.data.publicId });
      }
      setEditForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
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

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === products.length) {
      setSelected([]);
    } else {
      setSelected(products.map((p) => p._id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-zinc-500" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-indigo-400" />
    ) : (
      <ArrowDown size={14} className="text-indigo-400" />
    );
  };

  const exportData = useMemo(() => {
    return products.map((p) => ({
      id: p._id,
      title: p.title,
      category: p.category,
      price: p.price,
      stock: p.stock,
      status: p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock",
    }));
  }, [products]);

  const filteredProducts = products;

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
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Inventory</h1>
          <p className="text-zinc-400 mt-1">Manage stock, pricing, and product details.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full sm:w-64"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <ExportButton filename="inventory" data={exportData} />

          <button
            onClick={() => loadProducts(page)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryStats).map(([cat, count]) => (
          <div
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition ${
              categoryFilter === cat
                ? "bg-white text-black border-white"
                : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
            }`}
          >
            <Tag size={12} className="inline mr-1" />
            {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <button
            onClick={bulkDelete}
            disabled={actionLoading === "bulk"}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Bulk Delete
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-zinc-400 hover:text-white ml-auto underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="p-4 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("title")}>
                  <span className="flex items-center gap-1">Product <SortIcon field="title" /></span>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("category")}>
                  <span className="flex items-center gap-1">Category <SortIcon field="category" /></span>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("price")}>
                  <span className="flex items-center gap-1">Price <SortIcon field="price" /></span>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("stock")}>
                  <span className="flex items-center gap-1">Stock <SortIcon field="stock" /></span>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-white/10 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-zinc-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE}
                          alt={product.title}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-800"
                        />
                        <div>
                          <p className="font-medium text-white">{product.title}</p>
                          <p className="text-xs text-zinc-500">ID: {product._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-white/10 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 font-semibold">₹{product.price}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateStock(product, -1)}
                          disabled={actionLoading === product._id}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? "text-red-400"
                              : product.stock <= 5
                              ? "text-yellow-400"
                              : "text-white"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          onClick={() => updateStock(product, 1)}
                          disabled={actionLoading === product._id}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          disabled={actionLoading === product._id}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadProducts(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadProducts(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button onClick={() => setEditId(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <Field label="Product Name" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                <Field label="Price" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} type="number" />
                <Field label="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} type="number" />
                <Field label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="party, daily, etc." />

                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Description</label>
                  <textarea
                    rows={3}
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
        </div>
      )}
    </div>
  );
}
