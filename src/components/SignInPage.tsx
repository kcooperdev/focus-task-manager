import React, { useState } from "react";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data?.session) {
        navigate("/projects");
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">Sign in to continue with your tasks</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <Link
            to="/signup"
            className="flex-1 text-center py-2 px-4 text-gray-500 hover:text-gray-700"
          >
            Sign Up
          </Link>
          <Link
            to="/signin"
            className="flex-1 text-center py-2 px-4 border-b-2 border-indigo-600 text-indigo-600 font-medium"
          >
            Sign In
          </Link>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Forgot your password?
            </a>
          </div>

          {error && <div className="text-red-600 text-sm -mt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-lg transition-colors"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800">
              Terms
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
