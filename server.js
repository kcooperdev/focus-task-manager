const express = require("express");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// API Routes
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { priceId, userId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userId,
      metadata: {
        userId: userId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/create-portal-session", async (req, res) => {
  try {
    const { userId, returnUrl } = req.body;

    // Find or create customer
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userId,
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/subscription-status", async (req, res) => {
  try {
    const { userId } = req.query;

    // Find customer by email
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.json({
        isActive: false,
        isTrial: false,
        planType: "free",
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({
        isActive: false,
        isTrial: false,
        planType: "free",
      });
    }

    const subscription = subscriptions.data[0];
    const isTrial = subscription.status === "trialing";
    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    res.json({
      isActive: true,
      isTrial: isTrial,
      trialEndsAt: trialEndsAt,
      planType: "premium",
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
