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

      // For demo, we'll simulate starting a trial by updating local storage
      const trialData = {
        isActive: true,
        isTrial: true,
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        planType: "premium",
        userId: userId,
      };

      localStorage.setItem("subscription_status", JSON.stringify(trialData));

      // Show success message and refresh
      setTimeout(() => {
        alert(
          "🎉 Trial started! You now have 3 days of premium access. The page will refresh to show your new features!"
        );
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error starting trial. Please try again.");
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

        if (isTrial && trialEndsAt) {
          const daysLeft = Math.ceil(
            (new Date(trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );
          alert(
            `🎉 You're currently on a free trial!\n\nTrial ends in ${daysLeft} days.\n\nTo continue after the trial, you'll need to upgrade to Premium ($15/month).`
          );
        } else {
          alert(
            "🎉 You have an active Premium subscription!\n\nManage your subscription in the Stripe Customer Portal (in production)."
          );
        }
      } else {
        alert(
          "You don't have an active subscription.\n\nStart your free trial to unlock premium features!"
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
