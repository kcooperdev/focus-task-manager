import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Edit3, Trash2 } from "lucide-react";
import { StripeService } from "../services/stripeService";

interface SubscriptionData {
  plan: string;
  price: string;
  nextBilling: string;
  status: "active" | "cancelled" | "past_due";
  paymentMethod: {
    type: string;
    last4: string;
  };
  billingInfo: {
    name: string;
    email: string;
  };
}

export const SubscriptionManagement = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    // Simulate loading subscription data
    setTimeout(() => {
      setSubscription({
        plan: "Premium",
        price: "$15.00 per month",
        nextBilling: "December 1, 2024",
        status: "active",
        paymentMethod: {
          type: "VISA",
          last4: "4242",
        },
        billingInfo: {
          name: "John Doe",
          email: "john@example.com",
        },
      });
      setLoading(false);
    }, 1000);
  };

  const handleUpdateSubscription = () => {
    // Redirect to subscription update page
    window.location.href = "/payment";
  };

  const handleCancelSubscription = () => {
    if (
      confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features."
      )
    ) {
      // Simulate cancellation
      alert(
        "Subscription cancelled. You'll retain access until your current billing period ends."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">← Return to tunlvzn</span>
            </Link>
            <div className="text-sm text-gray-500">Powered by Stripe</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Subscription */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                CURRENT SUBSCRIPTION
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {subscription?.plan}
                    </div>
                    <div className="text-sm text-gray-600">
                      {subscription?.price}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateSubscription}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Update subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel subscription
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Your subscription renews on {subscription?.nextBilling}.
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                PAYMENT METHODS
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {subscription?.paymentMethod.type} ••••{" "}
                        {subscription?.paymentMethod.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        Primary payment method
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                  <Plus className="h-4 w-4" />
                  Add payment method
                </button>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                BILLING INFORMATION
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="text-sm text-gray-900">
                    {subscription?.billingInfo.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-gray-900">
                    {subscription?.billingInfo.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-500 rounded"></div>
                </div>
                <h3 className="font-semibold">Need help?</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Search forum.tunlvzn.com or email support@tunlvzn.com
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <div className="font-medium text-white mb-1">
                    Current Plan
                  </div>
                  <div>
                    {subscription?.plan} - {subscription?.price}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">
                    Next Billing
                  </div>
                  <div>{subscription?.nextBilling}</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">Status</div>
                  <div className="capitalize">{subscription?.status}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    Powered by <span className="font-semibold">stripe</span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <a href="#" className="hover:text-gray-300">
                        Learn more about Stripe Billing
                      </a>
                    </div>
                    <div>
                      <a href="#" className="hover:text-gray-300">
                        Terms
                      </a>{" "}
                      •{" "}
                      <a href="#" className="hover:text-gray-300">
                        Privacy
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
