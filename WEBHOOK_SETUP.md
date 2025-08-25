# 🔗 Stripe Webhook Setup Guide

## 🚀 Quick Setup

### 1. Install ngrok (if not already installed)
```bash
brew install ngrok/ngrok/ngrok
```

### 2. Start ngrok to expose your local server
```bash
ngrok http 3000
```

### 3. Copy the ngrok URL
You'll see something like: `https://abc123.ngrok.io`

### 4. Set up webhook in Stripe Dashboard
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/webhook`
4. **Events to send**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

### 5. Copy the webhook secret
After creating the webhook, copy the **webhook secret** (starts with `whsec_`)

### 6. Add to your .env file
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing Webhooks

### Test the webhook endpoint:
```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### View webhook events in Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Go to **"Events"** tab
4. You'll see all webhook events sent to your endpoint

## 🔍 Troubleshooting

### Common Issues:
1. **ngrok URL changes**: Restart ngrok and update webhook URL
2. **Webhook not receiving events**: Check ngrok is running
3. **Signature verification failed**: Check webhook secret in .env

### Check webhook logs:
```bash
# View ngrok web interface
open http://localhost:4040

# Check server logs
npm start
```

## 🎯 What Webhooks Do

### `checkout.session.completed`
- Triggered when payment is successful
- Updates user premium status
- Sends confirmation email

### `customer.subscription.created`
- Triggered when subscription starts
- Sets up recurring billing

### `customer.subscription.updated`
- Triggered when subscription changes
- Updates billing information

### `customer.subscription.deleted`
- Triggered when subscription is cancelled
- Removes premium access

## 🛡️ Security

- **Webhook secret**: Never share or commit to Git
- **Signature verification**: Always verify webhook signatures
- **HTTPS only**: Webhooks require HTTPS (ngrok provides this)

## 🚀 Production

For production, replace ngrok URL with your actual domain:
```
https://yourdomain.com/api/webhook
```

## 📞 Support

If webhooks aren't working:
1. Check ngrok is running
2. Verify webhook URL in Stripe
3. Check server logs for errors
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`
