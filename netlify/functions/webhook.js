const stripe = require('stripe');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log('🎉 Payment successful for session:', session.id);
        
        // Extract user information
        const customerEmail = session.customer_email;
        const userId = session.metadata?.userId || 'anonymous';
        const offerType = session.metadata?.offerType || 'unknown';
        const paymentAmount = session.metadata?.price || session.amount_total;
        const paymentCurrency = session.metadata?.currency || session.currency;
        
        console.log('📧 Customer email:', customerEmail);
        console.log('👤 User ID:', userId);
        console.log('🎁 Offer type:', offerType);
        console.log('💰 Payment amount:', paymentAmount);
        console.log('💱 Payment currency:', paymentCurrency);
        
        // Calculate expiration date based on offer type
        let expiresAt = null;
        if (offerType === '3-month-promo') {
          expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days
        } else if (offerType === 'monthly-subscription') {
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
        } else if (offerType === 'yearly-subscription') {
          expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 365 days
        }
        
        // Prepare payment data for database
        const paymentData = {
          amount: paymentAmount,
          currency: paymentCurrency,
          sessionId: session.id,
          offerType: offerType,
          expiresAt: expiresAt
        };
        
        console.log('✅ Premium access granted for:', customerEmail);
        console.log('📅 Expires at:', expiresAt);
        
        // TODO: Add Supabase integration here
        // You can add database update logic here:
        // await updateUserPremiumStatus(customerEmail, true, paymentData);
        // await sendWelcomeEmail(customerEmail);
        
        break;

      case 'customer.subscription.created':
        const subscription = stripeEvent.data.object;
        console.log('📅 Subscription created:', subscription.id);
        console.log('👤 Customer:', subscription.customer);
        console.log('💰 Amount:', subscription.items.data[0]?.price?.unit_amount);
        
        // Handle new subscription
        // await activateSubscription(subscription.customer);
        
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = stripeEvent.data.object;
        console.log('🔄 Subscription updated:', updatedSubscription.id);
        console.log('📊 Status:', updatedSubscription.status);
        
        // Handle subscription changes
        // await updateSubscriptionStatus(updatedSubscription.customer, updatedSubscription.status);
        
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        console.log('❌ Subscription cancelled:', deletedSubscription.id);
        console.log('👤 Customer:', deletedSubscription.customer);
        
        // Handle subscription cancellation
        // await deactivateSubscription(deletedSubscription.customer);
        
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('💳 Payment intent succeeded:', paymentIntent.id);
        console.log('💰 Amount:', paymentIntent.amount);
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        console.log('💔 Last payment error:', failedPayment.last_payment_error?.message);
        
        // Handle failed payment
        // await handleFailedPayment(failedPayment.customer);
        
        break;

      default:
        console.log(`🤷 Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        received: true,
        eventType: stripeEvent.type,
        message: 'Webhook processed successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Failed to process webhook',
        details: error.message
      })
    };
  }
};
