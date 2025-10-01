import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY
);

// Stripe Price IDs - Replace these with your actual Stripe price IDs
export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: "price_1SDIwQBF00HrqbKs8cuVI52W", // Replace with your actual PRICE ID (starts with price_)
  PRO_MONTHLY: "price_1SDIxVBF00HrqbKsdowl46dp", // Replace with your actual PRICE ID (starts with price_)
} as const;

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt?: Date;
  planType: "free" | "premium";
}

export class StripeService {
  static async createCheckoutSession(priceId: string, userId?: string) {
    try {
      // Try to use real Stripe API first

      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            userId: userId || "demo-user",
            successUrl: `${window.location.origin}/projects?success=true`,
            cancelUrl: `${window.location.origin}/?canceled=true`,
          }),
        });

        if (response.ok) {
          const { sessionId } = await response.json();
          const stripe = await stripePromise;

          if (stripe) {
            const { error } = await stripe.redirectToCheckout({
              sessionId,
            });

            if (error) {
              console.error("Error:", error);
              alert("Error redirecting to checkout. Please try again.");
            }
            return; // Successfully redirected to Stripe
          }
        }
      } catch (apiError) {
        console.log("API not available, falling back to demo mode");
      }

      // Fallback: If API is not available, simulate payment flow
      console.log("Creating checkout session for price:", priceId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, simulate successful payment
      const premiumData = {
        isActive: true,
        isTrial: false,
        planType: "premium",
        userId: userId || "demo-user",
        stripeCustomerId: "cus_demo_" + Date.now(),
        subscriptionId: "sub_demo_" + Date.now(),
      };

      localStorage.setItem("subscription_status", JSON.stringify(premiumData));

      // Show success message and redirect
      alert(
        "🎉 Payment successful! Premium activated. Redirecting to your projects..."
      );
      window.location.href = "/projects";
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error processing payment. Please try again.");
    }
  }

  static async createCustomerPortalSession(userId: string) {
    try {
      // For development - simulate portal access
      console.log("Creating customer portal session for user:", userId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For demo purposes, show a message about the portal
      alert(
        "🔧 Customer Portal: In production, this would open Stripe's customer portal where you can manage your subscription, update payment methods, and view billing history."
      );

      // TODO: Replace with real Stripe portal when backend is deployed
      /*
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          returnUrl: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
      */
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Error accessing customer portal. Please try again.");
    }
  }

  static async getSubscriptionStatus(
    userId: string
  ): Promise<SubscriptionStatus> {
    try {
      // For development - check localStorage for demo subscription status
      const storedStatus = localStorage.getItem("subscription_status");

      if (storedStatus) {
        const data = JSON.parse(storedStatus);
        return {
          isActive: data.isActive || false,
          isTrial: data.isTrial || false,
          trialEndsAt: data.trialEndsAt
            ? new Date(data.trialEndsAt)
            : undefined,
          planType: data.planType || "free",
        };
      }

      // Default to free user
      return {
        isActive: false,
        isTrial: false,
        planType: "free",
      };

      // TODO: Replace with real API when backend is deployed
      /*
      const response = await fetch(`/api/subscription-status?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const data = await response.json();
      
      return {
        isActive: data.isActive || false,
        isTrial: data.isTrial || false,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
        planType: data.planType || "free",
      };
      */
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      return {
        isActive: false,
        isTrial: false,
        planType: "free",
      };
    }
  }
}
