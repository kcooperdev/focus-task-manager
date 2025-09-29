import { useState, useEffect } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
} from "../services/taskService";

interface User {
  id: string;
  email?: string;
}

export const useTasks = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks when user changes
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedTasks = await fetchTasks(user);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    status?: "not-started" | "in-progress" | "paused" | "completed";
    estimatedTime?: number;
    color?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const newTask = await createTask(user, taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskById = async (taskId: number, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (taskId: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    updateTask: updateTaskById,
    deleteTask: removeTask,
  };
};

