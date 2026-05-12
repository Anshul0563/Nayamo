import React from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#070708] text-white">
      {/* ✨ HEADER */}
      <div className="nayamo-container py-16 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,168,83,0.08),transparent_70%)]" />

        <p className="text-sm uppercase tracking-[0.3em] text-[#D4A853]">
          Customer Care
        </p>

        <h1 className="mt-3 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-[#D4A853] bg-clip-text text-transparent">
          Refund Policy
        </h1>

        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
          At Nayamo, we strive to provide exceptional quality and service. If you are not fully satisfied with your purchase, we are here to help.
        </p>
      </div>

      {/* 📜 CONTENT */}
      <div className="nayamo-container pb-20">
        <div className="max-w-3xl mx-auto space-y-10 text-[#D4D4D8]">

          {/* SECTION 1: RETURN ELIGIBILITY */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Return Eligibility
            </h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                Customers can request a return within <span className="text-[#D4A853] font-semibold">7 days</span> of receiving the product.
              </p>
              <div className="bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#D4A853] mb-2">To be eligible for a return, the item must be:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-[#D4A853] mt-1">✓</span>
                    <span>Unused and unworn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#D4A853] mt-1">✓</span>
                    <span>In original condition and packaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#D4A853] mt-1">✓</span>
                    <span>Accompanied by the original invoice and tags</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 2: NON-RETURNABLE ITEMS */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Non-Returnable Items
            </h2>
            <p className="leading-relaxed mb-4">
              The following items are <span className="text-[#D4A853] font-semibold">not eligible</span> for return or refund:
            </p>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <span className="text-red-400 mt-1">✕</span>
                <span>Customized or personalized jewellery</span>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <span className="text-red-400 mt-1">✕</span>
                <span>Items that have been worn or damaged</span>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <span className="text-red-400 mt-1">✕</span>
                <span>Products without original packaging or invoice</span>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <span className="text-red-400 mt-1">✕</span>
                <span>Items returned after 7 days of purchase</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: REFUND PROCESS */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Refund Process
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Once your return request is approved, you will be guided through the return process with a prepaid shipping label (if applicable). Here's how it works:
              </p>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="text-[#D4A853] font-bold text-lg w-8 h-8 flex items-center justify-center bg-[#D4A853]/20 rounded-full">1</div>
                  <div>
                    <p className="font-semibold text-white">Request Return</p>
                    <p className="text-sm text-zinc-400">Contact us with your order details within 7 days</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-[#D4A853] font-bold text-lg w-8 h-8 flex items-center justify-center bg-[#D4A853]/20 rounded-full">2</div>
                  <div>
                    <p className="font-semibold text-white">Receive Return Label</p>
                    <p className="text-sm text-zinc-400">Get a prepaid shipping label and pack the item securely</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-[#D4A853] font-bold text-lg w-8 h-8 flex items-center justify-center bg-[#D4A853]/20 rounded-full">3</div>
                  <div>
                    <p className="font-semibold text-white">Ship the Product</p>
                    <p className="text-sm text-zinc-400">Send the package to our return address</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-[#D4A853] font-bold text-lg w-8 h-8 flex items-center justify-center bg-[#D4A853]/20 rounded-full">4</div>
                  <div>
                    <p className="font-semibold text-white">Verification & Refund</p>
                    <p className="text-sm text-zinc-400">We inspect the product and process your refund</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: REFUND TIMELINE */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Refund Timeline
            </h2>
            <div className="bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-6">
              <p className="leading-relaxed">
                Refunds are processed within <span className="text-[#D4A853] font-semibold">5–7 business days</span> after the returned product is received, inspected, and verified at our warehouse.
              </p>
              <p className="text-sm text-zinc-400 mt-4">
                <span className="text-[#D4A853] font-semibold">Note:</span> In rare cases, due to courier delays or additional verification, the timeline may extend to 10 business days.
              </p>
            </div>
          </section>

          {/* SECTION 5: REFUND METHOD */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Refund Method
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                The refund amount will be credited to the <span className="text-[#D4A853] font-semibold">original payment method</span> used during the purchase.
              </p>
              <div className="bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-4">
                <p className="text-sm mb-3">
                  <span className="font-semibold text-[#D4A853]">Refund Methods:</span>
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-[#D4A853]">•</span> Credit/Debit Card → Credited to the card (3–5 business days)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#D4A853]">•</span> UPI/Net Banking → Credited to the bank account (1–3 business days)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#D4A853]">•</span> Wallet/Gift Card → Store credit within 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 6: SHIPPING CHARGES */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Shipping Charges
            </h2>
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="leading-relaxed">
                  <span className="text-amber-400 font-semibold">Original shipping charges</span> are <span className="text-amber-400 font-semibold">non-refundable</span>.
                </p>
              </div>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-white">Exception:</span> Shipping charges will be fully refunded if the product received was damaged or incorrect.
              </p>
            </div>
          </section>

          {/* SECTION 7: CONTACT US */}
          <section className="border-l-2 border-[#D4A853] pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Contact Us
            </h2>
            <p className="leading-relaxed mb-6">
              If you have any questions about our Refund Policy or need assistance with a return, please don't hesitate to reach out to our dedicated customer support team.
            </p>
            <div className="grid gap-4">
              {/* EMAIL */}
              <a
                href="mailto:support@nayamo.com"
                className="flex items-start gap-4 bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-4 hover:border-[#D4A853]/50 transition-all duration-300"
              >
                <Mail className="text-[#D4A853] flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p className="text-sm text-[#D4A853] hover:text-white">support@nayamo.in</p>
                </div>
              </a>

              {/* PHONE */}
              <a
                href="tel:+919718176159"
                className="flex items-start gap-4 bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-4 hover:border-[#D4A853]/50 transition-all duration-300"
              >
                <Phone className="text-[#D4A853] flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <p className="text-sm text-[#D4A853] hover:text-white">+91-9718176159</p>
                </div>
              </a>

              {/* LIVE CHAT */}
              <div className="flex items-start gap-4 bg-[#18181C]/60 border border-[#D4A853]/20 rounded-lg p-4">
                <MessageSquare className="text-[#D4A853] flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-white">Live Chat</p>
                  <p className="text-sm text-zinc-400">Available on our website during business hours</p>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL NOTE */}
          <section className="border-2 border-[#D4A853]/30 bg-[#D4A853]/5 rounded-lg p-6 mt-12">
            <p className="text-sm leading-relaxed text-zinc-300">
              <span className="text-[#D4A853] font-semibold">Important:</span> By making a purchase from Nayamo, you acknowledge that you have read, understood, and agreed to the terms of this Refund Policy. We reserve the right to update this policy at any time. For the most current version, please visit this page regularly.
            </p>
          </section>

          {/* FOOTER NOTE */}
          <div className="text-center pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              Last Updated: May 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
