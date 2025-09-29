import React, { useState } from "react";
import { useTasks } from "../hooks/useTasks";

interface User {
  id: string;
  email?: string;
}

interface TaskManagerProps {
  user: User | null;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ user }) => {
  const { tasks, loading, error, addTask, updateTask, deleteTask } =
    useTasks(user);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addTask({
        title: newTaskTitle.trim(),
        status: "not-started",
        estimatedTime: 30,
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

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Task Manager</h2>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
          >
            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-500">
                Status: {task.status} | Time: {task.estimatedTime}min
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleUpdateTask(task.id, {
                    status:
                      task.status === "in-progress" ? "paused" : "in-progress",
                  })
                }
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                {task.status === "in-progress" ? "Pause" : "Start"}
              </button>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No tasks yet. Add one above!
        </p>
      )}
    </div>
  );
};

