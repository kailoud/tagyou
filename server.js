const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Stripe checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, metadata } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || 'price_premium_monthly', // Default price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.origin}/success`,
      cancel_url: cancelUrl || `${req.headers.origin}/cancel`,
      metadata: metadata || {},
      customer_email: req.body.email, // Optional: pre-fill email
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Success page
app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful - TagYou Premium</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
        .success { color: #10b981; font-size: 3rem; margin-bottom: 1rem; }
        .message { color: #6b7280; margin-bottom: 2rem; }
        .btn { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 0.5rem; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="success">✅</div>
      <h1>Welcome to TagYou Premium!</h1>
      <p class="message">Your payment was successful. You now have access to all premium features.</p>
      <a href="/" class="btn">Return to App</a>
    </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled - TagYou</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
        .cancel { color: #ef4444; font-size: 3rem; margin-bottom: 1rem; }
        .message { color: #6b7280; margin-bottom: 2rem; }
        .btn { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 0.5rem; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="cancel">❌</div>
      <h1>Payment Cancelled</h1>
      <p class="message">No worries! You can upgrade to premium anytime.</p>
      <a href="/" class="btn">Return to App</a>
    </body>
    </html>
  `);
});

// Webhook for Stripe events (optional but recommended)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful for session:', session.id);
      // Here you would update your database to mark user as premium
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready`);
  console.log(`📱 Visit http://localhost:${PORT} to test`);
});
