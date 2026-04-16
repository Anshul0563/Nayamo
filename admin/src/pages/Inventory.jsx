
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  Package,
  AlertTriangle,
  Ban,
  IndianRupee,
  Plus,
  Trash2,
  Minus,
  Pencil,
  Save,
  X,
} from "lucide-react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    stock: "",
    image: "",
  });

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: { Authorization: `Bearer ${token}` },
  });

  const getStock = (product) =>
    Number(product.stock ?? product.quantity ?? product.countInStock ?? 0);

  const getName = (product) =>
    product.name || product.title || product.productName || "Untitled Product";

  const getImage = (product) =>
    product.image || product.images?.[0] || "https://via.placeholder.com/100";

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");

      let list = [];

      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data.products)) list = res.data.products;
      else if (Array.isArray(res.data.data)) list = res.data.data;
      else if (res.data.product) list = [res.data.product];

      setProducts(list);
    } catch (error) {
      console.log("Load Products Error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateStock = async (product, newStock) => {
    try {
      setUpdatingId(product._id);

      const stock = Math.max(0, Number(newStock));

      await api.put(`/products/${product._id}`, {
        stock,
        quantity: stock,
        countInStock: stock,
      });

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                stock,
                quantity: stock,
                countInStock: stock,
              }
            : item
        )
      );
    } catch (error) {
      console.log("Stock Update Error:", error.response?.data || error);
      alert("Stock update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log("Delete Error:", error.response?.data || error);
      alert("Delete failed");
    }
  };

  const openEdit = (product) => {
    setEditId(product._id);
    setEditForm({
      title: getName(product),
      price: product.price || "",
      stock: getStock(product),
      image: getImage(product),
    });
  };

  const saveEdit = async () => {
    try {
      const payload = {
        title: editForm.title,
        name: editForm.title,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        quantity: Number(editForm.stock),
        countInStock: Number(editForm.stock),
        image: editForm.image,
      };

      await api.put(`/products/${editId}`, payload);

      setProducts((prev) =>
        prev.map((item) =>
          item._id === editId
            ? {
                ...item,
                ...payload,
              }
            : item
        )
      );

      setEditId(null);
    } catch (error) {
      console.log("Edit Error:", error.response?.data || error);
      alert("Product update failed");
    }
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) =>
        getName(p).toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) => {
        const stock = getStock(p);

        if (filter === "all") return true;
        if (filter === "in_stock") return stock > 5;
        if (filter === "low_stock") return stock > 0 && stock <= 5;
        if (filter === "out_stock") return stock === 0;

        return true;
      });
  }, [products, search, filter]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => getStock(p) > 5).length;
    const low = products.filter((p) => {
      const s = getStock(p);
      return s > 0 && s <= 5;
    }).length;
    const out = products.filter((p) => getStock(p) === 0).length;

    const value = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * getStock(p),
      0
    );

    return { total, inStock, low, out, value };
  }, [products]);

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon size={18} className={color} />
      </div>

      <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${color}`}>
        {value}
      </h2>
    </div>
  );

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white text-2xl">
        Loading Inventory...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">
            Inventory Management
          </h1>
          <p className="text-zinc-400 mt-1">
            Track and manage your products professionally.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full sm:w-72"
            />
          </div>

          <button
            onClick={loadProducts}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Total Products" value={stats.total} icon={Package} color="text-cyan-400" />
        <Card title="Low Stock" value={stats.low} icon={AlertTriangle} color="text-yellow-400" />
        <Card title="Out of Stock" value={stats.out} icon={Ban} color="text-red-400" />
        <Card title="Inventory Value" value={`₹${stats.value}`} icon={IndianRupee} color="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[
          ["all", "All"],
          ["in_stock", "In Stock"],
          ["low_stock", "Low Stock"],
          ["out_stock", "Out of Stock"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-3 rounded-2xl whitespace-nowrap ${
              filter === key
                ? "bg-white text-black font-semibold"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No products found
          </div>
        ) : (
          filtered.map((product) => {
            const name = getName(product);
            const stock = getStock(product);
            const image = getImage(product);

            return (
              <div
                key={product._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
                  {/* Left */}
                  <div className="flex gap-4 min-w-0">
                    <img
                      src={image}
                      alt={name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold truncate">
                        {name}
                      </h3>

                      <p className="text-zinc-400 mt-1">
                        ₹{product.price || 0}
                      </p>

                      <p className="text-sm mt-2">
                        Status:{" "}
                        <span
                          className={
                            stock === 0
                              ? "text-red-400"
                              : stock <= 5
                              ? "text-yellow-400"
                              : "text-green-400"
                          }
                        >
                          {stock === 0
                            ? "Out of Stock"
                            : stock <= 5
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    {/* Stock */}
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => updateStock(product, stock - 1)}
                        disabled={updatingId === product._id}
                        className="px-2 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-[24px] text-center">
                        {stock}
                      </span>

                      <button
                        onClick={() => updateStock(product, stock + 1)}
                        disabled={updatingId === product._id}
                        className="px-2 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(product)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Product</h2>

              <button
                onClick={() => setEditId(null)}
                className="p-2 rounded-xl bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <input
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="Product Name"
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />

            <input
              type="number"
              value={editForm.price}
              onChange={(e) =>
                setEditForm({ ...editForm, price: e.target.value })
              }
              placeholder="Price"
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />

            <input
              type="number"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm({ ...editForm, stock: e.target.value })
              }
              placeholder="Stock"
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />

            <input
              value={editForm.image}
              onChange={(e) =>
                setEditForm({ ...editForm, image: e.target.value })
              }
              placeholder="Image URL"
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />

            <button
              onClick={saveEdit}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}