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
  ImagePlus,
  Loader2,
  BadgeInfo,
} from "lucide-react";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400 block mb-2">
        {label}
      </label>

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

export default function Inventory() {
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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const [editId, setEditId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editForm, setEditForm] = useState({
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

  const getStock = (p) =>
    Number(p.stock ?? p.quantity ?? p.countInStock ?? 0);

  const getName = (p) =>
    p.name || p.title || "Untitled Product";

  const getImage = (p) =>
    p.image ||
    p.images?.[0] ||
    "https://via.placeholder.com/100";

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products");

      let list = [];

      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data.products))
        list = res.data.products;
      else if (Array.isArray(res.data.data))
        list = res.data.data;

      setProducts(list);
    } catch (error) {
      console.log(error.response?.data || error);
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
      alert("Stock update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);

      setProducts((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      alert("Delete failed");
    }
  };

  const openEdit = (product) => {
    setEditId(product._id);

    setEditForm({
      title: getName(product),
      price: product.price || "",
      stock: getStock(product),
      description: product.description || "",
      category: product.category || "",
      material: product.material || "",
      color: product.color || "",
      occasion: product.occasion || "",
      brand: product.brand || "",
      images:
        product.images?.length > 0
          ? product.images
          : product.image
          ? [product.image]
          : [],
    });
  };

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
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        uploaded.push(res.data.url);
      }

      setEditForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const saveEdit = async () => {
    try {
      setSavingEdit(true);

      const payload = {
        title: editForm.title,
        name: editForm.title,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        quantity: Number(editForm.stock),
        countInStock: Number(editForm.stock),
        description: editForm.description,
        category: editForm.category,
        material: editForm.material,
        color: editForm.color,
        occasion: editForm.occasion,
        brand: editForm.brand,
        image: editForm.images[0] || "",
        images: editForm.images,
      };

      await api.put(`/products/${editId}`, payload);

      setProducts((prev) =>
        prev.map((item) =>
          item._id === editId
            ? { ...item, ...payload }
            : item
        )
      );

      setEditId(null);
    } catch (error) {
      alert("Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) =>
        getName(p)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter((p) => {
        const stock = getStock(p);

        if (filter === "all") return true;
        if (filter === "in_stock") return stock > 5;
        if (filter === "low_stock")
          return stock > 0 && stock <= 5;
        if (filter === "out_stock")
          return stock === 0;

        return true;
      });
  }, [products, search, filter]);

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold">
          Inventory
        </h1>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />
          </div>

          <button
            onClick={loadProducts}
            className="px-5 py-3 rounded-2xl bg-indigo-600"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-4">
        {filtered.map((product) => (
          <div
            key={product._id}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
          >
            <div className="flex gap-4">
              <img
                src={getImage(product)}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover"
              />

              <div>
                <h3 className="text-xl font-semibold">
                  {getName(product)}
                </h3>

                <p className="text-zinc-400">
                  ₹{product.price}
                </p>

                <p className="text-sm mt-1">
                  Stock: {getStock(product)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  updateStock(
                    product,
                    getStock(product) - 1
                  )
                }
                className="px-3 py-2 rounded-xl bg-white/10"
              >
                <Minus size={16} />
              </button>

              <button
                onClick={() =>
                  updateStock(
                    product,
                    getStock(product) + 1
                  )
                }
                className="px-3 py-2 rounded-xl bg-white/10"
              >
                <Plus size={16} />
              </button>

              <button
                onClick={() => openEdit(product)}
                className="px-4 py-2 rounded-xl bg-blue-600 flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() =>
                  deleteProduct(product._id)
                }
                className="px-4 py-2 rounded-xl bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-zinc-950 p-6 grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Edit Product
                </h2>

                <button
                  onClick={() => setEditId(null)}
                  className="p-2 rounded-xl bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Product Name"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      title: e.target.value,
                    })
                  }
                />

                <Field
                  label="Price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: e.target.value,
                    })
                  }
                />

                <Field
                  label="Stock"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stock: e.target.value,
                    })
                  }
                />

                <Field
                  label="Category"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                    })
                  }
                />

                <Field
                  label="Brand"
                  value={editForm.brand}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      brand: e.target.value,
                    })
                  }
                />

                <Field
                  label="Material"
                  value={editForm.material}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      material: e.target.value,
                    })
                  }
                />

                <Field
                  label="Color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      color: e.target.value,
                    })
                  }
                />

                <Field
                  label="Occasion"
                  value={editForm.occasion}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      occasion: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
                />
              </div>

              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2"
              >
                {savingEdit ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                Save Changes
              </button>
            </div>

            {/* Right */}
            <div>
              <h3 className="font-semibold mb-4">
                Product Images
              </h3>

              <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 grid place-items-center cursor-pointer hover:bg-white/5 transition">
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    uploadImages(
                      Array.from(
                        e.target.files
                      )
                    )
                  }
                />

                {uploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ImagePlus />
                )}
              </label>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {editForm.images.map(
                  (img, index) => (
                    <div
                      key={index}
                      className="relative"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-28 object-cover rounded-2xl"
                      />

                      <button
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Live Preview */}
              <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
                {editForm.images[0] && (
                  <img
                    src={editForm.images[0]}
                    alt=""
                    className="w-full h-40 object-cover rounded-xl"
                  />
                )}

                <h3 className="font-semibold truncate">
                  {editForm.title ||
                    "Product Name"}
                </h3>

                <p className="text-emerald-400 font-bold">
                  ₹{editForm.price || 0}
                </p>

                <p className="text-zinc-400 text-sm">
                  Stock:{" "}
                  {editForm.stock || 0}
                </p>

                <p className="text-zinc-500 text-xs line-clamp-2">
                  {editForm.description ||
                    "Preview here"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}