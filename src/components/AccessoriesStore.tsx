import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, Search, ArrowUpDown, Trash2, 
  Plus, Minus, X, Check, CreditCard, Truck, Star, ChevronRight, Sparkles
} from 'lucide-react';

interface Variant {
  name: string;      // e.g. '1 kg', 'S', 'Set of 3'
  price: number;     // Price for this variant
}

interface Product {
  id: string;
  name: string;
  brand: 'MuscleBlaze' | 'Boldfit';
  category: 'Supplements' | 'Gym Accessories' | 'Clothing' | 'Hydration';
  description: string;
  rating: number;
  image: string;
  variants: Variant[];
  colors?: string[]; // Specifically for clothing
  sizes?: string[];  // Specifically for clothing
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string; // variant name (e.g. '1 kg')
  selectedSize?: string;    // clothing size (e.g. 'S')
  selectedColor?: string;   // clothing color (e.g. 'Black')
  unitPrice: number;        // The price for this specific variant/size
}

const PRODUCTS_DATABASE: Product[] = [
  // Supplements (MuscleBlaze only)
  {
    id: 'mb-biozyme-whey',
    name: 'MuscleBlaze Biozyme Whey Protein',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: 'Clinically tested Enhanced Absorption Formula (EAF) to maximize protein assimilation and minimize bloating.',
    rating: 4.8,
    image: '/products/mb-biozyme-whey.jpg',
    variants: [
      { name: '1 kg', price: 2999 },
      { name: '2 kg', price: 5499 },
      { name: '4 kg', price: 10499 }
    ]
  },
  {
    id: 'mb-raw-whey',
    name: 'MuscleBlaze Raw Whey Protein',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: '100% pure unsweetened whey concentrate with added digestive enzymes for fast recovery.',
    rating: 4.5,
    image: '/products/mb-raw-whey.jpg',
    variants: [
      { name: '1 kg', price: 2299 },
      { name: '2 kg', price: 4299 }
    ]
  },
  {
    id: 'mb-beginners-whey',
    name: 'MuscleBlaze Beginner\'s Whey Protein',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: 'Ideal starter whey protein with zero added sugar and essential micronutrients.',
    rating: 4.4,
    image: '/products/mb-beginners-whey.jpg',
    variants: [
      { name: '1 kg', price: 1999 },
      { name: '2 kg', price: 3699 }
    ]
  },
  {
    id: 'mb-creatine',
    name: 'MuscleBlaze Creatine Monohydrate',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: 'Pure micronized creatine monohydrate to improve explosive strength and lean muscle mass.',
    rating: 4.7,
    image: '/products/mb-creatine.jpg',
    variants: [
      { name: '100 g', price: 799 },
      { name: '250 g', price: 1299 }
    ]
  },
  {
    id: 'mb-protein-bar',
    name: 'MuscleBlaze Protein Bar',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: 'Rich chocolate protein bar packed with 20g protein and zero added sugar for on-the-go fuel.',
    rating: 4.3,
    image: '/products/mb-protein-bar.jpg',
    variants: [
      { name: 'Single Bar', price: 99 },
      { name: 'Pack of 6', price: 549 },
      { name: 'Pack of 12', price: 999 }
    ]
  },
  {
    id: 'mb-peanut-butter',
    name: 'MuscleBlaze Peanut Butter',
    brand: 'MuscleBlaze',
    category: 'Supplements',
    description: 'High protein peanut butter made with premium roasted peanuts. Creamy, delicious, and unsweetened.',
    rating: 4.6,
    image: '/products/mb-peanut-butter.jpg',
    variants: [
      { name: '340 g', price: 249 },
      { name: '510 g', price: 349 },
      { name: '1 kg', price: 599 }
    ]
  },
  // Gym Accessories (Boldfit only)
  {
    id: 'boldfit-hand-grip',
    name: 'Boldfit Hand Grip',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Ergonomic hand gripper with adjustable resistance and steel springs for grip strength training.',
    rating: 4.5,
    image: '/products/boldfit-hand-grip.jpg',
    variants: [
      { name: 'Single', price: 399 },
      { name: 'Premium Version', price: 699 }
    ]
  },
  {
    id: 'boldfit-wrist-wraps',
    name: 'Boldfit Wrist Wraps',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Heavy duty wrist support bands with thumb loops for bench press and lifting stability.',
    rating: 4.6,
    image: '/products/boldfit-wrist-wraps.jpg',
    variants: [
      { name: '1 Pair', price: 499 }
    ]
  },
  {
    id: 'boldfit-lifting-straps',
    name: 'Boldfit Lifting Straps',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Neoprene padded heavy-duty lifting straps to eliminate grip fatigue during heavy deadlifts.',
    rating: 4.7,
    image: '/products/boldfit-lifting-straps.jpg',
    variants: [
      { name: '1 Pair', price: 599 }
    ]
  },
  {
    id: 'boldfit-belt',
    name: 'Boldfit Weightlifting Belt',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Contoured leather gym belt with double prong metal buckle for core support and spine protection.',
    rating: 4.8,
    image: '/products/boldfit-belt.jpg',
    variants: [
      { name: 'S', price: 1299 },
      { name: 'M', price: 1399 },
      { name: 'L', price: 1499 },
      { name: 'XL', price: 1599 }
    ]
  },
  {
    id: 'boldfit-sleeves',
    name: 'Boldfit Knee Sleeves',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: '7mm premium neoprene compression sleeves to keep knees warm and supported during squats.',
    rating: 4.7,
    image: '/products/boldfit-sleeves.jpg',
    variants: [
      { name: 'S', price: 899 },
      { name: 'M', price: 999 },
      { name: 'L', price: 1099 },
      { name: 'XL', price: 1199 }
    ]
  },
  {
    id: 'boldfit-bands',
    name: 'Boldfit Resistance Bands',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Set of loop resistance bands perfect for glute activation, stretching, and physical therapy.',
    rating: 4.6,
    image: '/products/boldfit-bands.jpg',
    variants: [
      { name: 'Set of 3', price: 499 },
      { name: 'Set of 5', price: 799 }
    ]
  },
  {
    id: 'boldfit-gloves',
    name: 'Boldfit Gym Gloves',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Breathable weightlifting gloves with integrated wrist support wrap and silicone padding.',
    rating: 4.5,
    image: '/products/boldfit-gloves.jpg',
    variants: [
      { name: 'S', price: 499 },
      { name: 'M', price: 549 },
      { name: 'L', price: 599 }
    ]
  },
  {
    id: 'boldfit-rope',
    name: 'Boldfit Skipping Rope',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'High-speed ball bearing jump rope with adjustable steel cable for cardio workouts.',
    rating: 4.4,
    image: '/products/boldfit-rope.jpg',
    variants: [
      { name: 'Standard', price: 299 }
    ]
  },
  {
    id: 'boldfit-mat',
    name: 'Boldfit Yoga Mat',
    brand: 'Boldfit',
    category: 'Gym Accessories',
    description: 'Anti-tear premium TPE yoga mat with alignment lines and dual non-slip textures.',
    rating: 4.6,
    image: '/products/boldfit-mat.jpg',
    variants: [
      { name: '6mm', price: 699 },
      { name: '8mm', price: 899 }
    ]
  },
  // Hydration (Boldfit only)
  {
    id: 'boldfit-shaker',
    name: 'Boldfit Shaker Bottle',
    brand: 'Boldfit',
    category: 'Hydration',
    description: 'Leak-proof shaker bottle with integrated storage compartments and metal wire whisk ball.',
    rating: 4.6,
    image: '/products/boldfit-shaker.jpg',
    variants: [
      { name: '500 ml', price: 399 },
      { name: '700 ml', price: 499 }
    ]
  },
  {
    id: 'boldfit-steel-bottle',
    name: 'Boldfit Stainless Steel Bottle',
    brand: 'Boldfit',
    category: 'Hydration',
    description: 'Premium grade single-walled stainless steel bottle for everyday hydration. Matte black finish.',
    rating: 4.5,
    image: '/products/boldfit-steel-bottle.jpg',
    variants: [
      { name: '750 ml', price: 799 },
      { name: '1 litre', price: 999 }
    ]
  },
  {
    id: 'boldfit-insulated-bottle',
    name: 'Boldfit Insulated Water Bottle',
    brand: 'Boldfit',
    category: 'Hydration',
    description: 'Double-walled vacuum insulated smart bottle. Keeps cold for 24h and displays current temperature.',
    rating: 4.7,
    image: '/products/boldfit-insulated-bottle.jpg',
    variants: [
      { name: '500 ml', price: 899 },
      { name: '750 ml', price: 1099 }
    ]
  },
  // Clothing (Boldfit only)
  {
    id: 'boldfit-tshirt',
    name: 'Boldfit Dry-Fit T-Shirt',
    brand: 'Boldfit',
    category: 'Clothing',
    description: 'Ultra-lightweight sweat-wicking dry-fit polyester weave. Features 4-way stretch flex zones.',
    rating: 4.7,
    image: '/products/boldfit-tshirt.jpg',
    variants: [
      { name: 'S', price: 699 },
      { name: 'M', price: 699 },
      { name: 'L', price: 749 },
      { name: 'XL', price: 749 },
      { name: 'XXL', price: 799 }
    ],
    colors: ['Black', 'Navy Blue', 'Grey', 'White'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'boldfit-shorts',
    name: 'Boldfit Gym Shorts',
    brand: 'Boldfit',
    category: 'Clothing',
    description: 'Breathable mesh gym shorts with zipper pockets and athletic length for maximum mobility.',
    rating: 4.5,
    image: '/products/boldfit-shorts.jpg',
    variants: [
      { name: 'S', price: 599 },
      { name: 'M', price: 599 },
      { name: 'L', price: 649 },
      { name: 'XL', price: 649 },
      { name: 'XXL', price: 699 }
    ],
    colors: ['Black', 'Grey', 'Navy Blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'boldfit-pants',
    name: 'Boldfit Track Pants',
    brand: 'Boldfit',
    category: 'Clothing',
    description: 'Comfortable tapered joggers with deep zippered pockets and elastic waistband.',
    rating: 4.6,
    image: '/products/boldfit-pants.jpg',
    variants: [
      { name: 'S', price: 899 },
      { name: 'M', price: 899 },
      { name: 'L', price: 949 },
      { name: 'XL', price: 999 },
      { name: 'XXL', price: 1049 }
    ],
    colors: ['Black', 'Charcoal Grey', 'Navy Blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }
];

const ProductImage: React.FC<{ src: string; name: string; category: Product['category'] }> = ({ src, name, category }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let colorClass = "from-brand-violet/20 to-brand-violet/5 text-brand-violet border-brand-violet/20";
  if (category === 'Supplements') {
    colorClass = "from-brand-violet/25 to-brand-violet/5 text-brand-violet border-brand-violet/20";
  } else if (category === 'Gym Accessories') {
    colorClass = "from-brand-pink/25 to-brand-pink/5 text-brand-pink border-brand-pink/20";
  } else if (category === 'Clothing') {
    colorClass = "from-amber-500/25 to-amber-500/5 text-amber-500 border-amber-500/20";
  } else if (category === 'Hydration') {
    colorClass = "from-brand-cyan/25 to-brand-cyan/5 text-brand-cyan border-brand-cyan/20";
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
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Product Image Unavailable</span>
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
      const saved = localStorage.getItem('fitai_store_cart_v2');
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

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // discount in percentage
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

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
    localStorage.setItem('fitai_store_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fitai_store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const categories = ['All', 'Supplements', 'Gym Accessories', 'Clothing', 'Hydration'];

  // Filters and sorts
  const filteredProducts = PRODUCTS_DATABASE.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || prod.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const getMinPrice = (p: Product) => p.variants[0]?.price || 0;
    if (priceSort === 'low-high') return getMinPrice(a) - getMinPrice(b);
    if (priceSort === 'high-low') return getMinPrice(b) - getMinPrice(a);
    return 0; // Default sorting
  });

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 1500);
  };

  const handleAddToCart = (
    product: Product,
    variantName?: string,
    sizeName?: string,
    colorName?: string,
    buyNow = false
  ) => {
    // Resolve variant and unit price
    const resolvedVariant = variantName || product.variants[0]?.name;
    const variantObj = product.variants.find(v => v.name === resolvedVariant) || product.variants[0];
    const unitPrice = variantObj?.price || 0;

    setCart(prev => {
      // Find matching item index in the cart
      const existingIdx = prev.findIndex(item => 
        item.product.id === product.id &&
        item.selectedVariant === resolvedVariant &&
        item.selectedSize === sizeName &&
        item.selectedColor === colorName
      );

      if (existingIdx > -1) {
        return prev.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        product,
        quantity: 1,
        selectedVariant: resolvedVariant,
        selectedSize: sizeName,
        selectedColor: colorName,
        unitPrice
      }];
    });

    if (buyNow) {
      setIsCartOpen(true);
      handleCheckoutOpen();
    } else {
      const details = `${resolvedVariant}${sizeName ? ` / Size ${sizeName}` : ''}${colorName ? ` / ${colorName}` : ''}`;
      showAlert(`"${product.name}" (${details}) added to cart!`);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, idx) => {
      if (idx === index) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const handleUpdateCartItem = (
    index: number,
    updates: { selectedSize?: string; selectedColor?: string; selectedVariant?: string }
  ) => {
    setCart(prev => {
      const currentItem = prev[index];
      if (!currentItem) return prev;

      const newSize = updates.selectedSize !== undefined ? updates.selectedSize : currentItem.selectedSize;
      const newColor = updates.selectedColor !== undefined ? updates.selectedColor : currentItem.selectedColor;
      const newVariant = updates.selectedVariant !== undefined ? updates.selectedVariant : currentItem.selectedVariant;

      // Find matching variant/size and get correct price
      const matchedVariantName = newSize || newVariant;
      const targetVariant = currentItem.product.variants.find(v => v.name === matchedVariantName) || currentItem.product.variants[0];
      const newPrice = targetVariant ? targetVariant.price : currentItem.unitPrice;

      // Check if there is another matching item in the cart to merge with
      const matchIdx = prev.findIndex((item, idx) => 
        idx !== index &&
        item.product.id === currentItem.product.id &&
        item.selectedVariant === matchedVariantName &&
        item.selectedSize === newSize &&
        item.selectedColor === newColor
      );

      if (matchIdx > -1) {
        return prev.map((item, idx) => {
          if (idx === matchIdx) {
            return { ...item, quantity: item.quantity + currentItem.quantity };
          }
          return item;
        }).filter((_, idx) => idx !== index);
      }

      return prev.map((item, idx) => 
        idx === index 
          ? { 
              ...item, 
              selectedSize: newSize, 
              selectedColor: newColor, 
              selectedVariant: matchedVariantName,
              unitPrice: newPrice 
            }
          : item
      );
    });
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

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.toUpperCase().trim();
    if (code === 'FITAI10') {
      setAppliedDiscount(10);
      setPromoSuccess('10% Coupon Discount Applied! 🎉');
      setPromoError('');
    } else if (code === 'WELCOME') {
      setAppliedDiscount(5);
      setPromoSuccess('5% Welcome Discount Applied! 🎁');
      setPromoError('');
    } else {
      setPromoError('Invalid coupon code.');
      setPromoSuccess('');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setCheckoutStep(3);
      const orderNum = `FITAI-${Math.floor(100000 + Math.random() * 900000)}`;
      setCheckoutSuccessMessage(`Order #${orderNum} successfully authorized. Delivery expected in 2-3 Days via FitAI Express.`);
      setCart([]); // Clear cart
      setPromoCode('');
      setAppliedDiscount(0);
      setPromoSuccess('');
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  // Calculate dynamic shipping (Free shipping above 999, else 99)
  const cartShipping = cartSubtotal > 999 ? 0 : 99;
  
  // Calculate promo discount
  const discountAmount = Math.round(cartSubtotal * (appliedDiscount / 100));
  
  // 5% GST
  const cartTax = Math.round((cartSubtotal - discountAmount) * 0.05);
  const cartTotal = cartSubtotal - discountAmount + cartShipping + cartTax;

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
              Equip your active training cycles with premium grade sports nutrition from <strong className="text-brand-violet">MuscleBlaze</strong> and elite fitness gear from <strong className="text-brand-cyan">Boldfit</strong>.
            </p>
          </div>

          {/* Cart & Wishlist actions */}
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
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search MuscleBlaze whey, Boldfit belts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
            />
          </div>

          {/* Sort bar */}
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

          {/* Category Tabs */}
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
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
          {filteredProducts.map((prod) => {
            const isInWishlist = wishlist.includes(prod.id);
            return (
              <ProductCard
                key={prod.id}
                prod={prod}
                isInWishlist={isInWishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
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

      {/* SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
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
                  cart.map((item, idx) => {
                    const isClothing = item.product.category === 'Clothing';
                    return (
                      <div key={`${item.product.id}-${item.selectedVariant}-${item.selectedSize}-${item.selectedColor}`} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0">
                          <ProductImage src={item.product.image} name={item.product.name} category={item.product.category} />
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <h4 className="text-[11px] font-black text-white line-clamp-1">{item.product.name}</h4>
                          
                          {/* Display and Edit Attributes */}
                          <div className="flex flex-wrap gap-2 text-[9px] text-zinc-400">
                            {/* Variant / Size selection */}
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-zinc-500">Option:</span>
                              <select 
                                value={item.selectedVariant || ''}
                                onChange={(e) => handleUpdateCartItem(idx, isClothing ? { selectedSize: e.target.value } : { selectedVariant: e.target.value })}
                                className="bg-dark-950 border border-white/10 rounded px-1 text-white font-bold"
                              >
                                {item.product.variants.map(v => (
                                  <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Color Selector (for clothing) */}
                            {isClothing && item.product.colors && (
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-zinc-500">Color:</span>
                                <select
                                  value={item.selectedColor || ''}
                                  onChange={(e) => handleUpdateCartItem(idx, { selectedColor: e.target.value })}
                                  className="bg-dark-950 border border-white/10 rounded px-1 text-white font-bold"
                                >
                                  {item.product.colors.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5">
                            <span className="text-[10px] text-zinc-400 font-mono">₹{item.unitPrice.toLocaleString('en-IN')} x {item.quantity}</span>
                            
                            <div className="flex items-center gap-1.5 bg-dark-950 border border-white/5 rounded-lg px-1 py-0.5">
                              <button onClick={() => handleUpdateQuantity(idx, -1)} className="p-1 rounded text-zinc-500 hover:text-white">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-[10px] font-bold px-1 text-white">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(idx, 1)} className="p-1 rounded text-zinc-500 hover:text-white">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-[10px] text-zinc-600 hover:text-red-400 font-bold flex items-center gap-0.5 ml-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bill Details */}
              {cart.length > 0 && (
                <div className="p-4 bg-dark-950/80 border-t border-white/5 space-y-4">
                  {/* Coupon Code Input */}
                  <form onSubmit={handleApplyPromo} className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo (FITAI10, WELCOME)" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="col-span-3 px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-violet"
                    />
                    <button type="submit" className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-bold">
                      Apply
                    </button>
                  </form>
                  
                  {promoError && <p className="text-[10px] text-red-400 font-bold">{promoError}</p>}
                  {promoSuccess && <p className="text-[10px] text-green-400 font-bold">{promoSuccess}</p>}

                  <div className="space-y-2 text-xs font-semibold text-zinc-400">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({appliedDiscount}%):</span>
                        <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="text-white">{cartShipping === 0 ? 'FREE' : `₹${cartShipping}`}</span>
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

      {/* WISHLIST DRAWER */}
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
                            <ProductImage src={prod.image} name={prod.name} category={prod.category} />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-white line-clamp-1">{prod.name}</h4>
                            <span className="text-[10px] text-brand-cyan font-bold">₹{(prod.variants[0]?.price || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleAddToCart(prod);
                              handleToggleWishlist(prod.id);
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

interface ProductCardProps {
  prod: Product;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (prod: Product, variantName?: string, sizeName?: string, colorName?: string, buyNow?: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ prod, isInWishlist, onToggleWishlist, onAddToCart }) => {
  const isClothing = prod.category === 'Clothing';

  // State for selectors
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const selectedVariant = prod.variants[selectedVariantIdx];
  const selectedColor = prod.colors ? prod.colors[selectedColorIdx] : undefined;

  // Selected size corresponds to selected variant name for clothing
  const selectedSize = isClothing ? selectedVariant.name : undefined;
  const currentPrice = selectedVariant?.price || 0;

  // Let's create an aesthetic brand badge color
  const brandBadgeClass = prod.brand === 'MuscleBlaze' 
    ? 'bg-brand-violet/10 border-brand-violet/20 text-brand-violet' 
    : 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan';

  return (
    <div 
      className="group p-4 bg-dark-900/40 border border-white/5 hover:border-brand-violet/20 rounded-2xl backdrop-blur-md flex flex-col justify-between min-h-[460px] transition-all hover:scale-[1.01] overflow-hidden"
    >
      <div className="space-y-3 relative">
        {/* Wishlist toggle */}
        <button
          onClick={() => onToggleWishlist(prod.id)}
          className={`absolute top-2.5 right-2.5 p-2 bg-dark-950/70 border rounded-lg transition-all z-10 ${
            isInWishlist 
              ? 'border-brand-pink/30 text-brand-pink' 
              : 'border-white/5 text-zinc-500 hover:text-white'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-brand-pink' : ''}`} />
        </button>

        <div className="h-36 relative">
          <ProductImage src={prod.image} name={prod.name} category={prod.category} />
          {/* Brand Badge */}
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${brandBadgeClass}`}>
            {prod.brand}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
            <span>{prod.category}</span>
            <span className="flex items-center text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {prod.rating}
            </span>
          </div>
          
          <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-brand-cyan transition-colors">
            {prod.name}
          </h4>
          
          <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed min-h-[30px]">
            {prod.description}
          </p>
        </div>

        {/* SELECTORS BLOCK */}
        <div className="space-y-2 pt-2">
          {/* Size / Option Selector */}
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
              {isClothing ? 'Select Size' : 'Select Option'}
            </span>
            <div className="flex flex-wrap gap-1">
              {prod.variants.map((v, idx) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                    selectedVariantIdx === idx
                      ? 'bg-brand-violet/20 border-brand-violet text-white'
                      : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector (only for clothing) */}
          {isClothing && prod.colors && (
            <div className="space-y-1 pt-1">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Select Color</span>
              <div className="flex flex-wrap gap-1">
                {prod.colors.map((c, idx) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                      selectedColorIdx === idx
                        ? 'bg-brand-cyan/20 border-brand-cyan text-white'
                        : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            In Stock (Ready to Ship)
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-white/5">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Price</span>
          <span className="text-sm font-display font-black text-white">₹{currentPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(prod, selectedVariant.name, selectedSize, selectedColor)}
            className="py-2.5 bg-white/5 border border-white/10 hover:border-brand-violet/40 hover:bg-brand-violet/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center"
          >
            Add to Cart
          </button>
          
          <button
            onClick={() => onAddToCart(prod, selectedVariant.name, selectedSize, selectedColor, true)}
            className="py-2.5 bg-brand-violet text-white rounded-xl text-[10px] font-black hover:scale-102 hover:shadow-glow-purple transition-all text-center"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
