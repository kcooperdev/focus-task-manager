import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt?: Date;
  planType: "free" | "premium";
}

export class StripeService {
  static async createCheckoutSession(priceId: string, userId: string) {
    try {
      // For demo purposes, simulate a successful trial start
      // In production, this would redirect to Stripe checkout

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo, we'll simulate starting a premium subscription by updating local storage
      const premiumData = {
        isActive: true,
        isTrial: false,
        planType: "premium",
        userId: userId,
      };

      localStorage.setItem("subscription_status", JSON.stringify(premiumData));

      // Show success message and refresh
      setTimeout(() => {
        alert(
          "🎉 Premium activated! You now have full access to all premium features. The page will refresh to show your new features!"
        );
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error getting premium. Please try again.");
    }
  }

  static async createCustomerPortalSession(userId: string) {
    try {
      // For demo purposes, show a simple subscription management modal
      const currentStatus = localStorage.getItem("subscription_status");

      if (currentStatus) {
        const data = JSON.parse(currentStatus);
        const isTrial = data.isTrial;
        const trialEndsAt = data.trialEndsAt;

        if (data.isActive) {
          alert(
            "🎉 You have an active Premium subscription!\n\nManage your subscription in the Stripe Customer Portal (in production)."
          );
        } else {
          alert(
            "You don't have an active subscription.\n\nGet Premium to unlock all features!"
          );
        }
      } else {
        alert(
          "You don't have an active subscription.\n\nGet Premium to unlock all features!"
        );
      }
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
