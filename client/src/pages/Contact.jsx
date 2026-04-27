import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { contactAPI } from "../services/api";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["Nayamo Earrings", "Mumbai, Maharashtra", "India - 400001"],
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91 98765 43210", "Mon - Sat, 10am - 7pm"],
  },
  {
    icon: Mail,
    title: "Email Us",
    lines: ["support@nayamo.com", "care@nayamo.com"],
  },
];

const faqs = [
  {
    q: "How long does shipping take?",
    a: "We ship within 24 hours. Delivery typically takes 3-5 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day easy return policy for all unused items.",
  },
  {
    q: "Are your earrings hypoallergenic?",
    a: "Yes! All our earrings are nickel-free and skin-safe.",
  },
  {
    q: "Do you offer COD?",
    a: "Absolutely. Cash on Delivery is available on all orders across India.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await contactAPI.sendMessage(form);
      if (res.data.success) {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="bg-[#070708]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D4A853]/5 to-transparent blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#D4A5A5]/5 to-transparent blur-[100px]" />
        </div>

        <div className="nayamo-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A853]/8 border border-[#D4A853]/15 text-[#D4A853] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Get in Touch
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              We&apos;d Love to Hear <br />
              <span className="nayamo-text-gold">From You</span>
            </h1>

            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              Have a question about our products, need styling advice, or want
              to collaborate? Our team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-[#0A0A0C] border-y border-white/[0.04]">
        <div className="nayamo-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="nayamo-card p-8 text-center border border-white/[0.04]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4A853]/8 border border-[#D4A853]/10 flex items-center justify-center mx-auto mb-5">
                  <info.icon className="w-6 h-6 text-[#D4A853]" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">
                  {info.title}
                </h3>

                {info.lines.map((line) => (
                  <p key={line} className="text-sm text-[#A1A1AA]">
                    {line}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-24">
        <div className="nayamo-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Left Side Form */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65 }}
            >
              <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
                Send a Message
              </span>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-3 mb-8">
                Drop Us a Line
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="nayamo-card p-10 text-center border border-green-500/20"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-green-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    Message Sent!
                  </h3>

                  <p className="text-[#A1A1AA]">
                    Thank you for reaching out. We&apos;ll get back to you within
                    24 hours.
                  </p>

                  <button
                    onClick={resetForm}
                    className="mt-6 text-sm text-[#D4A853] hover:text-[#E0B86A] transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="nayamo-input disabled:opacity-50"
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="nayamo-input disabled:opacity-50"
                    />
                  </div>

                  <input
                    name="subject"
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="nayamo-input disabled:opacity-50"
                  />

                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    disabled={loading}
                    className="nayamo-input resize-none disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="nayamo-btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Right Side FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="space-y-6"
            >
              <div className="nayamo-card p-8 border border-white/[0.04]">
                <h3 className="text-lg font-semibold text-white mb-5">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-5">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border-b border-white/[0.04] pb-5 last:border-0"
                    >
                      <p className="font-medium text-white text-sm mb-1.5 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#D4A853]" />
                        {faq.q}
                      </p>

                      <p className="text-sm text-[#A1A1AA] leading-relaxed pl-6">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nayamo-card p-6 flex items-center gap-4 border border-white/[0.04]">
                <div className="w-12 h-12 rounded-xl bg-[#D4A853]/8 border border-[#D4A853]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#D4A853]" />
                </div>

                <div>
                  <p className="font-semibold text-white">Quick Response</p>
                  <p className="text-sm text-[#A1A1AA]">
                    We typically respond to all inquiries within 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

