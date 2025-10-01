import React, { useState, useEffect } from "react";
import { X, Crown, Clock, Zap } from "lucide-react";
import { StripeService, SubscriptionStatus } from "../services/stripeService";
import { supabase } from "../lib/supabase";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  userId: string;
}

export const Paywall: React.FC<PaywallProps> = ({
  isOpen,
  onClose,
  feature,
  userId,
}) => {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadSubscriptionStatus();
    }
  }, [isOpen, userId]);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await StripeService.getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error loading subscription status:", error);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // For demo purposes, we'll simulate starting a trial
      // In production, this would create a Stripe subscription with trial
      await StripeService.createCheckoutSession("price_premium_trial", userId);
      // Note: The page will reload after this, so we don't need to set loading to false
    } catch (error) {
      console.error("Error starting trial:", error);
      setLoading(false); // Only set loading to false if there's an error
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await StripeService.createCheckoutSession("price_premium", userId);
      // Note: The page will reload after this, so we don't need to set loading to false
    } catch (error) {
      console.error("Error upgrading:", error);
      setLoading(false); // Only set loading to false if there's an error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock Premium Features
          </h2>
          <p className="text-gray-600">
            {feature} is a premium feature. Upgrade to access it and more!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="text-green-600" size={16} />
            </div>
            <span className="text-gray-700">Advanced time tracking</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="text-green-600" size={16} />
            </div>
            <span className="text-gray-700">Detailed focus insights</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Crown className="text-green-600" size={16} />
            </div>
            <span className="text-gray-700">Priority support</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Starting Trial..." : "Try Premium Free for 3 Days"}
          </button>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            )}
            {loading ? "Processing..." : "Upgrade to Premium - $15/month"}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Cancel anytime. No commitment required.
        </p>
      </div>
    </div>
  );
};
