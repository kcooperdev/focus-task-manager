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
      // For demo purposes, simulate Stripe checkout
      // In production, this would create a real Stripe checkout session

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo, simulate successful payment and activate premium
      const premiumData = {
        isActive: true,
        isTrial: false,
        planType: "premium",
        userId: userId || "demo-user",
        stripeCustomerId: "cus_demo_" + Date.now(),
        subscriptionId: "sub_demo_" + Date.now(),
      };

      localStorage.setItem("subscription_status", JSON.stringify(premiumData));

      // Show success message and refresh
      setTimeout(() => {
        alert(
          "🎉 Payment successful! Premium activated. You now have full access to all premium features. The page will refresh to show your new features!"
        );
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error processing payment. Please try again.");
    }
  }

  static async createCustomerPortalSession(userId: string) {
    try {
      // Redirect to subscription management page
      window.location.href = "/subscription";
    } catch (error) {
      console.error("Error creating portal session:", error);
    }
  }

  static async getSubscriptionStatus(
    userId: string
  ): Promise<SubscriptionStatus> {
    try {
      // Check localStorage for demo subscription status
      const storedStatus = localStorage.getItem("subscription_status");

      if (storedStatus) {
        const data = JSON.parse(storedStatus);

        // Check if trial has expired
        if (data.trialEndsAt && new Date(data.trialEndsAt) < new Date()) {
          // Trial expired, reset to free
          localStorage.removeItem("subscription_status");
          return {
            isActive: false,
            isTrial: false,
            planType: "free",
          };
        }

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
