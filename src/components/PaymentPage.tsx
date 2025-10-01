import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Crown, CheckIcon, Zap, Clock } from "lucide-react";
import { StripeService } from "../services/stripeService";

export const PaymentPage = () => {
  const [loading, setLoading] = useState(false);

  const handleGetPremium = async () => {
    setLoading(true);
    try {
      await StripeService.createCheckoutSession("price_premium");
    } catch (error) {
      console.error("Error getting premium:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="text-white" size={24} />
          </div>

          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Get Premium Access
          </h1>
          <p className="text-gray-600">
            Unlock all premium features for just $15/month
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Features List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Premium Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">Advanced time tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">Detailed focus insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Crown className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">No ads or distractions</span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
              <div className="text-4xl font-bold mb-2">$15</div>
              <div className="text-indigo-200 mb-6">per month</div>

              <button
                onClick={handleGetPremium}
                disabled={loading}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-indigo-800 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-800"></div>
                )}
                {loading ? "Processing..." : "Get Premium Now"}
              </button>

              <p className="text-xs text-indigo-200 mt-4">
                Cancel anytime. No commitment required.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            By purchasing, you agree to our{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
