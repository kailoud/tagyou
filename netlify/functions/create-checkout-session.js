const stripe = require('stripe');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { userId, email } = JSON.parse(event.body);

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'Valid email is required' })
      };
    }

    // Initialize Stripe with your secret key
    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

    // Get the origin from headers for success/cancel URLs
    const origin = event.headers.origin || event.headers.host;

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
              images: ['https://tagyou.app/logo.png'],
            },
            unit_amount: 999, // £9.99 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for the 3-month deal
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`,
      customer_email: email,
      metadata: {
        userId: userId || 'anonymous',
        offerType: '3-month-promo',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};
