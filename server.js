const express = require('express');
const stripe = require('stripe');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create Stripe checkout session for premium upgrade
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Create the checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'TagYou Premium - 3 Month Deal',
              description: 'Premium carnival tracking with unlimited squad members and advanced features',
              images: ['https://tagyou.app/logo.png'], // Add your logo URL
            },
            unit_amount: 999, // £9.99 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for the 3-month deal
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
      customer_email: email,
      metadata: {
        userId: userId || 'anonymous',
        offerType: '3-month-promo',
      },
      // Add subscription setup for recurring billing after 3 months
      subscription_data: {
        trial_period_days: 90, // 3 months trial
        metadata: {
          userId: userId || 'anonymous',
        },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook to handle payment events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful for session:', session.id);
      // Here you would update your database to mark the user as premium
      // await updateUserPremiumStatus(session.metadata.userId, true);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Here you would update your database to mark the user as non-premium
      // await updateUserPremiumStatus(deletedSubscription.metadata.userId, false);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Success page
app.get('/success.html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful - TagYou Premium</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .success-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .back-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="success-container">
        <div class="success-icon">🎉</div>
        <h1>Welcome to Premium!</h1>
        <p>Your payment was successful and your premium features are now active. Enjoy unlimited squad members and all the advanced features!</p>
        <a href="/" class="back-btn">Return to App</a>
      </div>
    </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel.html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled - TagYou</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .cancel-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        .cancel-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .back-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="cancel-container">
        <div class="cancel-icon">😔</div>
        <h1>Payment Cancelled</h1>
        <p>No worries! You can always upgrade to premium later. Your free features are still available.</p>
        <a href="/" class="back-btn">Return to App</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`💳 Stripe integration ready`);
});
