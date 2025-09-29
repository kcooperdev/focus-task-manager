import { supabase } from "../lib/supabase";

export interface Task {
  id: number;
  user_id: string;
  title: string;
  status: "not-started" | "in-progress" | "paused" | "completed";
  timeUsed?: number;
  timeLeft?: number;
  estimatedTime?: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
}

// Fetch tasks for a specific user
export const fetchTasks = async (user: User) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    return (data as Task[]) || [];
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw error;
  }
};

// Create a new task
export const createTask = async (
  user: User,
  taskData: {
    title: string;
    status?: "not-started" | "in-progress" | "paused" | "completed";
    estimatedTime?: number;
    color?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          title: taskData.title,
          status: taskData.status || "not-started",
          estimatedTime: taskData.estimatedTime || 30,
          color: taskData.color || "blue",
          timeUsed: 0,
          timeLeft: taskData.estimatedTime || 30,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }

    return data[0] as Task;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: number, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select();

    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }

    return data[0] as Task;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: number) => {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
};
