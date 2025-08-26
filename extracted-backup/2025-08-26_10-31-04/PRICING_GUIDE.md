# 💰 TagYou Pricing Management Guide

## 🎛️ Quick Price Changes

### **Current Pricing:**
- **3-Month Deal**: £9.99 (999 pence)
- **Monthly**: £4.99 (499 pence) 
- **Yearly**: £49.99 (4999 pence)

## 🚀 How to Change Prices

### **1. Quick Price Updates (Recommended)**

Edit `pricing-config.js` and uncomment/modify these lines:

```javascript
// 💰 Change 3-month deal price to £7.99
PRICING_CONFIG.offers['3-month-promo'].price = 799;

// 💰 Change monthly subscription to £3.99
PRICING_CONFIG.offers['monthly-subscription'].price = 399;

// 💰 Change yearly subscription to £39.99
PRICING_CONFIG.offers['yearly-subscription'].price = 3999;
```

### **2. Add New Pricing Tiers**

```javascript
// 🎁 Add lifetime offer
PRICING_CONFIG.offers['lifetime'] = {
  name: 'TagYou Premium - Lifetime',
  description: 'One-time payment for lifetime access',
  price: 9999, // £99.99
  currency: 'gbp',
  duration: 'Lifetime',
  image: 'https://tagyou.app/logo.png'
};
```

### **3. Change Currency**

```javascript
// 🌍 Change to USD
PRICING_CONFIG.defaults.currency = 'usd';
PRICING_CONFIG.offers['3-month-promo'].currency = 'usd';
PRICING_CONFIG.offers['3-month-promo'].price = 1299; // $12.99
```

## 📊 Pricing Structure

### **Current Offers:**

| Offer | Price | Duration | Type | Savings |
|-------|-------|----------|------|---------|
| 3-Month Deal | £9.99 | 3 months | One-time | 33% off |
| Monthly | £4.99 | 1 month | Recurring | - |
| Yearly | £49.99 | 12 months | Recurring | 17% off |

### **Features by Tier:**

#### **Basic (Free)**
- ✅ 1 squad member
- ✅ Basic tracking
- ❌ Limited messaging

#### **Premium (All Plans)**
- ✅ Unlimited squad members
- ✅ Real-time GPS tracking
- ✅ Voice messages & calling
- ✅ Emergency alerts
- ✅ Advanced analytics
- ✅ Priority support
- ✅ Custom themes

## 🛠️ Technical Implementation

### **Files to Update:**

1. **`pricing-config.js`** - Main pricing configuration
2. **`netlify/functions/create-checkout-session.js`** - Stripe checkout
3. **`server.js`** - Local development checkout
4. **Frontend UI** - Display pricing to users

### **Price Format:**
- **Amounts in pence** (e.g., 999 = £9.99)
- **Currency codes** (gbp, usd, eur)
- **Stripe handles** decimal formatting

## 🎯 Common Price Changes

### **Lower Prices (Promotions):**
```javascript
// 50% off 3-month deal
PRICING_CONFIG.offers['3-month-promo'].price = 499; // £4.99

// Free trial
PRICING_CONFIG.offers['3-month-promo'].price = 0; // Free
```

### **Higher Prices:**
```javascript
// Increase monthly to £6.99
PRICING_CONFIG.offers['monthly-subscription'].price = 699;

// Increase yearly to £59.99
PRICING_CONFIG.offers['yearly-subscription'].price = 5999;
```

### **New Currencies:**
```javascript
// USD pricing
PRICING_CONFIG.offers['3-month-promo'].currency = 'usd';
PRICING_CONFIG.offers['3-month-promo'].price = 1299; // $12.99

// EUR pricing
PRICING_CONFIG.offers['3-month-promo'].currency = 'eur';
PRICING_CONFIG.offers['3-month-promo'].price = 1199; // €11.99
```

## 🔄 Deployment Process

### **After Price Changes:**

1. **Update `pricing-config.js`**
2. **Test locally** with `node server.js`
3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update pricing: 3-month deal now £7.99"
   git push
   ```
4. **Deploy to Netlify** (automatic)
5. **Test payment flow** with Stripe test cards

## 🧪 Testing Prices

### **Stripe Test Cards:**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

### **Test Different Prices:**
```javascript
// Test with £1.99
PRICING_CONFIG.offers['3-month-promo'].price = 199;

// Test with £19.99
PRICING_CONFIG.offers['3-month-promo'].price = 1999;
```

## 📈 Pricing Strategy Tips

### **Psychological Pricing:**
- **£9.99** instead of £10.00
- **£4.99** instead of £5.00
- **£49.99** instead of £50.00

### **Value Propositions:**
- **3-month deal**: "Try premium features"
- **Monthly**: "Flexible monthly billing"
- **Yearly**: "Best value - save 17%"

### **Promotional Pricing:**
- **Launch discount**: 50% off first month
- **Seasonal offers**: Black Friday, New Year
- **Loyalty pricing**: Discounts for long-term users

## 🚨 Important Notes

### **Price Changes:**
- ✅ **Immediate effect** on new purchases
- ⚠️ **Existing subscriptions** continue at old price
- ⚠️ **Stripe webhooks** handle subscription updates

### **Currency Changes:**
- ✅ **New customers** use new currency
- ⚠️ **Existing customers** may need migration
- ⚠️ **Tax implications** vary by region

### **Legal Considerations:**
- ✅ **Clear pricing** displayed to users
- ✅ **Terms of service** updated
- ✅ **Refund policy** communicated

## 🆘 Troubleshooting

### **Common Issues:**

1. **Price not updating**: Check `pricing-config.js` changes
2. **Currency errors**: Verify currency codes in Stripe
3. **Webhook failures**: Check webhook endpoint configuration
4. **Payment declines**: Test with Stripe test cards

### **Debug Commands:**
```javascript
// Check current pricing
console.log(PRICING_CONFIG.offers);

// Format price for display
console.log(PricingHelpers.formatPrice(999, 'gbp')); // £9.99

// Get specific offer
console.log(PricingHelpers.getOffer('3-month-promo'));
```

## 📞 Support

For pricing questions or issues:
1. Check this guide first
2. Test with Stripe test cards
3. Review webhook logs in Netlify
4. Check Stripe Dashboard for payment status

---

**Last Updated**: Current pricing as of latest deployment
**Next Review**: Consider pricing strategy quarterly
