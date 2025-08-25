# 💳 Stripe Payment Integration Setup

## Quick Setup for Premium Payments

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from the Stripe Dashboard
3. Create a product and price for premium subscription

### 3. Environment Variables
Create a `.env` file in your project root:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Premium Product Configuration
PREMIUM_PRICE_ID=price_premium_monthly
PREMIUM_TRIAL_DAYS=7
```

### 4. Create Stripe Product
In your Stripe Dashboard:
1. Go to Products → Add Product
2. Name: "TagYou Premium"
3. Price: £9.99/month
4. Copy the Price ID (starts with `price_`)

### 5. Start the Server
```bash
npm start
```

## 🚀 How It Works

### User Flow:
1. **User clicks "Start Free Trial"** in carnival tracker
2. **Loading screen appears** with spinner
3. **Redirects to Stripe Checkout** for secure payment
4. **Payment successful** → redirects to success page
5. **User returns to app** with premium features activated

### Features:
- ✅ **Secure Stripe Checkout**
- ✅ **Loading states** with beautiful animations
- ✅ **Error handling** with retry options
- ✅ **Success/Cancel pages**
- ✅ **Webhook support** for payment events
- ✅ **Subscription management**

## 🔧 Customization

### Change Price:
Update `priceId` in `carnival-tracker.js`:
```javascript
priceId: 'your_new_price_id_here'
```

### Change Currency:
Update the Stripe session creation in `server.js`:
```javascript
currency: 'gbp', // or 'usd', 'eur', etc.
```

### Add Trial Period:
In Stripe Dashboard, set up a trial period for your subscription.

## 🛡️ Security Notes

- Never expose your `STRIPE_SECRET_KEY` in client-side code
- Always use webhooks to handle payment events
- Validate webhook signatures
- Use HTTPS in production

## 📞 Support

For payment issues, users can contact: support@tagyou.app
