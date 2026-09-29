import React, { useMemo, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Minus,
  Plus, ShieldCheck, ShoppingBag, Sparkles, Truck, X
} from "lucide-react";
import "./styles.css";

const IMAGES = [
  "https://inspiring-parfait-e5f70a.netlify.app/1.png",
  "https://inspiring-parfait-e5f70a.netlify.app/2.png",
  "https://inspiring-parfait-e5f70a.netlify.app/3.png",
  "https://inspiring-parfait-e5f70a.netlify.app/4.png",
  "https://inspiring-parfait-e5f70a.netlify.app/5.png"
  
];

const benefits = [
  ["✨", "Intense Skin Brightening", "Vitamin C and antioxidant-rich ingredients help support a more even-looking, radiant complexion."],
  ["💧", "Deep Hydration & Repair", "Helps replenish moisture and leaves skin feeling soft, smooth and nourished."],
  ["🌿", "Antioxidant Care", "Sea buckthorn is naturally rich in antioxidants and essential fatty acids."],
  ["🌸", "Lightweight & Non-Greasy", "A fast-absorbing facial oil designed to fit easily into a daily skincare routine."]
];

const steps = [
  ["01", "Cleanse", "Wash your face and gently pat dry."],
  ["02", "Apply", "Take 2–4 drops onto your fingertips."],
  ["03", "Massage", "Gently massage over face and neck using upward motions."],
  ["04", "Use Daily", "Use morning and night as part of your routine."]
];

function App() {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", district:"", municipality:"", address:"" });

  const total = useMemo(() => qty * 1000, [qty]);

  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const [sending, setSending] = useState(false);

  const submitOrder = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.district || !form.municipality || !form.address) {
      toast("Please fill all required fields.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: qty,
          total
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order could not be sent.");
      }

      toast(`Order submitted successfully! Order ID: ${data.orderId}`);
      setOrderOpen(false);
      setForm({ name:"", phone:"", district:"", municipality:"", address:"" });
      setQty(1);
    } catch (error) {
      console.error(error);
      toast(error.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <span>✨ Free shipping</span><span>•</span><span>Cash on Delivery available</span>
        <span>•</span><span>7-day easy replacement</span>
      </div>
      <main>
        <section className="hero">
          <div className="gallery">
            <div className="thumbs">
              {IMAGES.map((img, i) => (
                <button className={`thumb ${active === i ? "active" : ""}`} key={img} onClick={() => setActive(i)}>
                  <img src={img} alt={`Product view ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="mainImageWrap">
              <img className="mainImage" src={IMAGES[active]} alt="Sea Buckthorn Serum" />
              <button className="galleryArrow left" onClick={() => setActive((active - 1 + IMAGES.length) % IMAGES.length)}><ChevronLeft/></button>
              <button className="galleryArrow right" onClick={() => setActive((active + 1) % IMAGES.length)}><ChevronRight/></button>
            </div>
          </div>

          <div className="heroCopy">
            <h1>Sea Buckthorn Face Serum for <em>Radiant & Glowing Skin</em></h1>
            <p className="subhead">Brightening & Hydrating Facial Oil Serum</p>

            <div className="rating"><span>★★★★★</span> <b>4.9</b> <small>• 1,200+ customer reviews</small></div>

            <div className="priceRow">
              <strong>Rs. 1000</strong>
              <del>Rs. 1,899</del>
              <span>Save Rs. 700</span>
            </div>

            <p className="description">
              Transform your skincare routine with the nourishing power of Sea Buckthorn.
              Packed with essential fatty acids and antioxidants, this lightweight serum
              helps hydrate, nourish and support naturally radiant-looking skin.
            </p>

            <div className="qtyRow">
              <span>Quantity</span>
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16}/></button>
                <b>{qty}</b>
                <button onClick={() => setQty(qty + 1)}><Plus size={16}/></button>
              </div>
              <button className="primaryCta" onClick={() => setOrderOpen(true)}>
              <ShoppingBag size={20}/> Order Now — Cash on Delivery 
            </button>
            </div>

            <div className="trust !flex justify-between mx-8">
              <div><MessageCircle/> WhatsApp order</div>
              <div><Truck/> Cash on delivery</div>
              <div><ShieldCheck/> 7 Days Replacement</div>
            </div>
          </div>
        </section>
        
        <section >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:mx-34">
              {/* Left Side */}
              <div className="p-8">
                <div className="sectionHead">
                  <span className="kicker">WHY YOU'LL LOVE IT</span>
                  <h2>
                    Simple care. <em>Natural glow.</em>
                  </h2>
                  <p>Designed for an easy everyday skincare routine.</p>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map(([icon, title, text]) => (
                  <article className="benefit" key={title}>
                    <div className="benefitIcon">{icon}</div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>

              {/* Right Side */}
              <div className="p-8">
                <div className="howCopy">
                  <span className="kicker">HOW TO USE</span>
                  <h2>Your 4-step <em>glow routine</em></h2>
                  <div className="steps">
                    {steps.map(([num, title, text]) => (
                      <div className="step" key={num}>
                        <div className="stepNum">{num}</div>
                        <div><h3>{title}</h3><p>{text}</p></div>
                      </div>
                    ))}
                  </div>
                  <button className="outlineCta" onClick={() => setOrderOpen(true)}>Start your routine <ArrowRight size={18}/></button>
                </div>
              </div>
            </div>
          </section>
      </main>

      {orderOpen && (
        <div className="modalBackdrop" onMouseDown={(e) => e.target === e.currentTarget && setOrderOpen(false)}>
          <div className="orderModal">
            <button className="close" onClick={() => setOrderOpen(false)}><X/></button>
            <div className="modalTop">
              <span className="kicker">PLACE YOUR ORDER</span>
              <h2>Cash on Delivery</h2>
            </div>

            <div className="orderSummary">
              <div><span>Product</span><b>Sea Buckthorn Serum</b></div>
              <div><span>Quantity</span><b>{qty}</b></div>
              <div><span>Total</span><b>Rs. {total}</b></div>
            </div>

            <form onSubmit={submitOrder}>
              <label>Full name *<input value={form.name} onChange={e => change("name", e.target.value)} placeholder="Your full name"/></label>
              <label>Phone number *<input value={form.phone} onChange={e => change("phone", e.target.value)} placeholder="98XXXXXXXX" inputMode="tel"/></label>
              <div className="twoCol">
                <label>District / जिल्ला *<input value={form.district} onChange={e => change("district", e.target.value)} placeholder="e.g. Kathmandu"/></label>
                <label>Municipality / नगरपालिका *<input value={form.municipality} onChange={e => change("municipality", e.target.value)} placeholder="e.g. Kathmandu"/></label>
              </div>
              <label>Village / गाऊँ *<textarea value={form.address} onChange={e => change("address", e.target.value)} placeholder="Tole, ward no., landmark..." rows=""/></label>
              <button className="primaryCta bg- !w-full !bg-[#25d366]" type="submit" disabled={sending}>
                 <ShoppingBag size={20}/>
                {sending ? "Sending Order..." : "Confirm Your Order Now !!"}
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
