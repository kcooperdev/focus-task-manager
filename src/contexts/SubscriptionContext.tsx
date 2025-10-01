import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { StripeService, SubscriptionStatus } from "../services/stripeService";

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  isPremium: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadSubscriptionStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadSubscriptionStatus(session.user.id);
      } else {
        setUser(null);
        setSubscriptionStatus(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSubscriptionStatus = async (userId: string) => {
    try {
      setLoading(true);
      const status = await StripeService.getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error loading subscription status:", error);
      setSubscriptionStatus({
        isActive: false,
        isTrial: false,
        planType: "free",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscriptionStatus(user.id);
    }
  };

  const isPremium = subscriptionStatus?.isActive || false;
  const isTrial = subscriptionStatus?.isTrial || false;

  const trialDaysLeft = subscriptionStatus?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (subscriptionStatus.trialEndsAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const value: SubscriptionContextType = {
    subscriptionStatus,
    loading,
    refreshSubscription,
    isPremium,
    isTrial,
    trialDaysLeft,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
