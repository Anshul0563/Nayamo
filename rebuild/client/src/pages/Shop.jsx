import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "@/services/api";
import Loader from "@/components/common/Loader";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import EmptyState from "@/components/common/EmptyState";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    price: [0, 5000],
    sort: "newest",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        limit: 12,
      };
      const res = await productAPI.getProducts(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  if (loading) return <Loader />;

  return (
    <div className="py-12">
      <div className="nayamo-container">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <ProductFilters filters={filters} onChange={handleFilterChange} />
          </div>
          <div className="lg:w-3/4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-nayamo-text-primary">Shop Collection</h1>
              <p className="text-nayamo-text-muted">Showing {products.length} products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {products.length === 0 && (
              <EmptyState 
                title="No Products Found"
                subtitle="Try adjusting your filters"
              />
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 bg-nayamo-bg-card rounded-xl border border-nayamo-border-light disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-nayamo-text-primary font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 bg-nayamo-bg-card rounded-xl border border-nayamo-border-light disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

