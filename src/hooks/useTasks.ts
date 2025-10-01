import { useState, useEffect, useRef } from "react";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch tasks when user changes
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  // Timer for in-progress tasks
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "in-progress") {
            const newTimeUsed = (task.timeUsed || 0) + 1;
            return { ...task, timeUsed: newTimeUsed };
          }
          return task;
        })
      );
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = await updateTask(taskId, updates);

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );

      // If the task is paused, persist the timeUsed
      if (updates.status === "paused" || updates.status === "completed") {
        await updateTask(taskId, { timeUsed: taskToUpdate.timeUsed });
      }

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