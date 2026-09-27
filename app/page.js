'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    description: 'Custom 6-inch resin display shield. Option to add your personal custom photo prints (+Rs. 100).',
    images: [
      '/images/shield1.jpg',
      '/images/shield2.jpg',
      '/images/shield3.jpg'
    ]
  }
];

// Motion Scroll Variant
const fadeInUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
};

// Reusable Auto-fading Slideshow with Dot Indicators
function ProductImageSlideshow({ images, altText }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImgIndex}
          src={images[currentImgIndex]}
          alt={altText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </AnimatePresence>

      {/* Glass Dot Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImgIndex(idx);
              }}
              className={`h-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                idx === currentImgIndex
                  ? 'w-6 bg-[#ff4b4b]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Streamlit Product Card Component
function ProductCard({ product, onOpenDetails }) {
  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#ff4b4b]/50 hover:bg-white/[0.07] transition-all cursor-pointer group"
    >
      <div className="space-y-3">
        <ProductImageSlideshow images={product.images} altText={product.name} />

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs bg-white/10 backdrop-blur-md text-[#ff4b4b] border border-[#ff4b4b]/30 px-3 py-1 rounded-full font-semibold">
            {product.category}
          </span>
          <span className="text-xs text-[#f1c40f]">⭐ {product.rating}</span>
        </div>

        <h3 className="font-bold text-base text-white group-hover:text-[#ff4b4b] transition-colors">{product.name}</h3>
        <p className="text-xs text-[#8b949e] line-clamp-2">{product.description}</p>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-lg font-extrabold text-[#ff4b4b]">Rs. {product.price}</span>
        
        {/* Streamlit Glassmorphic Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="bg-white/10 backdrop-blur-md hover:bg-[#ff4b4b] border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all transform active:scale-95 flex items-center gap-1.5"
        >
          🔍 View & Order
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  
  // Selected Product Detail Modal State
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  
  // Custom Photo Option for Resin Shield Modal
  const [modalShieldPhotoChecked, setModalShieldPhotoChecked] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Checkout Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review & Feedback Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5 ⭐');
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [opinionName, setOpinionName] = useState('');
  const [opinionText, setOpinionText] = useState('');
  const [opinionSuccess, setOpinionSuccess] = useState(false);

  const categories = ['All', 'Rings', 'Clocks', 'Shields'];

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedPhotos.length > 3) {
      alert('You can only upload a maximum of 3 pictures.');
      return;
    }

    const filePreviews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setUploadedPhotos(prev => [...prev, ...filePreviews]);
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const addToCartFromModal = () => {
    if (!activeModalProduct) return;

    const isShield = activeModalProduct.id === 'resin-shield';
    const photoAddon = isShield && modalShieldPhotoChecked;
    const finalPrice = activeModalProduct.price + (photoAddon ? 100 : 0);

    const itemToAdd = {
      ...activeModalProduct,
      cartItemId: `${activeModalProduct.id}-${photoAddon ? 'custom-photo' : 'standard'}`,
      price: finalPrice,
      hasCustomPhoto: photoAddon,
      photoCount: photoAddon ? uploadedPhotos.length : 0,
      customPhotoPreviews: photoAddon ? uploadedPhotos.map(p => p.name) : []
    };

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === itemToAdd.cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === itemToAdd.cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...itemToAdd, quantity: 1 }];
    });

    // Close Modal and Reset Custom States
    setActiveModalProduct(null);
    setModalShieldPhotoChecked(false);
    setUploadedPhotos([]);

    // Show Toast
    triggerToast(`Added ${activeModalProduct.name} to cart!`);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const orderId = `#RR-${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedOrderId(orderId);

    const itemsFormatted = cart
      .map(item => `• **${item.name}**${item.hasCustomPhoto ? '(+Custom Photos)' : ''} (x${item.quantity}) - Rs.${item.price * item.quantity}`)
      .join('\n');

    const discordPayload = {
      embeds: [
        {
          title: `🛒 NEW ORDER: ${orderId}`,
          color: 0xff4b4b,
          fields: [
            { name: 'Order ID', value: `\`${orderId}\``, inline: true },
            { name: 'Customer Name', value: clientName, inline: true },
            { name: 'Phone Number', value: clientPhone, inline: true },
            { name: 'Delivery Address', value: clientAddress },
            { name: 'Order Items', value: itemsFormatted },
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
          title: '💡 New Streamlit Store Feedback',
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
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa] font-sans selection:bg-[#ff4b4b] selection:text-white relative">
      
      {/* Toast Notification Popup with Fade-In Transition */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-2xl border border-[#ff4b4b]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <span className="text-xl">✅</span>
            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ff4b4b] animate-pulse"></div>
          <span className="font-extrabold text-lg text-white tracking-wider">Resins by R</span>
          <span className="text-xs bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 px-3 py-1 rounded-full font-medium">
            Streamlit Store
          </span>
        </div>

        <button 
          onClick={() => {
            const el = document.getElementById('cart-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all transform active:scale-95 flex items-center gap-2"
        >
          🛒 Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">

        {/* Title Header */}
        <motion.section 
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-2"
        >
          <h1 className="text-3xl font-extrabold text-white">✨ Resins by R | Handcrafted E-Commerce</h1>
          <p className="text-xs text-[#8b949e]">
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
        </motion.section>

        {/* Category Select Radio */}
        <motion.section 
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">📦 Select Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all transform active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-[#ff4b4b] border-[#ff4b4b] text-white' 
                    : 'bg-white/10 border-white/20 text-[#c9d1d9] hover:bg-white/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Products Grid */}
        <motion.section 
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="space-y-6"
        >
          <h2 className="text-xl font-bold text-white">🛍️ Products Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onOpenDetails={(p) => {
                  setActiveModalProduct(p);
                  setModalShieldPhotoChecked(false);
                  setUploadedPhotos([]);
                }} 
              />
            ))}
          </div>
        </motion.section>

        {/* Cart Section */}
        <motion.section 
          id="cart-section"
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6"
        >
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">🛒 Your Order Summary</h2>

          {cart.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-xs text-[#8b949e]">
              Your cart is empty. Click on products above to view details & add to cart!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-xs text-[#8b949e] block">
                        Rs. {item.price} x {item.quantity}
                        {item.hasCustomPhoto && ` (Includes +100 PKR Photo Customization - ${item.photoCount} Uploaded)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="bg-white/10 border border-white/20 text-xs px-2.5 py-1 rounded-lg hover:bg-[#ff4b4b] text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="bg-white/10 border border-white/20 text-xs px-2.5 py-1 rounded-lg hover:bg-[#ff4b4b] text-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-[#ff4b4b]">Rs. {item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Display */}
              <div className="bg-white/5 border-l-4 border-[#ff4b4b] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8b949e] block">Grand Total</span>
                  <span className="text-2xl font-black text-[#ff4b4b]">Rs. {grandTotal}</span>
                </div>

                <button
                  onClick={() => { setOrderStep(1); setIsCheckoutOpen(true); }}
                  className="bg-[#ff4b4b] hover:bg-[#e03e3e] border border-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all transform active:scale-95"
                >
                  Proceed to Checkout ➔
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Customer Review Section */}
        <motion.section 
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">⭐ Submit Customer Review</h2>
          
          {reviewSuccess ? (
            <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
              ✅ Review submitted successfully!
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
                    className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="bg-[#161b22] border border-white/10 rounded-xl p-2.5 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
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
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                />
              </div>

              <button 
                type="submit"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all transform active:scale-95"
              >
                Submit Review
              </button>
            </form>
          )}
        </motion.section>

        {/* Opinion Form Section */}
        <motion.section 
          variants={fadeInUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">💡 Share Opinion / Custom Suggestion</h2>

          {opinionSuccess ? (
            <div className="bg-sky-950/50 border border-sky-500/50 text-sky-400 p-3 rounded-xl text-xs font-semibold">
              ✅ Feedback submitted successfully!
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
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
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
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs w-full text-white focus:outline-none focus:border-[#ff4b4b]"
                />
              </div>

              <button 
                type="submit"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all transform active:scale-95"
              >
                Submit Opinion
              </button>
            </form>
          )}
        </motion.section>

      </main>

      {/* Product Details Dialog Modal */}
      <AnimatePresence>
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#161b22] border border-white/20 rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>🛍️</span> {activeModalProduct.name}
                </h3>
                <button 
                  onClick={() => setActiveModalProduct(null)} 
                  className="text-white/60 hover:text-white bg-white/10 rounded-full w-7 h-7 flex items-center justify-center border border-white/10 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Product Slideshow */}
              <ProductImageSlideshow images={activeModalProduct.images} altText={activeModalProduct.name} />

              {/* Details & Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white/10 text-[#ff4b4b] border border-[#ff4b4b]/30 px-3 py-1 rounded-full font-semibold">
                    {activeModalProduct.category}
                  </span>
                  <span className="text-xs text-[#f1c40f]">⭐ {activeModalProduct.rating}</span>
                </div>
                <p className="text-xs text-[#8b949e] pt-1">{activeModalProduct.description}</p>
              </div>

              {/* Custom Photo Upload Checkbox specifically for Resin Shield */}
              {activeModalProduct.id === 'resin-shield' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="shieldPhotoCheck"
                      checked={modalShieldPhotoChecked}
                      onChange={(e) => setModalShieldPhotoChecked(e.target.checked)}
                      className="accent-[#ff4b4b] w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="shieldPhotoCheck" className="text-xs text-white font-medium cursor-pointer">
                      Add Custom Photo Integration <span className="text-[#ff4b4b] font-bold">(+100 PKR)</span>
                    </label>
                  </div>

                  {/* Photo Upload Area */}
                  {modalShieldPhotoChecked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2 border-t border-white/10"
                    >
                      <label className="text-xs text-[#c9d1d9] block">
                        Upload Custom Pictures (Max 3):
                      </label>
                      
                      {uploadedPhotos.length < 3 && (
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                        />
                      )}

                      {/* Photo Previews */}
                      {uploadedPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {uploadedPhotos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                              <img src={photo.url} alt="Custom preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-[#ff4b4b] text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Price and Add to Cart Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8b949e] block">Total Price</span>
                  <span className="text-xl font-black text-[#ff4b4b]">
                    Rs. {activeModalProduct.price + (activeModalProduct.id === 'resin-shield' && modalShieldPhotoChecked ? 100 : 0)}
                  </span>
                </div>

                <button
                  onClick={addToCartFromModal}
                  className="bg-[#ff4b4b] hover:bg-[#e03e3e] border border-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all transform active:scale-95 flex items-center gap-2"
                >
                  🛒 Add to Cart
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Streamlit Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
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
                    className="bg-white/5 border border-white/10 text-xs p-2.5 rounded-xl w-full text-white focus:outline-none focus:border-[#ff4b4b]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-white/5 border border-white/10 text-xs p-2.5 rounded-xl w-full text-white focus:outline-none focus:border-[#ff4b4b]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Delivery Address *</label>
                  <textarea 
                    required 
                    rows={2}
                    value={clientAddress} 
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="bg-white/5 border border-white/10 text-xs p-2.5 rounded-xl w-full text-white focus:outline-none focus:border-[#ff4b4b]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-[#c9d1d9] block mb-1">Notes (Optional)</label>
                  <input 
                    type="text" 
                    value={clientNotes} 
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="bg-white/5 border border-white/10 text-xs p-2.5 rounded-xl w-full text-white focus:outline-none focus:border-[#ff4b4b]" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-[#ff4b4b] hover:bg-[#e03e3e] border border-white/20 text-white font-bold text-xs w-full py-3 rounded-xl mt-2 transition-all transform active:scale-95"
                >
                  Review Order Details ➔
                </button>
              </form>
            )}

            {orderStep === 2 && (
              <div className="space-y-3 text-xs">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 text-[#c9d1d9]">
                  <p><strong>Name:</strong> {clientName}</p>
                  <p><strong>Phone:</strong> {clientPhone}</p>
                  <p><strong>Address:</strong> {clientAddress}</p>
                  <p className="text-sm font-bold text-[#ff4b4b] pt-1">Total: Rs. {grandTotal}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setOrderStep(1)} 
                    className="bg-white/10 border border-white/20 text-white w-1/3 py-2.5 rounded-xl text-xs hover:bg-white/15 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleConfirmOrder} 
                    className="bg-[#ff4b4b] hover:bg-[#e03e3e] border border-white/20 text-white font-bold w-2/3 py-2.5 rounded-xl text-xs transition-all transform active:scale-95"
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
                
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
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
                  className="inline-block bg-[#238636] hover:bg-[#2ea043] border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all transform active:scale-95"
                >
                  💬 Chat on WhatsApp: +92305-8866692
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#8b949e]">
        © {new Date().getFullYear()} Resins by R | Streamlit Next.js Port
      </footer>
    </div>
  );
}
