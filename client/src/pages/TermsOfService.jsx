import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A853]">
            Terms
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-serif font-bold text-white">
            Terms of Service
          </h1>
          <p className="mt-5 text-[#A1A1AA] leading-relaxed">
            By using Nayamo, you agree to provide accurate order information and
            use the website only for lawful purchases and account activity.
          </p>

          <div className="mt-10 space-y-8 text-[#D4D4D8]">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Orders
              </h2>
              <p className="leading-relaxed">
                Orders are confirmed after successful checkout. Availability,
                pricing, and delivery timelines may change before confirmation.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Returns
              </h2>
              <p className="leading-relaxed">
                Unused items may be eligible for return under Nayamo's return
                policy. Returned items must be in their original condition.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Support
              </h2>
              <p className="leading-relaxed">
                For order, payment, or account questions, contact
                support@nayamo.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
