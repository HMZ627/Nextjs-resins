'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ShoppingBag, Star, CheckCircle, ShieldCheck, Sparkles, X, Heart, MessageSquare } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'resin-ring',
    name: 'Resin Ring',
    basePrice: 450,
    allowCustomImage: true,
    customImagePrice: 100,
    description: 'Handcrafted floral resin ring with metallic leaf accents and customizable embed.',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'resin-clock',
    name: 'Resin Wall Clock',
    basePrice: 2800,
    allowCustomImage: false,
    customImagePrice: 0,
    description: 'Ocean wave inspired luxury wall clock made with crystal clear epoxy resin.',
    images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'resin-shield',
    name: 'Resin Shield / Coaster',
    basePrice: 650,
    allowCustomImage: true,
    customImagePrice: 100,
    description: 'Custom resin shield coaster with custom photo embed option and gold foil rim.',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80']
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', tid: '' });
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Review state
  const [review, setReview] = useState({ name: '', rating: 5, feedback: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.basePrice + (hasCustomImage ? selectedProduct.customImagePrice : 0);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const orderId = `RBR-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      type: 'order',
      orderId,
      productName: selectedProduct.name,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      hasCustomImage,
      totalPrice: calculateTotal(),
      transactionId: formData.tid,
    };

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrderConfirmed({ orderId, total: calculateTotal() });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        alert('Failed to submit order. Please check your transaction details or try again.');
      }
    } catch (err) {
      alert('Network error while placing your order. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', ...review }),
      });
      setReviewSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs md:text-sm font-semibold mb-4 tracking-wide uppercase">
          <Sparkles className="w-4 h-4 text-pink-300" /> Handmade Epoxy Resin Collections
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-200 via-rose-300 to-purple-200 bg-clip-text text-transparent mb-4">
          Resins by R
        </h1>
        <p className="text-gray-200 text-base md:text-lg max-w-xl mx-auto font-light">
          Custom handcrafted resin rings, wall clocks, and shields crafted with precision. Select an item below to place your custom order.
        </p>
      </motion.div>

      {/* Catalog Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {PRODUCTS.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ y: -6 }}
            className="glass-card rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-pink-400/50 transition-all duration-300"
          >
            <div>
              <div className="h-52 rounded-xl overflow-hidden mb-5 relative group">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-pink-300">
                  <Heart className="w-4 h-4 fill-pink-500/30" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{product.name}</h2>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Starting from</span>
                  <span className="text-2xl font-extrabold text-pink-200">PKR {product.basePrice}</span>
                </div>
                {product.allowCustomImage && (
                  <span className="text-xs bg-pink-500/20 text-pink-200 px-3 py-1 rounded-full border border-pink-400/30 font-medium">
                    + Photo Customization
                  </span>
                )}
              </div>
              <button
                onClick={() => { 
                  setSelectedProduct(product); 
                  setHasCustomImage(false); 
                  setOrderConfirmed(null); 
                  setFormData({ name: '', phone: '', address: '', tid: '' });
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-950/50 active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" /> Order Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Modal Popup */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-modal rounded-2xl p-6 md:p-8 max-w-lg w-full relative text-white max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!orderConfirmed ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">Checkout</h2>
                    <p className="text-pink-300 text-sm font-medium">{selectedProduct.name}</p>
                  </div>

                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Your Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Ayesha Khan"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">WhatsApp / Contact Number</label>
                      <input 
                        required 
                        type="tel" 
                        placeholder="03XX-XXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Complete Delivery Address</label>
                      <textarea 
                        required 
                        rows={2}
                        placeholder="House #, Street, City"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm"
                      />
                    </div>

                    {selectedProduct.allowCustomImage && (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                        <input 
                          type="checkbox" 
                          id="customImage" 
                          checked={hasCustomImage}
                          onChange={(e) => setHasCustomImage(e.target.checked)}
                          className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                        />
                        <label htmlFor="customImage" className="text-xs md:text-sm text-gray-200 cursor-pointer select-none">
                          Add Custom Photo Embed <span className="text-pink-300 font-semibold">(+PKR {selectedProduct.customImagePrice})</span>
                        </label>
                      </div>
                    )}

                    {/* JazzCash Section */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/60 to-red-950/60 border border-rose-500/30 my-4">
                      <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold text-sm">
                        <ShieldCheck className="w-5 h-5 text-rose-400" /> JazzCash Payment Instructions
                      </div>
                      <p className="text-xs text-gray-300 mb-2">
                        Please transfer <strong className="text-white font-bold">PKR {calculateTotal()}</strong> to:
                      </p>
                      <div className="bg-black/50 p-2.5 rounded-lg text-center font-mono text-sm border border-white/10 text-pink-200 mb-3">
                        Account: 03XX-XXXXXXX (Resins by R)
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-rose-200 mb-1">JazzCash Transaction ID (TID) *</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="e.g. 0123456789"
                          value={formData.tid}
                          onChange={(e) => setFormData({...formData, tid: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-rose-400/40 text-rose-100 outline-none text-sm font-mono focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-xs text-gray-400 block">Total Price</span>
                        <span className="text-2xl font-extrabold text-pink-300">PKR {calculateTotal()}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold transition-all disabled:opacity-50 shadow-lg shadow-pink-900/40"
                      >
                        {submitting ? 'Placing Order...' : 'Confirm Order'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                  <h3 className="text-2xl font-bold text-white">Order Received!</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    Thank you for your order! We have logged your transaction details and will start preparing your resin creation.
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-sm space-y-1 my-4">
                    <p className="text-gray-400 text-xs uppercase">Your Order ID:</p>
                    <p className="text-2xl font-extrabold text-pink-300">{orderConfirmed.orderId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Back to Store Catalog
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reviews & Feedback Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl p-8 max-w-2xl mx-auto"
      >
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 text-yellow-300 text-sm font-semibold mb-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Reviews & Suggestions
          </span>
          <h2 className="text-2xl font-bold text-white">Leave Us Your Feedback</h2>
        </div>

        {!reviewSubmitted ? (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name</label>
              <input 
                type="text" 
                placeholder="Optional"
                value={review.name}
                onChange={(e) => setReview({...review, name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Rating</label>
              <select 
                value={review.rating}
                onChange={(e) => setReview({...review, rating: Number(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-white/20 outline-none text-sm text-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                <option value={3}>⭐⭐⭐ (3/5 Average)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Your Thoughts / Suggestions</label>
              <textarea 
                required
                rows={3}
                placeholder="Tell us about your experience..."
                value={review.feedback}
                onChange={(e) => setReview({...review, feedback: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold rounded-xl transition-all text-white shadow-md"
            >
              Submit Feedback
            </button>
          </form>
        ) : (
          <div className="text-center text-pink-200 py-6 space-y-2">
            <MessageSquare className="w-10 h-10 text-pink-400 mx-auto" />
            <p className="font-semibold text-lg">Thank you!</p>
            <p className="text-xs text-gray-300">Your review has been successfully sent to our team.</p>
          </div>
        )}
      </motion.section>
    </main>
  );
}
