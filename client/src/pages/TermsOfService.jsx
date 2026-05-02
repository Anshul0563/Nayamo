import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#070708] text-white">

      {/* ✨ HEADER */}
      <div className="nayamo-container py-16 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,168,83,0.08),transparent_70%)]" />

        <p className="text-sm uppercase tracking-[0.3em] text-[#D4A853]">
          Terms
        </p>

        <h1 className="mt-3 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-[#D4A853] bg-clip-text text-transparent">
          Terms of Service
        </h1>

        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
          By accessing or using Nayamo, you agree to comply with the following
          terms and conditions. Please read them carefully before making a purchase.
        </p>
      </div>

      {/* 📜 CONTENT */}
      <div className="nayamo-container pb-20">
        <div className="max-w-3xl mx-auto space-y-10 text-[#D4D4D8]">

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Use of Website
            </h2>
            <p className="leading-relaxed">
              You agree to use this website only for lawful purposes. You must
              provide accurate information when placing orders or creating an
              account. Any misuse, fraudulent activity, or unauthorized access
              may result in account suspension.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Orders & Payments
            </h2>
            <p className="leading-relaxed">
              All orders are subject to availability and confirmation. Prices,
              product descriptions, and availability may change without prior
              notice. Payment must be completed before order processing. Nayamo
              reserves the right to cancel or refuse any order if necessary.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Shipping & Delivery
            </h2>
            <p className="leading-relaxed">
              Delivery timelines are estimates and may vary depending on your
              location and external factors. Nayamo is not responsible for delays
              caused by courier services or unforeseen circumstances.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Returns & Refunds
            </h2>
            <p className="leading-relaxed">
              Returns are accepted only for unused products in original condition,
              subject to our return policy. Refunds will be processed after
              inspection and approval. Certain items may not be eligible for return.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Intellectual Property
            </h2>
            <p className="leading-relaxed">
              All content on this website, including images, designs, logos, and
              text, is the property of Nayamo and protected by applicable laws.
              Unauthorized use or reproduction is strictly prohibited.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              Nayamo is not liable for any indirect, incidental, or consequential
              damages arising from the use of this website or products purchased
              through it.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We reserve the right to update or modify these Terms of Service at
              any time. Continued use of the website after changes implies your
              acceptance of the updated terms.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Contact Us
            </h2>
            <p className="leading-relaxed">
              For any questions regarding these terms, please contact us at:
            </p>
            <p className="mt-2 text-[#D4A853] font-medium">
              support@nayamo.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}