import React, { useState } from "react";
import { ChevronDown, CircleHelp, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  COD_UNAVAILABLE_MESSAGE,
  usePaymentOptions,
} from "../context/PaymentOptionsContext";

export default function FAQ() {
  const { codEnabled } = usePaymentOptions();
  const [open, setOpen] = useState(0);
  const [category, setCategory] = useState("All");
  const faqs = [
    ["Orders", "How do I place an order?", "Choose your favourite piece, add it to your bag and complete checkout with your shipping details and preferred payment method."],
    ["Orders", "Can I change or cancel an order?", "Please contact us as soon as possible with your order number. We can help only if the order has not already been dispatched."],
    ["Shipping", "How long will my order take to arrive?", "Most orders are dispatched within 24 hours and are delivered within 3–7 business days after dispatch, depending on your location."],
    ["Shipping", "How can I track my delivery?", "Once your order is dispatched, we send tracking information to the contact details used at checkout. You can also use the Track Order page."],
    [
      "Payments",
      "Which payment methods can I use?",
      codEnabled === false
        ? COD_UNAVAILABLE_MESSAGE
        : codEnabled === null
          ? "Payment options are being checked."
          : "Available payment methods are shown at checkout and may include UPI, cards, net banking and Cash on Delivery where eligible.",
    ],
    ["Returns", "What is the return window?", "Return requests can be made within 7 days of delivery for eligible, unused items in their original packaging. See our Refund Policy for complete details."],
    ["Products", "How should I care for my jewellery?", "Keep it dry, avoid contact with perfume and chemicals, and store it separately in a soft pouch after use."],
    ["Support", "How can I contact Nayamo?", "Visit our Contact Us page or reach out with your order details. Our support team will help you with any question."],
  ];
  const categories = ["All", ...new Set(faqs.map(([group]) => group))];
  const visible = faqs.filter(([group]) => category === "All" || group === category);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070708] text-white">
      <section className="relative border-b border-white/[0.08] py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,165,165,0.14),transparent_56%)]" />
        <div className="nayamo-container relative text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4A853]/35 bg-[#D4A853]/10"><CircleHelp className="h-7 w-7 text-[#D4A853]" /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4A853]">Help centre</p>
          <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-zinc-400">Quick answers about orders, delivery, payments and caring for your Nayamo jewellery.</p>
        </div>
      </section>

      <section className="nayamo-container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((item) => <button key={item} onClick={() => { setCategory(item); setOpen(-1); }} className={`rounded-full px-4 py-2 text-sm transition-colors ${category === item ? "bg-[#D4A853] font-semibold text-black" : "border border-white/[0.1] bg-white/[0.035] text-zinc-300 hover:border-[#D4A853]/40 hover:text-white"}`}>{item}</button>)}
          </div>
          <div className="space-y-3">
            {visible.map(([group, question, answer]) => {
              const id = `${group}-${question}`;
              const expanded = open === id;
              return <article key={id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition-colors hover:border-[#D4A853]/25">
                <button className="flex w-full items-center gap-4 px-5 py-5 text-left" onClick={() => setOpen(expanded ? -1 : id)} aria-expanded={expanded}>
                  <span className="shrink-0 rounded-full bg-[#D4A853]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4A853]">{group}</span>
                  <span className="flex-1 font-medium text-white">{question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#D4A853] transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <div className="border-t border-white/[0.06] px-5 py-5 pl-[5.75rem] text-sm leading-relaxed text-zinc-400">{answer}</div>}
              </article>;
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-[#D4A853]/20 bg-gradient-to-r from-[#D4A853]/10 to-[#D4A5A5]/10 p-7 text-center">
            <MessageCircle className="mx-auto h-7 w-7 text-[#D4A853]" />
            <h2 className="mt-3 text-xl font-semibold">Still need help?</h2>
            <p className="mt-2 text-sm text-zinc-400">Our support team is here to help with your question.</p>
            <Link to="/contact" className="mt-5 inline-flex rounded-full bg-[#D4A853] px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
