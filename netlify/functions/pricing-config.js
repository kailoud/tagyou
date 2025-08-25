// 🎛️ TagYou Pricing Configuration
// Easy to modify pricing, offers, and product details

const PRICING_CONFIG = {
  // 💰 Current Pricing Tiers
  tiers: {
    basic: {
      name: 'Basic',
      price: 0,
      currency: 'gbp',
      features: [
        '1 squad member',
        'Basic tracking',
        'Limited messaging'
      ]
    },

    premium: {
      name: 'Premium',
      price: 999, // £9.99 in pence
      currency: 'gbp',
      duration: '3 months',
      features: [
        'Unlimited squad members',
        'Real-time GPS tracking',
        'Voice messages & calling',
        'Emergency alerts',
        'Advanced analytics',
        'Priority support',
        'Custom themes'
      ]
    },

    premium_monthly: {
      name: 'Premium Monthly',
      price: 999, // £9.99 in pence
      currency: 'gbp',
      duration: '1 month',
      recurring: true,
      features: [
        'Unlimited squad members',
        'Real-time GPS tracking',
        'Voice messages & calling',
        'Emergency alerts',
        'Advanced analytics',
        'Priority support',
        'Custom themes'
      ]
    },

    premium_yearly: {
      name: 'Premium Yearly',
      price: 9999, // £99.99 in pence
      currency: 'gbp',
      duration: '12 months',
      recurring: true,
      savings: '17% off monthly',
      features: [
        'Unlimited squad members',
        'Real-time GPS tracking',
        'Voice messages & calling',
        'Emergency alerts',
        'Advanced analytics',
        'Priority support',
        'Custom themes'
      ]
    }
  },

  // 🎁 Special Offers
  offers: {
    '3-month-promo': {
      name: 'TagYou Premium - 3 Month Deal',
      description: 'Premium carnival tracking with unlimited squad members and advanced features',
      price: 999, // £9.99
      currency: 'gbp',
      duration: '3 months',
      originalPrice: 2997, // £29.97 (3 x £9.99)
      savings: '67% off',
      popular: true,
      image: 'https://tagyou.app/logo.png'
    },

    'monthly-subscription': {
      name: 'TagYou Premium - Monthly',
      description: 'Premium carnival tracking with unlimited squad members and advanced features',
      price: 999, // £9.99
      currency: 'gbp',
      duration: '1 month',
      recurring: true,
      image: 'https://tagyou.app/logo.png'
    },

    'yearly-subscription': {
      name: 'TagYou Premium - Yearly',
      description: 'Premium carnival tracking with unlimited squad members and advanced features',
      price: 9999, // £99.99
      currency: 'gbp',
      duration: '12 months',
      recurring: true,
      originalPrice: 11988, // £119.88 (12 x £9.99)
      savings: '17% off',
      image: 'https://tagyou.app/logo.png'
    }
  },

  // 🌍 Currency Settings
  currencies: {
    gbp: {
      symbol: '£',
      name: 'British Pound',
      decimal_places: 2
    },
    usd: {
      symbol: '$',
      name: 'US Dollar',
      decimal_places: 2
    },
    eur: {
      symbol: '€',
      name: 'Euro',
      decimal_places: 2
    }
  },

  // 🎯 Default Settings
  defaults: {
    currency: 'gbp',
    defaultOffer: '3-month-promo',
    trialDays: 0,
    allowPromoCodes: true
  }
};

// 🛠️ Helper Functions
const PricingHelpers = {
  // Format price for display
  formatPrice: (amount, currency = 'gbp') => {
    const currencyInfo = PRICING_CONFIG.currencies[currency];
    const symbol = currencyInfo.symbol;
    const formattedAmount = (amount / 100).toFixed(2);
    return `${symbol}${formattedAmount}`;
  },

  // Get offer by ID
  getOffer: (offerId) => {
    return PRICING_CONFIG.offers[offerId] || PRICING_CONFIG.offers['3-month-promo'];
  },

  // Get tier by name
  getTier: (tierName) => {
    return PRICING_CONFIG.tiers[tierName] || PRICING_CONFIG.tiers.basic;
  },

  // Calculate savings percentage
  calculateSavings: (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    const savings = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(savings);
  },

  // Get all available offers
  getAllOffers: () => {
    return Object.keys(PRICING_CONFIG.offers).map(key => ({
      id: key,
      ...PRICING_CONFIG.offers[key]
    }));
  },

  // Get all pricing tiers
  getAllTiers: () => {
    return Object.keys(PRICING_CONFIG.tiers).map(key => ({
      id: key,
      ...PRICING_CONFIG.tiers[key]
    }));
  }
};

// 📤 Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRICING_CONFIG, PricingHelpers };
} else {
  // For browser use
  window.PRICING_CONFIG = PRICING_CONFIG;
  window.PricingHelpers = PricingHelpers;
}

// 🎯 Quick Price Updates (Uncomment and modify as needed):

// 💰 Change 3-month deal price to £7.99
// PRICING_CONFIG.offers['3-month-promo'].price = 799;

// 💰 Change monthly subscription to £3.99
// PRICING_CONFIG.offers['monthly-subscription'].price = 399;

// 💰 Change yearly subscription to £39.99
// PRICING_CONFIG.offers['yearly-subscription'].price = 3999;

// 🌍 Change currency to USD
// PRICING_CONFIG.defaults.currency = 'usd';

// 🎁 Add new offer
// PRICING_CONFIG.offers['lifetime'] = {
//   name: 'TagYou Premium - Lifetime',
//   description: 'One-time payment for lifetime access',
//   price: 9999, // £99.99
//   currency: 'gbp',
//   duration: 'Lifetime',
//   image: 'https://tagyou.app/logo.png'
// };
