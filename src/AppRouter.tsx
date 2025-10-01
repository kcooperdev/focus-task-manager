import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { App } from "./App";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import { ProjectList } from "./components/ProjectList";
import { GamifiedDashboard } from "./components/GamifiedDashboard";
// SetupInstructions component not present; fall back to landing page when needed
import { MagicLinkAuth } from "./components/MagicLinkAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { supabase } from "./lib/supabase";

export function AppRouter() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      try {
        // Check if Supabase is properly configured
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          console.warn("Supabase not configured - skipping auth check");
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user: any) => {
    setUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if Supabase is configured
  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== "https://placeholder.supabase.co";

  if (!isSupabaseConfigured) {
    return <App />;
  }

  return (
    <SubscriptionProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<MagicLinkAuth />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} />
              ) : (
                <AuthForm onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/projects"
            element={
              user ? (
                <ProjectList user={user} />
              ) : (
                <AuthForm onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/project/:projectId"
            element={
              user ? (
                <GamifiedDashboard user={user} />
              ) : (
                <AuthForm onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
        </Routes>
      </ErrorBoundary>
    </SubscriptionProvider>
  );
}
