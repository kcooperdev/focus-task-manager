import React, { useState } from "react";

export const SupabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  const initializeSupabase = async () => {
    try {
      const { supabase } = await import("../lib/supabase");
      setSupabaseClient(supabase);
      console.log("Supabase client loaded:", supabase);
      return supabase;
    } catch (err) {
      console.error("Failed to load Supabase client:", err);
      setTestResults({
        connection: "Failed",
        error: "Failed to load Supabase client. Check environment variables.",
      });
      return null;
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log("Testing Supabase connection...");

      const client = supabaseClient || (await initializeSupabase());
      if (!client) {
        setTestResults({
          connection: "Failed",
          error: "Supabase client not available",
        });
        return;
      }

      const { data, error } = await client.from("tasks").select("count");

      setTestResults({
        connection: error ? "Failed" : "Success",
        error: error?.message || null,
        data: data,
      });

      console.log("Connection test result:", { data, error });
    } catch (err) {
      console.error("Connection test failed:", err);
      setTestResults({
        connection: "Failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateTask = async () => {
    setLoading(true);
    try {
      console.log("Testing task creation...");

      const client = supabaseClient || (await initializeSupabase());
      if (!client) {
        setTestResults((prev) => ({
          ...prev,
          createTask: "Failed",
          error: "Supabase client not available",
        }));
        return;
      }

      const { data, error } = await client
        .from("tasks")
        .insert([
          {
            user_id: "test-user-123",
            title: "Test Task from Console",
            status: "not-started",
            estimatedTime: 30,
            color: "blue",
            timeUsed: 0,
            timeLeft: 30,
          },
        ])
        .select();

      setTestResults((prev) => ({
        ...prev,
        createTask: error ? "Failed" : "Success",
        error: error?.message || null,
        createdTask: data?.[0] || null,
      }));

      console.log("Create task result:", { data, error });
    } catch (err) {
      console.error("Create task failed:", err);
      setTestResults((prev) => ({
        ...prev,
        createTask: "Failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setLoading(false);
    }
  };

  const testFetchTasks = async () => {
    setLoading(true);
    try {
      console.log("Testing task fetching...");

      const client = supabaseClient || (await initializeSupabase());
      if (!client) {
        setTestResults((prev) => ({
          ...prev,
          fetchTasks: "Failed",
          error: "Supabase client not available",
        }));
        return;
      }

      const { data, error } = await client
        .from("tasks")
        .select("*")
        .eq("user_id", "test-user-123");

      setTestResults((prev) => ({
        ...prev,
        fetchTasks: error ? "Failed" : "Success",
        error: error?.message || null,
        tasks: data || [],
      }));

      console.log("Fetch tasks result:", { data, error });
    } catch (err) {
      console.error("Fetch tasks failed:", err);
      setTestResults((prev) => ({
        ...prev,
        fetchTasks: "Failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setTestResults({
      environment: {
        supabaseUrl: supabaseUrl ? "Set" : "Missing",
        supabaseKey: supabaseKey ? "Set" : "Missing",
        urlValue: supabaseUrl
          ? `${supabaseUrl.substring(0, 20)}...`
          : "Not found",
        keyValue: supabaseKey
          ? `${supabaseKey.substring(0, 20)}...`
          : "Not found",
      },
    });
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Supabase Test Console</h3>

      <div className="space-y-2 mb-4">
        <button
          onClick={checkEnvironmentVariables}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Check Environment Variables
        </button>
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>

        <button
          onClick={testCreateTask}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Create Task
        </button>

        <button
          onClick={testFetchTasks}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Fetch Tasks
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {testResults && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-bold mb-2">Test Results:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
