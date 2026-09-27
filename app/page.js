'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  CheckCircle, 
  Sparkles, 
  X, 
  Plus, 
  Send,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

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

function ProductCard({ product, onAddToCart }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="group liquid-glass-box rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/10">
      <div className="relative aspect-square overflow-hidden bg-slate-950/60">
        <img
          src={product.images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600/80 hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600/80 hover:scale-110"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-pink-300 font-semibold border border-pink-500/30">
          {product.category}
        </div>

        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {product.images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'w-4 bg-pink-400' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-lg text-slate-100 group-hover:text-pink-300 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-lg font-bold text-pink-400">Rs. {product.price}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="glass-btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" /> Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Shield Photo Customization Toggle (+100 PKR)
  const [includeShieldPhoto, setIncludeShieldPhoto] = useState(false);

  // Order Flow Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(1); // 1: Form, 2: Confirmation, 3: Success

  // Order Details State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientPhotoFile, setClientPhotoFile] = useState(null);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Opinion Form State
  const [opinionName, setOpinionName] = useState('');
  const [opinionText, setOpinionText] = useState('');
  const [isSubmittingOpinion, setIsSubmittingOpinion] = useState(false);
  const [opinionSuccess, setOpinionSuccess] = useState(false);

  const categories = ['All', 'Rings', 'Clocks', 'Shields'];
  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const baseTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const photoFee = includeShieldPhoto ? 100 : 0;
  const grandTotal = baseTotal + photoFee;

  const scrollToCart = () => {
    const el = document.getElementById('cart-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setOrderStep(1);
    setIsOrderModalOpen(true);
  };

  const handleProceedToConfirmation = (e) => {
    e.preventDefault();
    setOrderStep(2);
  };

  const handleConfirmAndSubmitOrder = async () => {
    setIsSubmittingOrder(true);

    const orderId = `#RR-${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedOrderId(orderId);

    const itemsFormatted = cart
      .map((item) => `• **${item.name}** (x${item.quantity}) - Rs.${item.price * item.quantity}`)
      .join('\n');

    const photoAttachmentText = includeShieldPhoto 
      ? `Yes (+100 PKR)${clientPhotoFile ? ` - File Attached: ${clientPhotoFile.name}` : ''}`
      : 'No';

    const discordPayload = {
      embeds: [
        {
          title: `🛒 NEW ORDER SUBMITTED: ${orderId}`,
          color: 0xf472b6,
          fields: [
            { name: 'Order ID', value: `\`${orderId}\``, inline: true },
            { name: 'Client Name', value: clientName, inline: true },
            { name: 'Phone Number', value: clientPhone, inline: true },
            { name: 'Delivery Address', value: clientAddress },
            { name: 'Ordered Items', value: itemsFormatted },
            { name: 'Resin Shield Photo Customization', value: photoAttachmentText, inline: true },
            { name: 'Grand Total Amount', value: `**Rs. ${grandTotal}**`, inline: true },
            { name: 'Additional Notes', value: clientNotes || 'None' }
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
    } catch (err) {
      console.error('Failed to submit order to Discord:', err);
      alert('Failed to process order via webhook. Please contact us on WhatsApp directly!');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    const discordPayload = {
      embeds: [
        {
          title: '⭐ New Customer Review Received',
          color: 0xfbbf24,
          fields: [
            { name: 'Customer', value: reviewName || 'Anonymous', inline: true },
            { name: 'Rating', value: `${'⭐'.repeat(reviewRating)} (${reviewRating}/5)`, inline: true },
            { name: 'Review', value: reviewText }
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
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setReviewName('');
        setReviewText('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpinionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingOpinion(true);

    const discordPayload = {
      embeds: [
        {
          title: '💡 New Store Feedback / Opinion',
          color: 0x38bdf8,
          fields: [
            { name: 'Visitor Name', value: opinionName || 'Anonymous', inline: true },
            { name: 'Feedback / Suggestion', value: opinionText }
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
      setOpinionSuccess(true);
      setTimeout(() => {
        setOpinionSuccess(false);
        setOpinionName('');
        setOpinionText('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting opinion:', err);
    } finally {
      setIsSubmittingOpinion(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-pink-500 selection:text-white bg-slate-950">
      
      {/* Sticky Header Bar with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-pink-500/20 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              Resins by R
            </span>
          </div>

          <button
            onClick={scrollToCart}
            className="glass-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-pink-300" />
            <span>Cart</span>
            <span className="ml-1 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Liquid Glass Box */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="liquid-glass-box p-8 md:p-12 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 border border-pink-500/30 text-pink-300">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Resin Art & Custom Gifts
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-300 via-rose-100 to-purple-300 bg-clip-text text-transparent">
            Handcrafted Resin Keepsakes
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
            Custom resin rings, black marble clocks, and personalized shields tailored with your photos and floral embeds.
          </p>
          <div className="pt-2">
            <a 
              href="https://instagram.com/resin_dreambyrimsha" 
              target="_blank" 
              rel="noreferrer" 
              className="glass-btn-secondary inline-flex items-center gap-2 text-xs text-pink-300 px-4 py-2 rounded-xl transition-all hover:scale-105"
            >
              Follow @resin_dreambyrimsha <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="liquid-glass-box p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" /> Exclusive Catalog
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 border border-pink-400'
                      : 'glass-btn-secondary text-slate-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cart Section (Dedicated Section) */}
      <section id="cart-section" className="max-w-7xl mx-auto px-4 py-6">
        <div className="liquid-glass-box p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" /> Shopping Cart
            </h2>
            <span className="text-xs text-pink-300 font-medium">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items Selected
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-500" />
              <p className="text-sm">Your cart is currently empty. Add items from the catalog above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="liquid-glass-box p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-14 h-14 object-cover rounded-lg border border-white/10"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">{item.name}</h4>
                        <span className="text-xs text-pink-400 font-bold">
                          Rs. {item.price} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="glass-btn-secondary w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:scale-110"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-slate-100 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="glass-btn-secondary w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:scale-110"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-pink-300 w-24 text-right">
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resin Shield Custom Photo Toggle Option */}
              <div className="liquid-glass-box p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="shieldPhotoCheck"
                    checked={includeShieldPhoto}
                    onChange={(e) => setIncludeShieldPhoto(e.target.checked)}
                    className="w-4 h-4 rounded border-pink-500/40 bg-slate-900 text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                  <label htmlFor="shieldPhotoCheck" className="text-xs sm:text-sm text-slate-200 cursor-pointer">
                    Add Custom Photo Integration to Resin Shield <span className="text-pink-400 font-semibold">(+100 PKR)</span>
                  </label>
                </div>
              </div>

              {/* Cart Summary Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  <span className="text-xs text-slate-400 block">Total Cart Amount</span>
                  <span className="text-2xl font-black text-pink-400">Rs. {grandTotal}</span>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="glass-btn-primary px-8 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/25 flex items-center gap-2"
                >
                  <PackageCheck className="w-5 h-5" /> Proceed to Order
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="liquid-glass-box p-6 md:p-8 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Customer Reviews
            </h2>
            <p className="text-xs text-slate-400">Share your experience with Resins by R</p>
          </div>

          {reviewSuccess ? (
            <div className="py-6 text-center text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Review submitted successfully! Thank you.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Rating</label>
                  <div className="flex gap-2 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`transition-transform hover:scale-125 ${
                          star <= reviewRating ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Your Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="glass-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Opinion Section */}
      <section className="max-w-7xl mx-auto px-4 py-6 mb-12">
        <div className="liquid-glass-box p-6 md:p-8 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-sky-400" /> Share Your Opinion
            </h2>
            <p className="text-xs text-slate-400">Have suggestions or custom requests? We’d love to hear from you!</p>
          </div>

          {opinionSuccess ? (
            <div className="py-6 text-center text-sky-400 font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Your opinion has been received! Thank you.
            </div>
          ) : (
            <form onSubmit={handleOpinionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Name (Optional)</label>
                <input
                  type="text"
                  value={opinionName}
                  onChange={(e) => setOpinionName(e.target.value)}
                  placeholder="Your Name"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Opinion / Suggestion</label>
                <textarea
                  required
                  rows={3}
                  value={opinionText}
                  onChange={(e) => setOpinionText(e.target.value)}
                  placeholder="Type your opinion or custom design suggestion here..."
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingOpinion}
                className="glass-btn-secondary px-6 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmittingOpinion ? 'Submitting...' : 'Submit Opinion'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 liquid-glass-box px-5 py-3 rounded-2xl border-pink-500/50 text-slate-100 text-sm font-medium flex items-center gap-2 shadow-2xl"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-Step Order Checkout Dialog */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg liquid-glass-box rounded-2xl p-6 z-10 shadow-2xl border-pink-500/40 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-pink-400" />
                  {orderStep === 1 && 'Step 1: Order Details'}
                  {orderStep === 2 && 'Step 2: Confirm Your Order'}
                  {orderStep === 3 && 'Order Confirmed!'}
                </h3>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Input Customer Form */}
              {orderStep === 1 && (
                <form onSubmit={handleProceedToConfirmation} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter your full name"
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (WhatsApp / JazzCash) *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="House/Street, Sector, City..."
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                    />
                  </div>

                  {includeShieldPhoto && (
                    <div>
                      <label className="text-xs font-semibold text-pink-300 block mb-1">
                        Upload Custom Photo for Resin Shield
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setClientPhotoFile(e.target.files[0])}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Additional Notes (Optional)</label>
                    <input
                      type="text"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Ring size, color preferences..."
                      className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="glass-btn-primary w-full py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 active:scale-95"
                    >
                      Review Order Details
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Confirmation Screen */}
              {orderStep === 2 && (
                <div className="space-y-4">
                  <div className="liquid-glass-box p-4 rounded-xl space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Name:</span>
                      <span className="font-semibold text-slate-100">{clientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold text-slate-100">{clientPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-semibold text-slate-100 text-right">{clientAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Custom Photo Added:</span>
                      <span className="font-semibold text-pink-300">
                        {includeShieldPhoto ? 'Yes (+100 PKR)' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-base">
                      <span className="text-slate-200">Total:</span>
                      <span className="text-pink-400">Rs. {grandTotal}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOrderStep(1)}
                      className="glass-btn-secondary w-1/3 py-2.5 rounded-xl text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingOrder}
                      onClick={handleConfirmAndSubmitOrder}
                      className="glass-btn-primary w-2/3 py-2.5 rounded-xl text-xs font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Confirm & Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success & Order ID */}
              {orderStep === 3 && (
                <div className="text-center space-y-4 py-4">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h4 className="text-xl font-extrabold text-slate-100">Order Placed Successfully!</h4>
                  
                  <div className="liquid-glass-box p-4 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">Your Order ID</span>
                    <span className="text-2xl font-black text-pink-400 tracking-wider">
                      {generatedOrderId}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-slate-300 mb-2">
                      For further order updates, contact on WhatsApp:
                    </p>
                    <a
                      href="https://wa.me/923058866692"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm hover:bg-emerald-500/30 transition-all transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4" /> +92305-8866692
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Resins by R. All rights reserved.</p>
      </footer>
    </div>
  );
}
