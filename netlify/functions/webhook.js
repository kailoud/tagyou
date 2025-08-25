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
        
        console.log('📧 Customer email:', customerEmail);
        console.log('👤 User ID:', userId);
        console.log('🎁 Offer type:', offerType);
        
        // Here you would typically:
        // 1. Update your database to mark user as premium
        // 2. Send confirmation email
        // 3. Update user's subscription status
        
        // For now, we'll log the success
        console.log('✅ Premium access granted for:', customerEmail);
        
        // You can add database update logic here:
        // await updateUserPremiumStatus(customerEmail, true);
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
