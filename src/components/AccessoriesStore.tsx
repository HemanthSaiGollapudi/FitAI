import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, Search, ArrowUpDown, Trash2, 
  Plus, Minus, X, Check, CreditCard, Truck, Star, ChevronRight, Sparkles
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: 'Supplements' | 'Gym Accessories' | 'Clothing' | 'Hydration' | 'Healthy Snacks';
  description: string;
  subType: 'whey' | 'creatine' | 'grip' | 'wraps' | 'belt' | 'sleeves' | 'bands' | 'tshirt' | 'pants' | 'shorts' | 'bottle' | 'bar' | 'butter';
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PRODUCTS_DATABASE: Product[] = [
  // Supplements - Whey
  {
    id: 'supp-on-whey',
    name: 'Optimum Nutrition Gold Standard Whey',
    price: 4999,
    rating: 4.8,
    category: 'Supplements',
    description: 'High-quality isolate primary source whey protein. 24g protein, 5.5g BCAA per serving.',
    subType: 'whey',
    image: '/products/supp-on-whey.jpg'
  },
  {
    id: 'supp-mb-whey',
    name: 'MuscleBlaze Biozyme Whey',
    price: 2999,
    rating: 4.6,
    category: 'Supplements',
    description: 'Clinically tested Enhanced Absorption Formula (EAF) to maximize protein assimilation.',
    subType: 'whey',
    image: '/products/supp-mb-whey.jpg'
  },
  {
    id: 'supp-mp-whey',
    name: 'MyProtein Impact Whey',
    price: 3499,
    rating: 4.7,
    category: 'Supplements',
    description: 'Premium grade whey concentrate. Ideal for daily post-workout recovery muscle cycles.',
    subType: 'whey',
    image: '/products/supp-mp-whey.jpg'
  },
  {
    id: 'supp-avv-whey',
    name: 'Avvatar Whey Protein',
    price: 2799,
    rating: 4.5,
    category: 'Supplements',
    description: '100% double filtered grass-fed whey. Made fresh from fresh milk within 24 hours.',
    subType: 'whey',
    image: '/products/supp-avv-whey.jpg'
  },
  // Supplements - Creatine
  {
    id: 'supp-on-creatine',
    name: 'Optimum Nutrition Creatine',
    price: 1299,
    rating: 4.8,
    category: 'Supplements',
    description: 'Micronized creatine monohydrate. Promotes ATP synthesis and high-intensity cellular power.',
    subType: 'creatine',
    image: '/products/supp-on-creatine.jpg'
  },
  {
    id: 'supp-mb-creatine',
    name: 'MuscleBlaze Creatine Monohydrate',
    price: 799,
    rating: 4.6,
    category: 'Supplements',
    description: 'Pure micronized creatine to boost explosive power and structural muscle hydration.',
    subType: 'creatine',
    image: '/products/supp-mb-creatine.jpg'
  },
  {
    id: 'supp-mp-creatine',
    name: 'MyProtein Creatine',
    price: 999,
    rating: 4.7,
    category: 'Supplements',
    description: 'Convenient pure monohydrate powder to increase physical strength limits during lifts.',
    subType: 'creatine',
    image: '/products/supp-mp-creatine.jpg'
  },
  // Gym Accessories - Grips
  {
    id: 'acc-adj-grip',
    name: 'Adjustable Hand Grip',
    price: 399,
    rating: 4.5,
    category: 'Gym Accessories',
    description: 'Adjustable resistance range (10kg-60kg). Sturdy steel springs to build forearm density.',
    subType: 'grip',
    image: '/products/acc-adj-grip.jpg'
  },
  {
    id: 'acc-met-grip',
    name: 'Premium Metal Hand Grip',
    price: 699,
    rating: 4.8,
    category: 'Gym Accessories',
    description: 'Heavy knurled aluminum handles with high-tension steel springs for advanced grip strength.',
    subType: 'grip',
    image: '/products/acc-met-grip.jpg'
  },
  // Gym Accessories - Lifting Accessories
  {
    id: 'acc-wrist-wraps',
    name: 'Wrist Wraps',
    price: 499,
    rating: 4.6,
    category: 'Gym Accessories',
    description: 'Heavy duty thumb loop wraps. Offers maximal structural wrist safety during bench presses.',
    subType: 'wraps',
    image: '/products/acc-wrist-wraps.jpg'
  },
  {
    id: 'acc-lift-straps',
    name: 'Lifting Straps',
    price: 599,
    rating: 4.7,
    category: 'Gym Accessories',
    description: 'Neoprene padded heavy cotton straps. Eliminates grip fatigue during heavy deadlifts.',
    subType: 'wraps',
    image: '/products/acc-lift-straps.jpg'
  },
  {
    id: 'acc-belt',
    name: 'Weightlifting Belt',
    price: 1499,
    rating: 4.8,
    category: 'Gym Accessories',
    description: '4-inch contoured leather belt with double buckle. Maximizes intra-abdominal load pressure.',
    subType: 'belt',
    image: '/products/acc-belt.jpg'
  },
  {
    id: 'acc-sleeves',
    name: 'Knee Sleeves',
    price: 999,
    rating: 4.7,
    category: 'Gym Accessories',
    description: '7mm premium neoprene compression sleeves to keep knees warm and secure during squat cycles.',
    subType: 'sleeves',
    image: '/products/acc-sleeves.jpg'
  },
  {
    id: 'acc-bands',
    name: 'Resistance Bands Set',
    price: 799,
    rating: 4.5,
    category: 'Gym Accessories',
    description: 'Set of 5 loop bands with stackable loads. Perfect for glute activation and warmup stretches.',
    subType: 'bands',
    image: '/products/acc-bands.jpg'
  },
  // Clothing
  {
    id: 'clot-perf-t',
    name: 'FitAI Performance T-Shirt',
    price: 799,
    rating: 4.7,
    category: 'Clothing',
    description: 'Ultra lightweight, anti-odor performance blend. Engineered with a supportive athletic fit.',
    subType: 'tshirt',
    image: '/products/clot-perf-t.jpg'
  },
  {
    id: 'clot-dry-t',
    name: 'Premium Dry-Fit T-Shirt',
    price: 999,
    rating: 4.8,
    category: 'Clothing',
    description: 'Sweat-wicking dry-fit weave with reflective safety liners. High flexibility stretch zones.',
    subType: 'tshirt',
    image: '/products/clot-dry-t.jpg'
  },
  {
    id: 'clot-pants',
    name: 'FitAI Training Track Pants',
    price: 1299,
    rating: 4.6,
    category: 'Clothing',
    description: 'Sleek tapered joggers with secure zipper pocket compartments. Perfect for cooler training.',
    subType: 'pants',
    image: '/products/clot-pants.jpg'
  },
  {
    id: 'clot-shorts-base',
    name: 'FitAI Gym Shorts',
    price: 699,
    rating: 4.5,
    category: 'Clothing',
    description: 'Lightweight double-layered compression shorts with phone sleeve. Complete quad flexibility.',
    subType: 'shorts',
    image: '/products/clot-shorts-base.jpg'
  },
  {
    id: 'clot-shorts-prem',
    name: 'Premium Training Shorts',
    price: 899,
    rating: 4.7,
    category: 'Clothing',
    description: 'Flexible split leg design for weightlifters. Water-resistant dry weave shell.',
    subType: 'shorts',
    image: '/products/clot-shorts-prem.jpg'
  },
  // Hydration
  {
    id: 'hydr-steel',
    name: 'Premium Stainless Steel Bottle',
    price: 999,
    rating: 4.8,
    category: 'Hydration',
    description: 'Double walled vacuum insulated. Keeps water ice cold for 24 hours. Matte black finish.',
    subType: 'bottle',
    image: '/products/hydr-steel.jpg'
  },
  {
    id: 'hydr-smart',
    name: 'Smart Insulated Bottle',
    price: 1499,
    rating: 4.6,
    category: 'Hydration',
    description: 'LED temp gauge lid indicator. Hourly buzz reminders to lock your water targets.',
    subType: 'bottle',
    image: '/products/hydr-smart.jpg'
  },
  {
    id: 'hydr-shaker',
    name: 'Gym Shaker Bottle',
    price: 499,
    rating: 4.7,
    category: 'Hydration',
    description: 'Leak-proof screw caps with metallic wire whisk. Prepares lump-free whey protein logs.',
    subType: 'bottle',
    image: '/products/hydr-shaker.jpg'
  },
  // Healthy Snacks
  {
    id: 'snack-bite',
    name: 'RiteBite Protein Bar',
    price: 99,
    rating: 4.4,
    category: 'Healthy Snacks',
    description: '20g protein snack bar. Zero added sugar. Rich in dietary fiber & active prebiotics.',
    subType: 'bar',
    image: '/products/snack-bite.jpg'
  },
  {
    id: 'snack-yoga',
    name: 'Yoga Bar Protein Bar',
    price: 89,
    rating: 4.3,
    category: 'Healthy Snacks',
    description: 'All-natural seeds, oats, and whey bars. Free from artificial preservatives.',
    subType: 'bar',
    image: '/products/snack-yoga.jpg'
  },
  {
    id: 'snack-truth',
    name: 'The Whole Truth Protein Bar',
    price: 120,
    rating: 4.7,
    category: 'Healthy Snacks',
    description: 'Cleanest ingredients list. No fillers, sweetened only with dates. Incredible taste.',
    subType: 'bar',
    image: '/products/snack-truth.jpg'
  },
  {
    id: 'snack-myfit',
    name: 'MyFitness Peanut Butter',
    price: 349,
    rating: 4.8,
    category: 'Healthy Snacks',
    description: 'Original American recipe. High protein roasted brown skin peanuts. Unsweetened.',
    subType: 'butter',
    image: '/products/snack-myfit.jpg'
  },
  {
    id: 'snack-pintola',
    name: 'Pintola Peanut Butter',
    price: 399,
    rating: 4.7,
    category: 'Healthy Snacks',
    description: 'Organic certified crunchy peanut butter. 30g protein per serving. Pure oil separation.',
    subType: 'butter',
    image: '/products/snack-pintola.jpg'
  }
];

const ProductImage: React.FC<{ src: string; name: string; subType: Product['subType'] }> = ({ src, name, subType }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let colorClass = "from-brand-violet/20 to-brand-violet/5 text-brand-violet border-brand-violet/20";
  if (subType === 'whey' || subType === 'creatine') {
    colorClass = "from-brand-violet/25 to-brand-violet/5 text-brand-violet border-brand-violet/20";
  } else if (subType === 'grip' || subType === 'wraps' || subType === 'belt' || subType === 'sleeves' || subType === 'bands') {
    colorClass = "from-brand-pink/25 to-brand-pink/5 text-brand-pink border-brand-pink/20";
  } else if (subType === 'tshirt' || subType === 'pants' || subType === 'shorts') {
    colorClass = "from-amber-500/25 to-amber-500/5 text-amber-500 border-amber-500/20";
  } else if (subType === 'bottle') {
    colorClass = "from-brand-cyan/25 to-brand-cyan/5 text-brand-cyan border-brand-cyan/20";
  } else if (subType === 'bar' || subType === 'butter') {
    colorClass = "from-brand-lime/25 to-brand-lime/5 text-brand-lime border-brand-lime/20";
  }

  return (
    <div className={`w-full h-full rounded-xl border bg-gradient-to-br ${colorClass} relative overflow-hidden flex items-center justify-center`}>
      {/* Loading state spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/40 backdrop-blur-sm z-10">
          <div className="h-5 w-5 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Actual Product Photo */}
      {!hasError ? (
        <img 
          src={src} 
          alt={name} 
          loading="lazy" 
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300 ease-out" 
        />
      ) : (
        /* Standardized Fallback when image is unavailable */
        <div className="flex flex-col items-center justify-center p-3 w-full h-full text-center select-none animate-fadeIn">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Product image unavailable</span>
        </div>
      )}
    </div>
  );
};

export const AccessoriesStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'default' | 'low-high' | 'high-low'>('default');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_store_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_store_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Checkout modal wizard
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState('');

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fitai_store_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fitai_store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const categories = ['All', 'Supplements', 'Gym Accessories', 'Clothing', 'Hydration', 'Healthy Snacks'];

  // Filters and sorts
  const filteredProducts = PRODUCTS_DATABASE.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || prod.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (priceSort === 'low-high') return a.price - b.price;
    if (priceSort === 'high-low') return b.price - a.price;
    return 0; // Default sorting
  });

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 1500);
  };

  const handleAddToCart = (product: Product, buyNow = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (buyNow) {
      setIsCartOpen(true);
      handleCheckoutOpen();
    } else {
      showAlert(`"${product.name}" added to cart!`);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isStarred = prev.includes(productId);
      if (isStarred) {
        showAlert('Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showAlert('Added to Wishlist');
        return [...prev, productId];
      }
    });
  };

  const handleCheckoutOpen = () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    setCheckoutStep(1);
    setIsCheckingOut(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setCheckoutStep(3);
      // Generate order number
      const orderNum = `FITAI-${Math.floor(100000 + Math.random() * 900000)}`;
      setCheckoutSuccessMessage(`Order #${orderNum} successfully authorized. Delivery expected in 2-3 Days via FitAI Express.`);
      setCart([]); // Clear cart on completion
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const cartTotal = cartSubtotal + cartTax;

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-bold text-xs tracking-wider uppercase">
              <ShoppingBag className="h-3.5 w-3.5 mr-1 inline-block text-brand-violet animate-bounce" /> FitAI Shop
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
              Accessories Store
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl font-normal leading-relaxed">
              Equip your active training cycles with premium grade sports nutrition, elite mechanical lifting gear, and compression clothing.
            </p>
          </div>

          {/* Cart & Wishlist action anchors */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-3 bg-white/5 border border-white/5 hover:border-brand-pink/30 hover:bg-brand-pink/10 rounded-xl text-zinc-300 hover:text-brand-pink transition-all flex items-center gap-2 text-xs font-bold"
            >
              <Heart className="h-4.5 w-4.5" /> Wishlist ({wishlist.length})
            </button>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-3 bg-gradient-to-r from-brand-violet to-brand-cyan hover:scale-102 rounded-xl text-white transition-all flex items-center gap-2 text-xs font-black shadow-glow-purple"
            >
              <ShoppingBag className="h-4.5 w-4.5" /> Cart ({totalCartCount})
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sorters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mb-8 border-b border-white/5 pb-6">
          {/* Search bar (4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search gear, proteins, shaker caps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
            />
          </div>

          {/* Sort bar (2 cols) */}
          <div className="lg:col-span-3 relative">
            <div className="flex items-center gap-2 w-full">
              <ArrowUpDown className="h-4 w-4 text-zinc-500 shrink-0" />
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none font-bold"
              >
                <option value="default" className="bg-dark-950">Default Sorting</option>
                <option value="low-high" className="bg-dark-950">Price: Low to High</option>
                <option value="high-low" className="bg-dark-950">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs (5 cols) */}
          <div className="lg:col-span-5 flex overflow-x-auto gap-2 py-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold whitespace-nowrap border transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-violet/20 border-brand-violet text-white shadow-glow-purple'
                    : 'bg-dark-900 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.replace('Healthy ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
          {filteredProducts.map((prod) => {
            const isInWishlist = wishlist.includes(prod.id);
            return (
              <div 
                key={prod.id} 
                className="group p-4 bg-dark-900/40 border border-white/5 hover:border-brand-violet/20 rounded-2xl backdrop-blur-md flex flex-col justify-between h-[400px] transition-all hover:scale-[1.01]"
              >
                <div className="space-y-3 relative">
                  
                  {/* Heart wishlist toggle absolute overlay */}
                  <button
                    onClick={() => handleToggleWishlist(prod.id)}
                    className={`absolute top-2.5 right-2.5 p-2 bg-dark-950/70 border rounded-lg transition-all z-10 ${
                      isInWishlist 
                        ? 'border-brand-pink/30 text-brand-pink' 
                        : 'border-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-brand-pink' : ''}`} />
                  </button>

                  <div className="h-36">
                    <ProductImage src={prod.image} name={prod.name} subType={prod.subType} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                      <span>{prod.category}</span>
                      <span className="flex items-center text-amber-400"><Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {prod.rating}</span>
                    </div>
                    
                    <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-brand-cyan transition-colors">
                      {prod.name}
                    </h4>
                    
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Price</span>
                    <span className="text-sm font-display font-black text-white">₹{prod.price.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="py-2.5 bg-white/5 border border-white/10 hover:border-brand-violet/40 hover:bg-brand-violet/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center"
                    >
                      Add to Cart
                    </button>
                    
                    <button
                      onClick={() => handleAddToCart(prod, true)}
                      className="py-2.5 bg-brand-violet text-white rounded-xl text-[10px] font-black hover:scale-102 hover:shadow-glow-purple transition-all text-center"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full p-16 border border-dashed border-white/10 rounded-3xl text-center space-y-3">
              <ShoppingBag className="h-8 w-8 text-zinc-700 mx-auto" />
              <p className="text-xs text-zinc-500">No products match your search or filter metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* SHOPPING CART DRAWER (Slide in from right) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
            />

            {/* Cart Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-dark-900 border-l border-white/10 h-full flex flex-col justify-between shadow-glass text-left"
            >
              <div className="p-4 bg-dark-950/50 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-display font-black text-white text-base flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-brand-violet" /> My Shopping Cart
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                    <ShoppingBag className="h-10 w-10 text-zinc-700 animate-pulse" />
                    <p className="text-xs text-zinc-500 italic">Your cart is currently empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0">
                        <ProductImage src={item.product.image} name={item.product.name} subType={item.product.subType} />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h4 className="text-[11px] font-black text-white line-clamp-1">{item.product.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">₹{item.product.price.toLocaleString('en-IN')}</span>
                        
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5 bg-dark-950 border border-white/5 rounded-lg px-1 py-0.5">
                            <button onClick={() => handleUpdateQuantity(item.product.id, -1)} className="p-1 rounded text-zinc-500 hover:text-white">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-[10px] font-bold px-1 text-white">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.product.id, 1)} className="p-1 rounded text-zinc-500 hover:text-white">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-[10px] text-zinc-600 hover:text-red-400 font-bold flex items-center gap-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bill Details */}
              {cart.length > 0 && (
                <div className="p-4 bg-dark-950/80 border-t border-white/5 space-y-4">
                  <div className="space-y-2 text-xs font-semibold text-zinc-400">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span className="text-white">₹{cartTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-black">
                      <span className="text-white">Total Amount:</span>
                      <span className="text-brand-cyan">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutOpen}
                    className="w-full py-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-transform flex items-center justify-center gap-1.5 shadow-glow-purple"
                  >
                    <CreditCard className="h-4 w-4" /> Secure Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WISHLIST DRAWER (Slide in from right) */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-dark-900 border-l border-white/10 h-full flex flex-col justify-between shadow-glass text-left"
            >
              <div className="p-4 bg-dark-950/50 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-display font-black text-white text-base flex items-center gap-1.5">
                  <Heart className="h-4.5 w-4.5 text-brand-pink fill-brand-pink" /> Saved Wishlist
                </h3>
                <button onClick={() => setIsWishlistOpen(false)} className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                    <Heart className="h-10 w-10 text-zinc-700 animate-pulse" />
                    <p className="text-xs text-zinc-500 italic">No saved products inside Wishlist.</p>
                  </div>
                ) : (
                  PRODUCTS_DATABASE
                    .filter(p => wishlist.includes(p.id))
                    .map((prod) => (
                      <div key={prod.id} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0">
                            <ProductImage src={prod.image} name={prod.name} subType={prod.subType} />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-white line-clamp-1">{prod.name}</h4>
                            <span className="text-[10px] text-brand-cyan font-bold">₹{prod.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleAddToCart(prod);
                              handleToggleWishlist(prod.id); // Remove from wishlist on cart add
                            }}
                            className="px-2.5 py-1.5 bg-brand-violet text-white text-[9px] font-black rounded-lg"
                          >
                            Add +
                          </button>
                          
                          <button 
                            onClick={() => handleToggleWishlist(prod.id)}
                            className="p-1.5 bg-white/5 rounded-lg text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT WIZARD MODAL */}
      <AnimatePresence>
        {isCheckingOut && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div onClick={() => setIsCheckingOut(false)} className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-glass flex flex-col z-10 overflow-hidden text-left"
            >
              <div className="p-4 bg-dark-950/50 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-display font-black text-white text-base">
                  {checkoutStep === 1 && '1. Shipping Credentials'}
                  {checkoutStep === 2 && '2. Payment Configuration'}
                  {checkoutStep === 3 && 'Order Completed Successfully! 🎉'}
                </h3>
                {checkoutStep < 3 && (
                  <button onClick={() => setIsCheckingOut(false)} className="p-1 rounded text-zinc-500 hover:text-white">
                    <X className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                          placeholder="e.g. Champion alias"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                          placeholder="e.g. +91 99999 99999"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Delivery Street Address</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        placeholder="House no., street address, locality"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">City</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                          placeholder="e.g. New Delhi"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Pincode</label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full px-3.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-mono"
                          placeholder="e.g. 110001"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-zinc-500 text-[10px] font-bold">Billing: <strong className="text-white">₹{cartTotal.toLocaleString('en-IN')}</strong></span>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-violet text-white text-xs font-black rounded-xl hover:scale-102 transition-transform flex items-center gap-1 shadow-glow-purple"
                      >
                        Proceed to Payment <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block tracking-wider">Select Payment Option</span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: 'upi', label: 'Instant UPI (GPay/PhonePe)', desc: 'Scan and pay instantly' },
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Secure encryption' },
                        { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay at your door' }
                      ].map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setPaymentMethod(item.id as any)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod === item.id 
                              ? 'bg-brand-violet/20 border-brand-violet text-white' 
                              : 'bg-dark-950 border-white/5 text-zinc-400 hover:border-white/10'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block text-white">{item.label}</span>
                            <span className="text-[9px] text-zinc-500 block mt-0.5">{item.desc}</span>
                          </div>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === item.id ? 'border-brand-violet bg-brand-violet' : 'border-zinc-700'
                          }`}>
                            {paymentMethod === item.id && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-zinc-500 flex items-start gap-1.5">
                      <Truck className="h-4 w-4 shrink-0 text-brand-cyan mt-0.5" />
                      <span>Deliveries handled via FitAI Express logistics. Orders locked and shipped within 12 hours.</span>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(1)}
                        className="text-zinc-500 hover:text-white text-xs font-bold"
                      >
                        Back
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-102 transition-transform flex items-center gap-1 shadow-glow-purple"
                      >
                        <Check className="h-4 w-4" /> Authorize Order Payment
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="space-y-6 text-center py-6">
                    <div className="h-16 w-16 bg-brand-lime/10 border border-brand-lime/30 rounded-full flex items-center justify-center mx-auto text-brand-lime animate-bounce">
                      <Check className="h-8 w-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-display font-black text-white">Consignment Authorized!</h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        {checkoutSuccessMessage}
                      </p>
                    </div>

                    <div className="p-4 bg-dark-950/60 border border-white/5 rounded-xl text-left text-[11px] text-zinc-500 space-y-1 max-w-sm mx-auto">
                      <div>Delivery Name: <strong className="text-white">{shippingAddress.name}</strong></div>
                      <div>Shipping To: <strong className="text-white">{shippingAddress.address}, {shippingAddress.city} ({shippingAddress.pincode})</strong></div>
                      <div>Payment Mode: <strong className="text-white uppercase">{paymentMethod}</strong></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckingOut(false);
                        setIsCartOpen(false);
                      }}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-brand-cyan hover:bg-brand-cyan/15 rounded-xl text-xs font-black text-zinc-300 hover:text-white transition-all mx-auto block"
                    >
                      Close Shop Wizard
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating notification alert */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[200] px-4 py-3 bg-dark-900 border border-brand-violet/30 rounded-xl text-white text-xs font-bold shadow-glass flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" />
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
