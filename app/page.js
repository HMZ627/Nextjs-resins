'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Heart, 
  MessageSquare, 
  Plus, 
  Send,
  ExternalLink
} from 'lucide-react';

// Read automatically from Vercel Environment Variables
const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

// Original Products Data
const PRODUCTS = [
  {
    id: 'resin-ring-1',
    name: 'Handcrafted Resin Ring',
    category: 'Rings',
    price: 700,
    rating: 4.9,
    description: 'Custom handcrafted clear resin ring with options for delicate floral embeds and metallic flakes.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'resin-clock-1',
    name: 'Black Marble & Gold Dust Resin Clock',
    category: 'Clocks',
    price: 5000,
    rating: 5.0,
    description: 'Premium statement wall clock designed with rich black marble patterns and shimmering gold dust accents.',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'resin-shield-1',
    name: '6-Inch Resin Shield',
    category: 'Shields',
    price: 2300,
    rating: 4.8,
    description: 'Custom 6-inch resin display shield. Option to add your personal custom photo print (+Rs. 100).',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
  }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [includeCustomPhoto, setIncludeCustomPhoto] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Filtered Products
  const categories = ['All', 'Rings', 'Clocks', 'Shields'];
  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  // Cart Functions
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
    setIsCartOpen(true);
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
  const photoFee = includeCustomPhoto ? 100 : 0;
  const cartTotal = baseTotal + photoFee;

  // Send Order to Discord Webhook
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    setIsSubmittingOrder(true);

    const itemsList = cart
      .map((item) => `• **${item.name}** (x${item.quantity}) - Rs. ${item.price * item.quantity}`)
      .join('\n');

    const discordPayload = {
      embeds: [
        {
          title: '🛒 New Order Received! - Resins by R',
          color: 0xf472b6, // Pink
          fields: [
            { name: 'Customer Name', value: customerName, inline: true },
            { name: 'Phone Number', value: customerPhone, inline: true },
            { name: 'Delivery Address', value: customerAddress },
            { name: 'Ordered Items', value: itemsList },
            { name: 'Custom Photo Added?', value: includeCustomPhoto ? 'Yes (+Rs. 100)' : 'No', inline: true },
            { name: 'Total Amount', value: `**Rs. ${cartTotal}**`, inline: true },
            { name: 'Payment Info', value: 'JazzCash Confirmation Requested', inline: true },
            { name: 'Customization Notes', value: customNotes || 'None' }
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
      } else {
        console.warn('Discord Webhook URL is missing');
      }

      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomNotes('');
        setIncludeCustomPhoto(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to send order webhook:', err);
      alert('Order submission failed. Please contact us directly on Instagram @resin_dreambyrimsha!');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Send Review to Discord Webhook
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    const stars = '⭐'.repeat(reviewRating);

    const discordPayload = {
      embeds: [
        {
          title: '✨ New Store Review Submitted!',
          color: 0xfbbf24,
          fields: [
            { name: 'Customer Name', value: reviewName || 'Anonymous', inline: true },
            { name: 'Rating', value: `${stars} (${reviewRating}/5)`, inline: true },
            { name: 'Review', value: reviewComment }
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
        setIsReviewModalOpen(false);
        setReviewName('');
        setReviewComment('');
      }, 2500);
    } catch (err) {
      console.error('Failed to send review webhook:', err);
      alert('Review submission failed. Please try again!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-pink-500/20 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              Resins by R
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Leave a Review</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 px-4 text-center overflow-hidden border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-500/10 border border-pink-500/30 text-pink-300">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Resin Art & Custom Gifts
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-300 via-rose-100 to-purple-300 bg-clip-text text-transparent">
            Handcrafted Resin Keepsakes
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            Custom resin rings, black marble clocks, and personalized shields tailored with your photos and dried flower embeds.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <a 
              href="https://instagram.com/resin_dreambyrimsha" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 text-xs text-pink-400 hover:underline"
            >
              Follow @resin_dreambyrimsha <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group glass-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:border-pink-500/50"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-950/50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-pink-300 font-medium border border-pink-500/20">
                  {product.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
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
                  <p className="text-slate-300 text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-xs text-slate-400 block">Price</span>
                    <span className="text-lg font-bold text-pink-400">Rs. {product.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add to Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md glass-modal h-full flex flex-col z-10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                  <ShoppingBag className="w-5 h-5 text-pink-400" /> Your Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                  <h3 className="text-2xl font-bold text-white">Order Received!</h3>
                  <p className="text-slate-300 text-sm">
                    Thank you! Please send JazzCash payment confirmation via WhatsApp to complete your order.
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-2 stroke-1" />
                  <p>Your order list is empty.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between py-4 space-y-6">
                  {/* Cart Item List */}
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10"
                      >
                        <div>
                          <h4 className="font-medium text-sm text-slate-200">{item.name}</h4>
                          <span className="text-xs text-pink-400 font-semibold">
                            Rs. {item.price * item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center hover:bg-white/20"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold text-slate-200 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center hover:bg-white/20"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t border-white/10">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">JazzCash / WhatsApp Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Delivery Address</label>
                      <textarea
                        required
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Street address, city..."
                        className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="customPhoto"
                        checked={includeCustomPhoto}
                        onChange={(e) => setIncludeCustomPhoto(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-pink-500 focus:ring-pink-500"
                      />
                      <label htmlFor="customPhoto" className="text-xs text-slate-300 cursor-pointer">
                        Include Custom Photo Integration (+Rs. 100)
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Customization Request (Optional)</label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Floral embed choices, ring size, etc."
                        className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-between items-center text-slate-200 font-semibold">
                      <span>Total Amount</span>
                      <span className="text-xl text-pink-400">Rs. {cartTotal}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingOrder ? (
                        <span>Submitting Order...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Place Order via JazzCash
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md glass-modal rounded-2xl p-6 z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Share Your Review
                </h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-lg font-semibold text-slate-100">Thank you for your feedback!</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`p-1 transition-colors ${
                            star <= reviewRating ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Review</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How was your custom resin item?"
                      className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Resins by R. All rights reserved.</p>
      </footer>
    </div>
  );
}
