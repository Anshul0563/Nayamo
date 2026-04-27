import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, Shield, Gem, Heart } from "lucide-react";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import Loader, { SkeletonGrid } from "../components/common/Loader";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productAPI.getProducts({ page: 1 }),
          productAPI.getProducts({ sort: "newest", page: 1 }),
        ]);
        setFeatured(featRes.data?.data?.products?.slice(0, 4) || []);
        setNewArrivals(newRes.data?.data?.products?.slice(0, 4) || []);
      } catch (err) {
        console.error("Home products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#D4A853] blur-[120px]" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-amber-700 blur-[120px]" />
        </div>
        <div className="nayamo-container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#D4A853] text-sm font-medium mb-6">
                New Collection 2025
              </span>
