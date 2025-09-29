import React, { useState, useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import { supabase } from "../lib/supabase";

interface UserDashboardProps {
  user: any;
  onSignOut: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSignOut,
}) => {
  const { tasks, loading, error, addTask, updateTask, deleteTask } =
    useTasks(user);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState(30);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addTask({
        title: newTaskTitle.trim(),
        status: "not-started",
        estimatedTime: newTaskTime,
        color: "blue",
      });
      setNewTaskTitle("");
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: any) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return "▶️";
      case "paused":
        return "⏸️";
      case "completed":
        return "✅";
      default:
        return "⏳";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-sm text-gray-600">Welcome, {user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Task Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(Number(e.target.value))}
                placeholder="Minutes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Task"}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading && tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}

          {tasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-600">
                Create your first task above to get started!
              </p>
            </div>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getStatusIcon(task.status)}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⏱️ {task.estimatedTime} min estimated</span>
                    <span>🕒 {task.timeUsed || 0} min used</span>
                    <span>
                      ⏳ {task.timeLeft || task.estimatedTime} min left
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === "not-started" && (
                    <button
                      onClick={() =>
                        handleUpdateTask(task.id, { status: "in-progress" })
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Start
                    </button>
                  )}

                  {task.status === "in-progress" && (
                    <button
                      onClick={() =>
                        handleUpdateTask(task.id, { status: "paused" })
                      }
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                    >
                      Pause
                    </button>
                  )}

                  {task.status === "paused" && (
                    <button
                      onClick={() =>
                        handleUpdateTask(task.id, { status: "in-progress" })
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Resume
                    </button>
                  )}

                  {task.status === "in-progress" && (
                    <button
                      onClick={() =>
                        handleUpdateTask(task.id, { status: "completed" })
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

