import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckIcon, Zap, Clock, Crown, Star } from "lucide-react";
import { StripeService } from "../services/stripeService";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      description: "Perfect for getting started with basic task management",
      features: [
        "Unlimited tasks",
        "Basic time tracking",
        "Pause and resume functionality",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 15,
      description: "Advanced features for serious productivity",
      features: [
        "Everything in Basic",
        "Advanced analytics",
        "Priority support",
        "No ads",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 30,
      description: "Maximum productivity with all features",
      features: [
        "Everything in Premium",
        "Custom integrations",
        "Team collaboration",
        "API access",
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      await StripeService.createCheckoutSession(
        `price_${planId}_${billingPeriod}`
      );
    } catch (error) {
      console.error("Error subscribing:", error);
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return "Free";
    const price = billingPeriod === "yearly" ? plan.price * 10 : plan.price; // 2 months free for yearly
    return `$${price}/${billingPeriod === "yearly" ? "year" : "month"}`;
  };

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
              <span className="text-sm">Back to tunlvzn</span>
            </Link>
            <div className="text-sm text-gray-500">Powered by Stripe</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Update your subscription
          </h1>
          <p className="text-gray-600">
            Choose the plan that works best for your productivity needs
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border-2 p-6 ${
                selectedPlan === plan.id
                  ? "border-indigo-500 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                plan.popular ? "ring-2 ring-indigo-500 ring-opacity-50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {getPrice(plan)}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {selectedPlan === plan.id ? "Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <div className="text-center">
          <button
            onClick={() => handleSubscribe(selectedPlan)}
            disabled={loading || selectedPlan === "basic"}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              selectedPlan === "basic"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : selectedPlan === "basic" ? (
              "Current Plan"
            ) : (
              `Subscribe to ${plans.find((p) => p.id === selectedPlan)?.name}`
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            By subscribing, you authorize tunlvzn to charge you according to the
            terms until you cancel.
          </p>
        </div>
      </div>
    </div>
  );
};
