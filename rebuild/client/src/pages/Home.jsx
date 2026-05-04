import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Truck, Shield, Gem, Heart, Sparkles, ArrowUpRight, Zap, Award, Users } from "lucide-react";
import { productAPI } from "@/services/api";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productAPI.getProducts({ limit: 6, sort: "popular" });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8 },
  };

  const staggerChildren = {
    whileInView: {},
    transition: { staggerChildren: 0.15 },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-nayamo-bg-primary overflow-hidden">
      {/* Hero */}
      <motion.section 
        style={{ y: parallaxY }} 
        className="relative min-h-screen flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-nayamo-gold/5 via-transparent to-nayamo-rose/5" />
        <div className="nayamo-container relative z-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-nayamo-gold/10 border border-nayamo-gold/20 text-nayamo-gold text-sm font-medium mb-8">
                Luxury Collection 2026
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8">
                Timeless <span className="bg-gradient-to-r from-nayamo-gold to-yellow-400 bg-clip-text text-transparent">Elegance</span>
              </h1>
              <p className="text-nayamo-text-muted text-xl mb-12 max-w-lg leading-relaxed">
                Discover exquisite artificial jewellery crafted for the discerning.
              </p>
              <div className="flex gap-4">
                <Link to="/shop" className="nayamo-btn-primary">
                  Explore <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link to="/shop?category=party" className="nayamo-btn-secondary">
                  Signature Collection
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop&q=85" 
                  alt="Luxury jewellery"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust badges */}
      <section className="py-16 bg-nayamo-bg-secondary border-y border-nayamo-border-subtle">
        <motion.div 
          {...staggerChildren}
          initial="initial"
          whileInView="whileInView"
          className="nayamo-container grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Gem, title: "Premium Quality", desc: "Crafted with care" },
            { icon: Shield, title: "Lifetime Warranty", desc: "Quality guaranteed" },
            { icon: Truck, title: "Express Shipping", desc: "24hr dispatch" },
            { icon: Heart, title: "Customer First", desc: "Satisfaction assured" },
          ].map((badge, i) => (
            <motion.div key={i} {...staggerItem} className="flex items-center gap-4 p-4 group">
              <div className="w-16 h-16 rounded-2xl bg-nayamo-gold/10 border border-nayamo-gold/20 flex items-center justify-center group-hover:bg-nayamo-gold/20 transition-all">
                <badge.icon className="w-7 h-7 text-nayamo-gold group-hover:scale-110" />
              </div>
              <div>
                <p className="font-semibold text-nayamo-text-primary group-hover:text-nayamo-gold">{badge.title}</p>
                <p className="text-sm text-nayamo-text-muted">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-28">
        <motion.div {...fadeInUp} className="text-center mb-20">
          <span className="text-nayamo-rose text-sm font-semibold uppercase tracking-wider">Curated Collections</span>
          <h2 className="nayamo-section-title mt-4">Choose Your Style</h2>
        </motion.div>
        <div className="nayamo-container grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Evening Glamour", desc: "Bold & sophisticated", color: "from-nayamo-gold to-yellow-400", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&q=80" },
            { title: "Everyday Chic", desc: "Subtle & elegant", color: "from-nayamo-rose to-pink-400", img: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=500&h=600&q=80" },
            { title: "Cultural Heritage", desc: "Traditional & festive", color: "from-nayamo-gold to-nayamo-rose", img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=600&q=80" },
          ].map((cat, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="group">
              <Link to={`/shop?category=${cat.title.toLowerCase().replace(/ /g, '-')}`} className="block aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl border hover:border-nayamo-gold/20 transition-all duration-500">
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-nayamo-bg-primary/95" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} mx-auto mb-6 flex items-center justify-center shadow-xl`}>
                    <Gem className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{cat.title}</h3>
                  <p>{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-28 bg-nayamo-bg-secondary">
        <motion.div {...fadeInUp} className="text-center mb-20">
          <span className="text-nayamo-gold text-sm font-semibold uppercase tracking-wider">Featured</span>
          <h2 className="nayamo-section-title mt-4">Luxury Highlights</h2>
        </motion.div>
        <div className="nayamo-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div 
              key={product._id}
              whileHover={{ y: -10 }}
              className="group nayamo-glass rounded-3xl p-8 border hover:border-nayamo-gold/30 transition-all"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-xl group-hover:scale-105 transition-transform">
                <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-nayamo-text-primary mb-2 group-hover:text-nayamo-gold">
                {product.title}
              </h3>
              <p className="text-nayamo-text-muted text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-nayamo-gold">
                  ₹{product.price}
                </span>
                <Link to={`/product/${product._id}`} className="text-nayamo-gold font-medium hover:text-yellow-400">
                  View <ArrowRight className="w-4 h-4 inline ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <EmptyState 
              title="No Products" 
              subtitle="Come back later for amazing jewellery"
              action={<Link to="/shop" className="nayamo-btn-primary mt-4 inline-block">Shop Now</Link>}
            />
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-28">
        <div className="nayamo-container max-w-2xl mx-auto text-center">
          <div className="nayamo-glass rounded-3xl p-12 border backdrop-blur-xl">
            <h2 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-6">
              Join the <span className="text-nayamo-gold">Elite Circle</span>
            </h2>
            <p className="text-nayamo-text-muted text-lg mb-10">
              Be first to discover exclusive collections and VIP offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="your@email.com"
                className="nayamo-input flex-1"
              />
              <button className="nayamo-btn-primary">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

