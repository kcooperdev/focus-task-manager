import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt?: Date;
  planType: "free" | "premium";
}

export class StripeService {
  static async createCheckoutSession(priceId: string, userId?: string) {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: userId || "demo-user",
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

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
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error processing payment. Please try again.");
    }
  }

  static async createCustomerPortalSession(userId: string) {
    try {
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
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Error accessing customer portal. Please try again.");
    }
  }

  static async getSubscriptionStatus(
    userId: string
  ): Promise<SubscriptionStatus> {
    try {
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
