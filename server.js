const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe only if key exists
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe initialized successfully");
  } catch (error) {
    console.error("❌ Stripe initialization failed:", error.message);
  }
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY not found, Stripe features disabled");
}

// Log environment variables (without sensitive data)
console.log("🚀 Server starting...");
console.log("- PORT:", PORT);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("- VITE_SUPABASE_URL exists:", !!process.env.VITE_SUPABASE_URL);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// API Routes
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

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
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

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
    if (!stripe) {
      return res.json({
        isActive: false,
        isTrial: false,
        planType: "free",
      });
    }

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`✅ API test: http://0.0.0.0:${PORT}/api/test`);
});

// Handle process errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
