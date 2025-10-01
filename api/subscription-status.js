const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(200).json({
        isActive: false,
        isTrial: false,
        planType: 'free',
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({
        isActive: false,
        isTrial: false,
        planType: 'free',
      });
    }

    const subscription = subscriptions.data[0];
    const isTrial = subscription.status === 'trialing';
    const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

    res.status(200).json({
      isActive: true,
      isTrial: isTrial,
      trialEndsAt: trialEndsAt,
      planType: 'premium',
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}