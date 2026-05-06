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
    return (
  <div className="space-y-4 sm:space-y-6 text-white overflow-hidden px-3 sm:px-0">
    
    {/* ERROR */}
    {error && (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>

        <button
          onClick={() => setError("")}
          className="sm:ml-auto underline text-left"
        >
          Dismiss
        </button>
      </div>
    )}

    {/* HEADER */}
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 md:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between overflow-hidden">
      
      {/* LEFT */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
          Inventory
        </h1>

        <p className="text-zinc-400 mt-1 text-sm sm:text-base">
          Manage stock, pricing, and product details.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        
        {/* SEARCH */}
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
            className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full sm:w-64"
          />
        </div>

        {/* CATEGORY */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none text-sm w-full sm:w-auto"
        >
          <option value="">
            All Categories
          </option>

          {CATEGORIES.map((cat) => (
            <option
              key={cat}
              value={cat}
            >
              {cat.charAt(0).toUpperCase() +
                cat.slice(1)}
            </option>
          ))}
        </select>

        {/* EXPORT */}
        <div className="w-full sm:w-auto">
          <ExportButton
            filename="inventory"
            data={exportData}
          />
        </div>

        {/* REFRESH */}
        <button
          onClick={() =>
            loadProducts(page)
          }
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>
    </div>

    {/* CATEGORY STATS */}
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {Object.entries(categoryStats).map(
        ([cat, count]) => (
          <div
            key={cat}
            onClick={() =>
              setCategoryFilter(
                cat === categoryFilter
                  ? ""
                  : cat,
              )
            }
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border cursor-pointer transition ${
              categoryFilter === cat
                ? "bg-white text-black border-white"
                : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
            }`}
          >
            <Tag
              size={12}
              className="inline mr-1"
            />

            {cat.charAt(0).toUpperCase() +
              cat.slice(1)}{" "}
            ({count})
          </div>
        ),
      )}
    </div>

    {/* BULK ACTIONS */}
    {selected.length > 0 && (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        
        <span className="text-sm font-medium">
          {selected.length} selected
        </span>

        <button
          onClick={bulkDelete}
          disabled={
            actionLoading === "bulk"
          }
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
        >
          <Trash2 size={14} />
          Bulk Delete
        </button>

        <button
          onClick={() =>
            setSelected([])
          }
          className="text-sm text-zinc-400 hover:text-white sm:ml-auto underline text-left"
        >
          Clear
        </button>
      </div>
    )}

    {/* TABLE */}
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      
      {/* MOBILE CARDS */}
      <div className="block lg:hidden">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({
              length: 5,
            }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="p-10 text-center text-zinc-500">
            No products found
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-4">
            {filteredProducts.map(
              (product) => (
                <div
                  key={product._id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex gap-3">
                    <img
                      src={
                        imageUrl(
                          product.images?.[0],
                        ) ||
                        PLACEHOLDER_IMAGE
                      }
                      alt={
                        product.title
                      }
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">
                            {
                              product.title
                            }
                          </h3>

                          <p className="text-xs text-zinc-500">
                            ID:{" "}
                            {product._id.slice(
                              -6,
                            )}
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={selected.includes(
                            product._id,
                          )}
                          onChange={() =>
                            toggleSelect(
                              product._id,
                            )
                          }
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-white/10 capitalize">
                          {
                            product.category
                          }
                        </span>

                        <span className="text-emerald-400 font-semibold">
                          ₹
                          {
                            product.price
                          }
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        
                        {/* STOCK */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateStock(
                                product,
                                -1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                          >
                            <Minus
                              size={
                                14
                              }
                            />
                          </button>

                          <span
                            className={`font-semibold ${
                              product.stock ===
                              0
                                ? "text-red-400"
                                : product.stock <=
                                  5
                                ? "text-yellow-400"
                                : "text-white"
                            }`}
                          >
                            {
                              product.stock
                            }
                          </span>

                          <button
                            onClick={() =>
                              updateStock(
                                product,
                                1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                          >
                            <Plus
                              size={
                                14
                              }
                            />
                          </button>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              startEdit(
                                product,
                              )
                            }
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                          >
                            <Pencil
                              size={
                                14
                              }
                            />
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(
                                product._id,
                              )
                            }
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400"
                          >
                            <Trash2
                              size={
                                14
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto">
        {/* TERA SAME TABLE CODE */}
      </div>
    </div>

    {/* PAGINATION */}
    {totalPages > 1 && (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        
        <button
          onClick={() =>
            loadProducts(page - 1)
          }
          disabled={page <= 1}
          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="text-zinc-400 text-sm sm:text-base">
          Page {page} of{" "}
          {totalPages}
        </span>

        <button
          onClick={() =>
            loadProducts(page + 1)
          }
          disabled={
            page >= totalPages
          }
          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center gap-1"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    )}
  </div>
);
  );
}
