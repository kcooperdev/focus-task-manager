import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export const MagicLinkAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if user is already authenticated (returning from magic link)
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth state...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current session:", session);
      if (session?.user) {
        console.log("User already authenticated, redirecting to projects");
        navigate("/projects");
      }
    };
    checkAuth();

    // Listen for auth state changes (when user returns from magic link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session);
      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in via magic link, redirecting to projects");
        navigate("/projects");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Sending magic link to:", email);
      console.log("Redirect URL:", `${window.location.origin}/auth`);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error("Magic link error:", error);
        setMessage(`Error: ${error.message}`);
        setIsSuccess(false);
      } else {
        console.log("Magic link sent successfully");
        setMessage("Check your email for the magic link!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Magic link catch error:", error);
      setMessage(`Error: ${error}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
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
            Sign in with Magic Link
          </h1>
          <p className="text-gray-600">
            Enter your email and we'll send you a secure link to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-lg transition-colors"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              isSuccess
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
            {isSuccess && (
              <div className="mt-4">
                <p className="text-sm text-green-600 mb-2">
                  If you don't see the email, check your spam folder.
                </p>
                <button
                  onClick={() => navigate("/projects")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Already signed in? Go to dashboard →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            By signing in, you agree to our{" "}
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
