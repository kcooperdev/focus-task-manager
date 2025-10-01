import React, { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { StripeService, STRIPE_PRICE_IDS } from "../services/stripeService";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PricingSection = () => {
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

  const getPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return "Free";
    const price = billingPeriod === "yearly" ? plan.price * 10 : plan.price; // 2 months free for yearly
    return `$${price}/${billingPeriod === "yearly" ? "year" : "month"}`;
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.id === "basic") {
      // Redirect to auth for free plan
      window.location.href = "/auth";
      return;
    }

    try {
      // Get the appropriate price ID based on plan and billing period
      let priceId: string;
      if (plan.id === "premium") {
        priceId = STRIPE_PRICE_IDS.PREMIUM_MONTHLY; // You'll need to create yearly versions too
      } else if (plan.id === "pro") {
        priceId = STRIPE_PRICE_IDS.PRO_MONTHLY; // You'll need to create yearly versions too
      } else {
        throw new Error("Invalid plan selected");
      }

      await StripeService.createCheckoutSession(priceId);
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Error starting checkout. Please try again.");
    }
  };

  return (
    <section className="bg-indigo-900 text-white py-20 w-full">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            Choose the plan that works for your needs. No hidden fees, no
            complicated tiers.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-indigo-800/50 rounded-lg p-1 flex border border-indigo-600/30">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-yellow-300 text-indigo-800 shadow-sm"
                  : "text-indigo-200 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-yellow-300 text-indigo-800 shadow-sm"
                  : "text-indigo-200 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-400 text-indigo-800 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-indigo-800/50 rounded-2xl border p-8 ${
                plan.popular
                  ? "border-yellow-300 shadow-lg ring-2 ring-yellow-300 ring-opacity-50"
                  : "border-indigo-600/30 hover:border-indigo-500/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-300 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{getPrice(plan)}</div>
                <p className="text-sm text-indigo-200">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-indigo-200">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`inline-block py-3 px-8 rounded-lg font-semibold text-center transition-all duration-300 ${
                    plan.id === "basic"
                      ? "bg-indigo-700/50 text-indigo-200 hover:bg-indigo-600/50 border border-indigo-600/30"
                      : "bg-yellow-300 hover:bg-yellow-400 text-indigo-800 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-105 relative overflow-hidden group"
                  }`}
                >
                  {plan.id === "basic"
                    ? "Get Started Free"
                    : `Get ${plan.name}`}
                  {plan.id !== "basic" && (
                    <>
                      {/* Shiny overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-800 ease-out"></div>

                      {/* Sparkle effects */}
                      <div className="absolute top-1 left-3 w-1 h-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                      <div className="absolute top-2 right-4 w-1 h-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-100"></div>
                      <div className="absolute bottom-2 left-5 w-1 h-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-200"></div>
                      <div className="absolute bottom-1 right-3 w-1 h-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-300"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-indigo-200 mb-4">
            All plans include our core features. Cancel anytime.
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-300 text-indigo-800 px-3 py-1.5 rounded-full">
            <CheckIcon className="h-3 w-3" />
            <span className="text-xs font-medium">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
