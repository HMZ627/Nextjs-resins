'use client';

import { useState } from 'react';
import MoltenMetal from '../components/MoltenMetal';

export default function Home() {
  const INSTAGRAM_URL = "https://instagram.com/resin_dreambyrimsha";
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

  // Products List
  const products = [
    {
      id: 'rings',
      name: 'Resin Rings',
      description: 'Custom color combinations, flakes, and crystal clear resin bands.',
      price: 'PKR 1,200',
      image: '/images/resin-rings.jpg',
    },
    {
      id: 'clocks',
      name: 'Resin Clocks',
      description: 'Handcrafted ocean and molten effect wall clocks.',
      price: 'PKR 4,500',
      image: '/images/resin-clocks.jpg',
    },
    {
      id: 'shields',
      name: 'Resin Shields',
      description: 'Statement display shields and custom preserved floral pieces.',
      price: 'PKR 6,000',
      image: '/images/resin-shields.jpg',
    },
  ];

  // Order Form State
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Send Order Payload to Discord Webhook
  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!WEBHOOK_URL) {
      setStatusMsg({
        text: 'Discord Webhook URL is missing! Check NEXT_PUBLIC_DISCORD_WEBHOOK_URL in .env.local',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg({ text: 'Sending order notification to Discord...', type: 'info' });

    const payload = {
      embeds: [
        {
          title: '🛒 New Order - Resins By R',
          color: 0xff9ffc,
          fields: [
            { name: 'Product', value: selectedProduct.name, inline: true },
            { name: 'Price', value: selectedProduct.price, inline: true },
            { name: 'Customer Name', value: customerName || 'Not provided', inline: false },
            { name: 'Phone / Contact', value: customerPhone || 'Not provided', inline: true },
            { name: 'JazzCash Transaction ID / Proof', value: transactionId || 'Pending', inline: true },
            { name: 'Custom Design Notes', value: notes || 'None', inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'Resin Dream By Rimsha Store' },
        },
      ],
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatusMsg({ text: 'Order submitted successfully! We received your notification on Discord.', type: 'success' });
        setCustomerName('');
        setCustomerPhone('');
        setTransactionId('');
        setNotes('');
      } else {
        setStatusMsg({ text: 'Failed to send order to Discord. Please check webhook configuration.', type: 'error' });
      }
    } catch (err) {
      console.error('Webhook error:', err);
      setStatusMsg({ text: 'Error connecting to Discord Webhook.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full text-white overflow-x-hidden font-sans bg-transparent">
      
      {/* 1. FULLSCREEN MOLTEN METAL ANIMATED BACKGROUND */}
      <div className="fixed inset-0 z-0 h-full w-full pointer-events-auto">
        <MoltenMetal
          color1="#5227FF"
          color2="#FF9FFC"
          color3="#FFFFFF"
          speed={0.35}
          scale={4}
          detail={3}
          glow={1.6}
          coreSize={0.1}
          swirl={1}
          fold={-0.2}
          blackPoint={0.05}
          brightness={1.3}
          colorMode="molten"
          grain
          grainIntensity={0.05}
          mouseInteraction
          mouseStrength={0.3}
          opacity={1.0}
        />
      </div>

      {/* 2. FOREGROUND WEBSITE CONTENT */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center">
        
        {/* Navigation Bar */}
        <header className="w-full max-w-7xl flex items-center justify-between p-6 backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-50">
          <h1 className="text-2xl font-black tracking-widest uppercase text-white drop-shadow-md">
            Resins By R
          </h1>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#products" className="hover:text-pink-200 transition-colors">Products</a>
            <a href="#order" className="hover:text-pink-200 transition-colors">Order & JazzCash</a>
            <a 
              href={INSTAGRAM_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 text-xs tracking-wider font-semibold uppercase"
            >
              Instagram
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-pink-200 font-bold mb-3 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/20">
            Handcrafted Luxury Resin Art
          </span>
          <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight drop-shadow-2xl text-white">
            Resin Dream By Rimsha
          </h2>
          <p className="mt-6 max-w-xl text-lg text-slate-100 leading-relaxed drop-shadow-md">
            Explore our custom hand-poured resin collection including custom rings, wall clocks, and display shields.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a 
              href="#products" 
              className="px-8 py-3 bg-white text-slate-950 rounded-full font-bold hover:bg-pink-100 transition-all shadow-2xl"
            >
              View Products
            </a>
            <a 
              href="#order" 
              className="px-8 py-3 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/30 rounded-full font-medium transition-all shadow-lg text-white"
            >
              Place Order via JazzCash
            </a>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section id="products" className="w-full max-w-6xl px-6 py-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">Featured Products</h3>
            <p className="text-slate-100 mt-2 text-sm drop-shadow">Select an item below to send an instant order notification to Discord</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group relative rounded-3xl bg-black/25 backdrop-blur-xl border border-white/20 p-5 hover:border-pink-300/80 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl"
              >
                <div>
                  <div className="h-64 w-full rounded-2xl overflow-hidden bg-black/20 relative mb-5 border border-white/10">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(product.name);
                      }}
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-xs font-bold rounded-full border border-white/20">
                      {product.price}
                    </span>
                  </div>

                  <h4 className="text-2xl font-bold text-white drop-shadow">{product.name}</h4>
                  <p className="text-slate-100 text-sm mt-2 leading-relaxed drop-shadow-sm">{product.description}</p>
                </div>

                <a
                  href="#order"
                  onClick={() => setSelectedProduct(product)}
                  className="mt-6 w-full py-3 bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md rounded-xl font-semibold text-xs tracking-wider uppercase text-center transition-all shadow-md block text-white"
                >
                  Select & Order
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Order Form & JazzCash Section */}
        <section id="order" className="w-full max-w-3xl px-6 py-12 my-8">
          <div className="rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/20 p-8 sm:p-10">
            <span className="text-xs font-bold tracking-widest uppercase text-pink-200 block text-center">
              Direct Order Form
            </span>
            <h3 className="text-3xl font-bold text-center mt-2 text-white drop-shadow">JazzCash & Custom Orders</h3>
            <p className="text-slate-100 text-xs text-center mt-2 drop-shadow-sm">
              Submitting this form automatically alerts our team on Discord.
            </p>

            <form onSubmit={handleOrderSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-100 mb-2">Selected Product</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setSelectedProduct(prod);
                  }}
                  className="w-full bg-black/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} - {p.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-100 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-black/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 text-white placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-100 mb-2">Phone / Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03001234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 text-white placeholder-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-100 mb-2">JazzCash Transaction ID / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-black/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 text-white placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-100 mb-2">Custom Color / Design Notes</label>
                <textarea
                  rows="3"
                  placeholder="Specify custom colors, flakes, size, or special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 text-white placeholder-slate-300"
                ></textarea>
              </div>

              {statusMsg.text && (
                <div className={`p-4 rounded-xl text-xs font-semibold text-center ${
                  statusMsg.type === 'success' ? 'bg-green-500/30 text-green-200 border border-green-500/40' :
                  statusMsg.type === 'error' ? 'bg-red-500/30 text-red-200 border border-red-500/40' :
                  'bg-blue-500/30 text-blue-200 border border-blue-500/40'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg text-white disabled:opacity-50 backdrop-blur-md"
              >
                {isSubmitting ? 'Sending to Discord...' : 'Submit Order Notification'}
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 py-8 text-center text-xs text-slate-200 backdrop-blur-md bg-black/30">
          <p>© {new Date().getFullYear()} Resins By R (resin_dreambyrimsha). All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}
