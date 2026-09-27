'use client';

import React, { useState } from 'react';

const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

const PRODUCTS = [
  {
    id: 'resin-ring',
    name: 'Resin Ring',
    category: 'Rings',
    price: 700,
    rating: 4.9,
    description: 'Custom handcrafted clear resin ring with options for delicate floral embeds and metallic flakes.',
    images: [
      '/images/SaveClip.App_753224950_17897573046550553_9171311841910070315_n.jpg.webp',
      '/images/SaveClip.App_729164572_17897573055550553_1935948774416209706_n.jpg.webp',
      '/images/SaveClip.App_753604692_17897573067550553_3868263303187958583_n.jpg.webp'
    ]
  },
  {
    id: 'resin-clock',
    name: 'Black Marble & Gold Dust Resin Clock',
    category: 'Clocks',
    price: 5000,
    rating: 5.0,
    description: 'Premium statement wall clock designed with rich black marble patterns and shimmering gold dust accents.',
    images: [
      '/images/IMG-20260808-WA0077.jpg',
      '/images/IMG-20260808-WA0078.jpg'
    ]
  },
  {
    id: 'resin-shield',
    name: 'Resin Shield (6-inches)',
    category: 'Shields',
    price: 2300,
    rating: 4.8,
    description: 'Custom 6-inch resin display shield. Option to add your personal custom photo print (+Rs. 100).',
    images: [
      '/images/shield1.jpg',
      '/images/shield2.jpg',
      '/images/shield3.jpg'
    ]
  }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [includeShieldPhoto, setIncludeShieldPhoto] = useState(false);
  
  // Active Image State per product (Carousel emulation)
  const [imgIndices, setImgIndices] = useState({
    'resin-ring': 0,
    'resin-clock': 0,
    'resin-shield': 0
  });

  // Modal / Order States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5 ⭐');
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Opinion Form
  const [opinionName, setOpinionName] = useState('');
  const [opinionText, setOpinionText] = useState('');
  const [opinionSuccess, setOpinionSuccess] = useState(false);

  const categories = ['All', 'Rings', 'Clocks', 'Shields'];

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const prevImage = (id, length) => {
    setImgIndices(prev => ({ ...prev, [id]: (prev[id] - 1 + length) % length }));
  };

  const nextImage = (id, length) => {
    setImgIndices(prev => ({ ...prev, [id]: (prev[id] + 1) % length }));
  };

  const baseTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const photoFee = includeShieldPhoto ? 100 : 0;
  const grandTotal = baseTotal + photoFee;

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const orderId = `#RR-${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedOrderId(orderId);

    const itemsFormatted = cart
      .map(item => `• **${item.name}** (x${item.quantity}) - Rs.${item.price * item.quantity}`)
      .join('\n');

    const discordPayload = {
      embeds: [
        {
          title: `🛒 NEW ORDER: ${orderId}`,
          color: 0xff4b4b, // Streamlit red accent
          fields: [
            { name: 'Order ID', value: `\`${orderId}\``, inline: true },
            { name: 'Customer Name', value: clientName, inline: true },
            { name: 'Phone Number', value: clientPhone, inline: true },
            { name: 'Delivery Address', value: clientAddress },
            { name: 'Order Items', value: itemsFormatted },
            { name: 'Shield Photo Customization', value: includeShieldPhoto ? 'Yes (+100 PKR)' : 'No', inline: true },
            { name: 'Grand Total', value: `**Rs. ${grandTotal}**`, inline: true },
            { name: 'Notes', value: clientNotes || 'None' }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      if (DISCORD_WEBHOOK_URL) {
        await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload)
        });
      }
      setOrderStep(3);
      setCart([]);
    } catch (e) {
      console.error(e);
      alert('Error submitting order. Please contact WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const discordPayload = {
      embeds: [
        {
          title: '⭐ New Streamlit Store Review',
          color: 0xf1c40f,
          fields: [
            { name: 'Customer', value: reviewName || 'Anonymous', inline: true },
            { name: 'Rating', value: reviewRating, inline: true },
            { name: 'Review', value: reviewText }
          ]
        }
      ]
    };

    if (DISCORD_WEBHOOK_URL) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
    }
    setReviewSuccess(true);
    setTimeout(() => { setReviewSuccess(false); setReviewName(''); setReviewText(''); }, 3000);
  };

  const handleOpinionSubmit = async (e) => {
    e.preventDefault();
    const discordPayload = {
      embeds: [
        {
          title: ' New Streamlit Store Feedback',
          color: 0x3498db,
          fields: [
            { name: 'Visitor Name', value: opinionName || 'Anonymous', inline: true },
            { name: 'Feedback', value: opinionText }
          ]
        }
      ]
    };

    if (DISCORD_WEBHOOK_URL) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
    }
    setOpinionSuccess(true);
    setTimeout(() => { setOpinionSuccess(false); setOpinionName(''); setOpinionText(''); }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa] font-sans">
      
      {/* Streamlit Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ff4b4b]"></div>
          <span className="font-bold text-lg text-white tracking-wide">Resins by R</span>
          <span className="text-xs bg-[#262730] border border-[#30363d] text-slate-400 px-2.5 py-0.5 rounded">
            Streamlit App
          </span>
        </div>

        <button 
          onClick={() => {
            const el = document.getElementById('cart-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-[#262730] hover:bg-[#31333f] text-[#fafafa] border border-[#41444c] text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          🛒 Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Title Header */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Resins by R | Handcrafted E-Commerce</h1>
          <p className="text-sm text-[#8b949e]">
            Handcrafted customized resin rings, wall clocks, and personalized shields.
          </p>
          <div className="pt-2">
            <a 
              href="https://instagram.com/resin_dreambyrimsha" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-[#58a6ff] hover:underline"
            >
              🔗 Follow on Instagram: @resin_dreambyrimsha
            </a>
          </div>
        </section>

        {/* Category Select Radio */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#30363d] pb-2">Select Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-[#ff4b4b] border-[#ff4b4b] text-white' 
                    : 'bg-[#262730] border-[#30363d] text-[#c9d1d9] hover:bg-[#31333f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Products Display Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Resins by R</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const activeImgIndex = imgIndices[product.id] || 0;
              return (
                <div key={product.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    
                    {/* Carousel */}
                    <div className="relative aspect-square rounded-md overflow-hidden bg-[#0e1117] border border-[#30363d]">
                      <img 
                        src={product.images[activeImgIndex]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <button 
                            onClick={() => prevImage(product.id, product.images.length)}
                            className="bg-[#161b22]/80 text-white p-1 rounded hover:bg-[#ff4b4b]"
                          >
                            ◀
                          </button>
                          <button 
                            onClick={() => nextImage(product.id, product.images.length)}
                            className="bg-[#161b22]/80 text-white p-1 rounded hover:bg-[#ff4b4b]"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-[#262730] text-[#ff4b4b] border border-[#ff4b4b]/30 px-2 py-0.5 rounded font-semibold">
                        {product.category}
                      </span>
                      <span className="text-xs text-[#f1c40f]">⭐ {product.rating}</span>
                    </div>

                    <h3 className="font-bold text-base text-white">{product.name}</h3>
                    <p className="text-xs text-[#8b949e] line-clamp-3">{product.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#30363d] flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#ff4b4b]">Rs. {product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-[#ff4b4b] hover:bg-[#e03e3e] text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Streamlit Cart Section */}
        <section id="cart-section" className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-[#30363d] pb-3">🛒 Your Order Summary</h2>

          {cart.length === 0 ? (
            <div className="bg-[#262730] border border-[#30363d] rounded p-4 text-center text-xs text-[#8b949e]">
              Your cart is empty. Add products from above!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#262730] border border-[#30363d] rounded p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-xs text-[#8b949e]">Rs. {item.price} x {item.quantity}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-[#161b22] border border-[#30363d] text-xs px-2 py-1 rounded hover:bg-[#ff4b4b]"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-[#161b22] border border-[#30363d] text-xs px-2 py-1 rounded hover:bg-[#ff4b4b]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#ff4b4b]">Rs. {item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shield Photo Option Checkbox */}
              <div className="bg-[#262730] border border-[#30363d] rounded p-3 flex items-center gap-3">
                <input 
                  type="checkbox"
                  id="stShieldCheck"
                  checked={includeShieldPhoto}
                  onChange={(e) => setIncludeShieldPhoto(e.target.checked)}
                  className="accent-[#ff4b4b] cursor-pointer"
                />
                <label htmlFor="stShieldCheck" className="text-xs text-white cursor-pointer">
                  Add Custom Photo Integration to Resin Shield <span className="text-[#ff4b4b] font-bold">(+100 PKR)</span>
                </label>
              </div>

              {/* Streamlit Total Display Box */}
              <div className="bg-[#262730] border-l-4 border-[#ff4b4b] p-4 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8b949e] block">Grand Total</span>
                  <span className="text-2xl font-black text-[#ff4b4b]">Rs. {grandTotal}</span>
                </div>

                <button
                  onClick={() => { setOrderStep(1); setIsCheckoutOpen(true); }}
                  className="bg-[#ff4b4b] hover:bg-[#e03e3e] text-white font-bold text-sm px-6 py-2.5 rounded-md transition-colors"
                >
                  Proceed to Checkout ➔
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Customer Review Section */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#30363d] pb-2">⭐ Submit Customer Review</h2>
          
          {reviewSuccess ? (
            <div className="bg-[#122e1e] border border-[#238636] text-[#3fb950] p-3 rounded text-xs font-semibold">
               Review submitted successfully!
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter name"
                    className="bg-[#0e1117] border border-[#30363d] rounded p-2 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="bg-[#0e1117] border border-[#30363d] rounded p-2 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                  >
                    <option>5 ⭐⭐⭐⭐⭐</option>
                    <option>4 ⭐⭐⭐⭐</option>
                    <option>3 ⭐⭐⭐</option>
                    <option>2 ⭐⭐</option>
                    <option>1 ⭐</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#c9d1d9] block mb-1">Feedback</label>
                <textarea 
                  required
                  rows={2}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write feedback..."
                  className="bg-[#0e1117] border border-[#30363d] rounded p-2 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                />
              </div>

              <button 
                type="submit"
                className="bg-[#262730] hover:bg-[#31333f] border border-[#41444c] text-white text-xs font-semibold px-4 py-2 rounded-md"
              >
                Submit Review
              </button>
            </form>
          )}
        </section>

        {/* Store Feedback / Opinion Section */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#30363d] pb-2">💡 Share Opinion / Custom Suggestion</h2>

          {opinionSuccess ? (
            <div className="bg-[#0d2d44] border border-[#1f6beb] text-[#58a6ff] p-3 rounded text-xs font-semibold">
              ✅ Opinion submitted successfully to Discord!
            </div>
          ) : (
            <form onSubmit={handleOpinionSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#c9d1d9] block mb-1">Name (Optional)</label>
                <input 
                  type="text" 
                  value={opinionName}
                  onChange={(e) => setOpinionName(e.target.value)}
                  placeholder="Your Name"
                  className="bg-[#0e1117] border border-[#30363d] rounded p-2 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c9d1d9] block mb-1">Your Suggestion / Opinion</label>
                <textarea 
                  required
                  rows={2}
                  value={opinionText}
                  onChange={(e) => setOpinionText(e.target.value)}
                  placeholder="Type suggestion here..."
                  className="bg-[#0e1117] border border-[#30363d] rounded p-2 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                />
              </div>

              <button 
                type="submit"
                className="bg-[#262730] hover:bg-[#31333f] border border-[#41444c] text-white text-xs font-semibold px-4 py-2 rounded-md"
              >
                Submit Opinion
              </button>
            </form>
          )}
        </section>

      </main>

      {/* Streamlit Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <h3 className="font-bold text-base text-white">
                {orderStep === 1 && '📝 Step 1: Customer Info'}
                {orderStep === 2 && '📋 Step 2: Confirm Details'}
                {orderStep === 3 && '🎉 Order Complete'}
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-[#8b949e] hover:text-white">✕</button>
            </div>

            {orderStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setOrderStep(2); }} className="space-y-3">
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-[#0e1117] border border-[#30363d] text-xs p-2 rounded w-full text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-[#0e1117] border border-[#30363d] text-xs p-2 rounded w-full text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Delivery Address *</label>
                  <textarea 
                    required 
                    rows={2}
                    value={clientAddress} 
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="bg-[#0e1117] border border-[#30363d] text-xs p-2 rounded w-full text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Notes (Optional)</label>
                  <input 
                    type="text" 
                    value={clientNotes} 
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="bg-[#0e1117] border border-[#30363d] text-xs p-2 rounded w-full text-white" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-[#ff4b4b] hover:bg-[#e03e3e] text-white font-bold text-xs w-full py-2.5 rounded-md mt-2"
                >
                  Review Order Details ➔
                </button>
              </form>
            )}

            {orderStep === 2 && (
              <div className="space-y-3 text-xs">
                <div className="bg-[#262730] border border-[#30363d] p-3 rounded space-y-1.5 text-[#c9d1d9]">
                  <p><strong>Name:</strong> {clientName}</p>
                  <p><strong>Phone:</strong> {clientPhone}</p>
                  <p><strong>Address:</strong> {clientAddress}</p>
                  <p><strong>Photo Option:</strong> {includeShieldPhoto ? 'Yes (+100 PKR)' : 'No'}</p>
                  <p className="text-sm font-bold text-[#ff4b4b] pt-1">Total: Rs. {grandTotal}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setOrderStep(1)} 
                    className="bg-[#262730] text-white border border-[#30363d] w-1/3 py-2 rounded text-xs"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleConfirmOrder} 
                    className="bg-[#ff4b4b] hover:bg-[#e03e3e] text-white font-bold w-2/3 py-2 rounded text-xs"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Place Order'}
                  </button>
                </div>
              </div>
            )}

            {orderStep === 3 && (
              <div className="text-center space-y-3 py-2">
                <div className="text-3xl">🎉</div>
                <h4 className="font-bold text-base text-white">Order Confirmed!</h4>
                
                <div className="bg-[#262730] border border-[#30363d] p-3 rounded">
                  <span className="text-xs text-[#8b949e] block">Your Order ID</span>
                  <span className="text-xl font-bold text-[#ff4b4b]">{generatedOrderId}</span>
                </div>

                <p className="text-xs text-[#8b949e]">
                  For further order updates, contact on WhatsApp:
                </p>
                <a 
                  href="https://wa.me/923058866692" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold px-4 py-2 rounded"
                >
                   Chat on WhatsApp: +92305-8866692
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-[#30363d] py-6 text-center text-xs text-[#8b949e]">
        © {new Date().getFullYear()} Resins by R | Streamlit Next.js Port
      </footer>
    </div>
  );
}
