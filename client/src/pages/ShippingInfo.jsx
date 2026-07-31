import React from "react";
import { CheckCircle2, Clock3, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const deliverySteps = [
  ["Order confirmed", "You will receive your order confirmation right away."],
  ["Carefully packed", "Every piece is inspected and packed securely before dispatch."],
  ["Handed to courier", "We share tracking details as soon as your parcel is on its way."],
  ["Delivered to you", "Follow the delivery updates until your Nayamo order arrives."],
];

export default function ShippingInfo() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070708] text-white">
      <section className="relative border-b border-white/[0.08] py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,83,0.18),transparent_58%)]" />
        <div className="nayamo-container relative text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4A853]/35 bg-[#D4A853]/10 shadow-[0_0_40px_rgba(212,168,83,0.2)]">
            <Truck className="h-7 w-7 text-[#D4A853]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4A853]">Delivery, made simple</p>
          <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Shipping Information</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-zinc-400">
            Your jewellery deserves a careful journey. Here is everything you need to know about dispatch, delivery and tracking your Nayamo order.
          </p>
        </div>
      </section>

      <section className="nayamo-container py-14 md:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [Clock3, "Dispatch in 24 hours", "Most confirmed orders are packed and handed to our courier within one business day."],
            [MapPin, "Delivery across India", "We deliver to serviceable PIN codes across India. Delivery availability is confirmed at checkout."],
            [ShieldCheck, "Secure packaging", "Each order is quality-checked and packaged to keep your jewellery protected in transit."],
          ].map(([Icon, title, text]) => (
            <article key={title} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4A853]/12 text-[#D4A853]"><Icon className="h-5 w-5" /></div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-transparent p-7 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A853]">How it works</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">From our studio to your doorstep</h2>
            <div className="mt-8 space-y-6">
              {deliverySteps.map(([title, text], index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4A853]/35 bg-[#D4A853]/10 text-sm font-bold text-[#D4A853]">{index + 1}</div>
                  <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-relaxed text-zinc-400">{text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border border-[#D4A853]/20 bg-[#D4A853]/[0.06] p-7 md:p-9">
            <PackageCheck className="h-8 w-8 text-[#D4A853]" />
            <h2 className="mt-5 font-serif text-2xl font-bold">Expected delivery time</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">Orders typically reach you in <strong className="text-white">3–7 business days</strong> after dispatch. Remote locations, public holidays and courier disruptions may take a little longer.</p>
            <div className="mt-6 border-t border-[#D4A853]/20 pt-5 text-sm text-zinc-400"><span className="font-medium text-[#D4A853]">Note:</span> Business days exclude Sundays and public holidays.</div>
          </aside>
        </div>

        <section className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 md:p-9">
          <h2 className="font-serif text-3xl font-bold">Shipping essentials</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {[
              ["Track your order", "Once dispatched, your tracking link is sent to the contact details provided at checkout. You can also visit Track Order from the footer."],
              ["Address changes", "Contact us as soon as possible if the shipping address needs updating. Changes are only possible before dispatch."],
              ["Delivery attempts", "Please ensure someone is available at the delivery address. Courier partners may attempt delivery again if the first attempt is missed."],
              ["Need help?", "For delivery questions, contact our support team with your order number and we will be happy to assist."],
            ].map(([title, text]) => <div key={title} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A853]" /><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-zinc-400">{text}</p></div></div>)}
          </div>
        </section>
      </section>
    </main>
  );
}
