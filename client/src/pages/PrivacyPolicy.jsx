import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A853]">
            Privacy
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-serif font-bold text-white">
            Privacy Policy
          </h1>
          <p className="mt-5 text-[#A1A1AA] leading-relaxed">
            Nayamo uses customer information only to process orders, provide
            support, improve the shopping experience, and share order-related
            updates. We do not sell personal information.
          </p>

          <div className="mt-10 space-y-8 text-[#D4D4D8]">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Information We Collect
              </h2>
              <p className="leading-relaxed">
                We may collect your name, email, phone number, delivery address,
                order details, and payment status when you place an order or
                contact us.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                How We Use It
              </h2>
              <p className="leading-relaxed">
                Your information helps us confirm orders, arrange delivery,
                manage returns, respond to support requests, and keep your
                account secure.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Contact
              </h2>
              <p className="leading-relaxed">
                For privacy questions, contact us at support@nayamo.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
