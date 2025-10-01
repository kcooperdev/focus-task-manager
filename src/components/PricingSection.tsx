import React from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { StripeService } from "../services/stripeService";
export const PricingSection = () => {
  return (
    <section className="bg-white py-20 w-full">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works for your needs. No hidden fees, no
            complicated tiers.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-200 text-indigo-800 px-6 py-1 rounded-bl-lg font-medium">
              Free
            </div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-2 mt-6">
              Basic
            </h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-indigo-800">$0</span>
              <span className="text-gray-600 mb-1">/month</span>
            </div>
            <p className="text-gray-600 mb-8">
              Perfect for getting started and exploring how our task management
              works for you.
            </p>
            <ul className="space-y-3 mb-10">
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Unlimited tasks</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Basic time tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Pause and resume functionality</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <XIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <XIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span>Focus pattern insights</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <XIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 transition-colors px-6 py-3 rounded-xl font-bold inline-block text-center"
            >
              Get Started Free
            </Link>
          </div>
          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-8 border border-indigo-500 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-300 text-indigo-800 px-6 py-1 rounded-bl-lg font-medium">
              Recommended
            </div>
            <h3 className="text-2xl font-bold mb-2 mt-6">Premium</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold">$15</span>
              <span className="opacity-90 mb-1">/month</span>
            </div>
            <p className="opacity-90 mb-8">
              Unlock the full potential of your productivity with advanced
              features designed for your needs.
            </p>
            <ul className="space-y-3 mb-10">
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Everything in Basic</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Advanced time tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Detailed focus pattern insights</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Personalized productivity recommendations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>No ads or distractions</span>
              </li>
            </ul>
            <Link
              to="/payment"
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-indigo-800 transition-colors px-6 py-3 rounded-xl font-bold inline-block text-center"
            >
              Get Premium - $15/month
            </Link>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Premium plan unlocks all advanced features. Cancel anytime.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
            <CheckIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
