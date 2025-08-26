# 💳 Stripe Integration Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in your project root:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Set Up Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from the Stripe Dashboard
3. Replace the placeholder keys in your `.env` file

### 4. Start the Server
```bash
npm start
```

## 🎯 How It Works

### User Flow:
1. **User clicks "Get 3-Month Deal"** in carnival tracker
2. **Loading screen appears** with spinner
3. **Redirects to Stripe Checkout** for secure payment
4. **Payment successful** → redirects to success page
5. **User returns to app** with premium features activated

### Features:
- ✅ **Secure Stripe Checkout**
- ✅ **3-month promotional pricing** (£9.99 for 3 months)
- ✅ **Automatic subscription** after 3 months
- ✅ **Loading states** with beautiful animations
- ✅ **Error handling** with retry options
- ✅ **Success/Cancel pages**
- ✅ **Webhook support** for payment events

## 🔧 Stripe Dashboard Setup

### 1. Create Product
1. Go to **Products** → **Add Product**
2. Name: "TagYou Premium - 3 Month Deal"
3. Description: "Premium carnival tracking with unlimited squad members"
4. Price: £9.99 (one-time payment)
5. Copy the Product ID

### 2. Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to your `.env` file

### 3. Configure Subscription
1. Go to **Products** → **Add Product**
2. Name: "TagYou Premium Monthly"
3. Price: £9.99/month
4. Trial period: 90 days
5. Copy the Price ID

## 🛡️ Security Notes

- Never expose your `STRIPE_SECRET_KEY` in client-side code
- Always use webhooks to handle payment events
- Validate webhook signatures
- Use HTTPS in production

## 📊 Testing

### Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Mode:
- All transactions are in test mode
- No real charges will be made
- Perfect for development and testing

## 🚀 Production Deployment

### 1. Update Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NODE_ENV=production
```

### 2. Set Up Webhooks
- Update webhook URL to your production domain
- Use live webhook secret

### 3. SSL Certificate
- Ensure HTTPS is enabled
- Required for Stripe webhooks

## 📞 Support

For payment issues, users can contact: support@tagyou.app

## 🎉 Success!

Once set up, your premium upgrade will:
- Show the 3-month promotional offer
- Process payments securely via Stripe
- Handle subscriptions automatically
- Provide beautiful success/error pages
- Track all payment events via webhooks
