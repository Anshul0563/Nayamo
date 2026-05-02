import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#070708] text-white">

      {/* ✨ HEADER */}
      <div className="nayamo-container py-16 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,168,83,0.08),transparent_70%)]" />

        <p className="text-sm uppercase tracking-[0.3em] text-[#D4A853]">
          Privacy
        </p>

        <h1 className="mt-3 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-[#D4A853] bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
          Your privacy matters to us. This policy explains how Nayamo collects,
          uses, and protects your personal information.
        </p>
      </div>

      {/* 📜 CONTENT */}
      <div className="nayamo-container pb-20">
        <div className="max-w-3xl mx-auto space-y-10 text-[#D4D4D8]">

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Information We Collect
            </h2>
            <p className="leading-relaxed">
              When you interact with Nayamo, we may collect personal details
              such as your name, email address, phone number, shipping address,
              billing details, and order history. We may also collect technical
              data such as IP address, browser type, and device information to
              improve your browsing experience.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed">
              We use your information to process and deliver orders, provide
              customer support, manage returns or exchanges, improve our website
              experience, and send order-related updates. We may also use your
              information to send promotional offers (only if you opt in).
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Sharing of Information
            </h2>
            <p className="leading-relaxed">
              Nayamo does not sell or rent your personal data. We may share your
              information with trusted third-party services such as payment
              gateways, delivery partners, and analytics providers, strictly for
              business operations.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Data Security
            </h2>
            <p className="leading-relaxed">
              We take appropriate security measures to protect your personal
              information from unauthorized access, misuse, or disclosure.
              However, no online platform can guarantee complete security.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Cookies & Tracking
            </h2>
            <p className="leading-relaxed">
              Our website may use cookies and similar technologies to enhance
              user experience, analyze traffic, and personalize content. You can
              control cookie preferences through your browser settings.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Your Rights
            </h2>
            <p className="leading-relaxed">
              You have the right to access, update, or delete your personal
              information. You may also opt out of promotional communications at
              any time by contacting us.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Updates to This Policy
            </h2>
            <p className="leading-relaxed">
              Nayamo reserves the right to update this Privacy Policy at any
              time. Changes will be reflected on this page with a revised
              effective date.
            </p>
          </section>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact
              us at:
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