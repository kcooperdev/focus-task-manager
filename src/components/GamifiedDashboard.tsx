import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Zap,
  Plus,
  Medal,
  Trophy,
  CircleHelp,
  ListTodo,
  Loader,
  CheckCircle2,
  GripVertical,
  Trash2,
  SquarePlus,
  X,
  RotateCcw,
  Info,
  Crown,
  Lock,
} from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { Paywall } from "./Paywall";
import { StripeService } from "../services/stripeService";

interface Task {
  id: string;
  title: string;
  points: number;
  status: "todo" | "progress" | "done";
  timeUsed: number;
  timeLeft: number;
  estimatedTime: number;
  created_at?: string;
  updated_at?: string;
}

interface DashboardProps {
  user: any;
}

export const GamifiedDashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { isPremium, isTrial, trialDaysLeft } = useSubscription();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(5);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");
  const [toastIcon, setToastIcon] = useState("zap");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeTimers, setActiveTimers] = useState<{
    [taskId: string]: number;
  }>({});
  const [timerIntervals, setTimerIntervals] = useState<{
    [taskId: string]: NodeJS.Timeout;
  }>({});
  const [taskTimers, setTaskTimers] = useState<{
    [taskId: string]: {
      timeLeft: number;
      timeUsed: number;
      isRunning: boolean;
    };
  }>({});
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  // Load tasks, project, and profile
  useEffect(() => {
    console.log(
      "GamifiedDashboard useEffect - projectId:",
      projectId,
      "user:",
      user?.id
    );
    if (projectId) {
      loadProject();
      loadTasks();
      loadProfile();
    } else {
      // If no projectId, redirect to projects list
      console.log("No projectId found, redirecting to projects");
      navigate("/projects");
    }
  }, [user, projectId, navigate]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [timerIntervals]);

  const loadProject = async () => {
    if (!projectId) return;

    console.log("Loading project with ID:", projectId, "for user:", user?.id);

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading project:", error);
        navigate("/projects");
      } else {
        console.log("Project loaded successfully:", data);
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      navigate("/projects");
    }
  };

  const loadTasks = async () => {
    if (!projectId) return;

    console.log("Loading tasks for project:", projectId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tasks:", error);
      } else {
        const tasksData = data || [];
        console.log("Tasks loaded:", tasksData.length, "tasks");
        setTasks(tasksData);

        // Calculate XP from completed tasks
        const completedTasks = tasksData.filter(
          (task) => task.status === "done"
        );
        const totalXp = completedTasks.reduce(
          (sum, task) => sum + (task.points || 0),
          0
        );
        setXp(totalXp);
        setLevel(calculateLevel(totalXp));
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
      } else {
        setProfile(data);
        setNameInput(data?.full_name || "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const calculateLevel = (xp: number) => {
    let lvl = 1;
    let totalNeeded = 0;
    while (totalNeeded <= xp) {
      totalNeeded += 100 + (lvl - 1) * 50;
      if (totalNeeded <= xp) lvl++;
    }
    return Math.max(1, lvl);
  };

  const xpForLevel = (level: number) => {
    let total = 0;
    for (let l = 1; l < level; l++) {
      total += 100 + (l - 1) * 50;
    }
    return total;
  };

  const xpNeededForNext = (level: number) => {
    return 100 + (level - 1) * 50;
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !projectId) return;

    // Calculate time based on points (10 XP = 10 minutes, 20 XP = 20 minutes, etc.)
    const estimatedTime = newTaskPoints; // minutes
    const timeLeft = estimatedTime; // minutes

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            user_id: user.id,
            project_id: parseInt(projectId),
            title: newTaskTitle.trim(),
            status: "todo",
            points: newTaskPoints,
            // Use lowercase column names to match Postgres folding
            estimatedtime: estimatedTime,
            timeleft: timeLeft,
            timeused: 0,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating task:", error);
        showToastMessage("Error creating task", "x", error.message);
      } else {
        setTasks([data[0], ...tasks]);
        setNewTaskTitle("");
        setNewTaskPoints(5);
        setShowModal(false);
        showToastMessage("Task added", "square-plus", newTaskTitle);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      showToastMessage("Error creating task", "x", "Please try again");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const oldStatus = task.status;

      // Handle timer logic before updating status
      if (newStatus === "progress" && oldStatus !== "progress") {
        // Start timer when moving to In Progress
        startTaskTimer(taskId, task);
        showToastMessage("Timer started", "loader", task.title);
      } else if (oldStatus === "progress" && newStatus !== "progress") {
        // Stop timer when moving away from In Progress
        stopTaskTimer(taskId);
        showToastMessage("Timer paused", "pause", task.title);
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId)
        .select();

      if (error) {
        console.error("Error updating task:", error);
      } else {
        setTasks(tasks.map((t) => (t.id === taskId ? data[0] : t)));

        // Handle XP changes
        if (oldStatus !== "done" && newStatus === "done") {
          const points = task.points || 0;
          const newXp = xp + points;
          setXp(newXp);
          setLevel(calculateLevel(newXp));
          showToastMessage(`+${points} XP`, "zap", `Completed: ${task.title}`);
        } else if (oldStatus === "done" && newStatus !== "done") {
          const points = task.points || 0;
          const newXp = Math.max(0, xp - points);
          setXp(newXp);
          setLevel(calculateLevel(newXp));
          showToastMessage(
            `${-points} XP`,
            "rotate-ccw",
            `Reopened: ${task.title}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
      } else {
        setTasks(tasks.filter((t) => t.id !== taskId));

        // Refund XP if task was completed
        if (task.status === "done") {
          const points = task.points || 0;
          const newXp = Math.max(0, xp - points);
          setXp(newXp);
          setLevel(calculateLevel(newXp));
          showToastMessage(
            `${-points} XP`,
            "rotate-ccw",
            `Removed: ${task.title}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const updateTaskTitle = async (taskId: string, newTitle: string) => {
    try {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const { data, error } = await supabase
        .from("tasks")
        .update({ title: trimmed })
        .eq("id", taskId)
        .select();
      if (error) {
        console.error("Error updating task title:", error);
        return;
      }
      if (data && data[0]) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data[0] : t)));
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update task title:", err);
    }
  };

  const showToastMessage = (
    primary: string,
    icon: string,
    secondary: string = ""
  ) => {
    setToastMessage(secondary ? `${primary} • ${secondary}` : primary);
    setToastIcon(icon);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const startTaskTimer = (taskId: string, task: Task) => {
    // Clear existing timer if any
    if (timerIntervals[taskId]) {
      clearInterval(timerIntervals[taskId]);
    }

    // Initialize timer state if not exists
    if (!taskTimers[taskId]) {
      setTaskTimers((prev) => ({
        ...prev,
        [taskId]: {
          timeLeft: Math.max(
            0,
            Math.floor(
              ((task as any).timeLeft ?? (task as any).estimatedTime ?? 0) * 60
            )
          ),
          timeUsed: Math.max(0, Math.floor(((task as any).timeUsed ?? 0) * 60)),
          isRunning: true,
        },
      }));
    } else {
      setTaskTimers((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          isRunning: true,
        },
      }));
    }

    const interval = setInterval(() => {
      setTaskTimers((prev) => {
        const currentTimer = prev[taskId];
        if (!currentTimer || !currentTimer.isRunning) return prev;

        const newTimeLeft = Math.max(0, currentTimer.timeLeft - 1);
        const newTimeUsed = currentTimer.timeUsed + 1;

        // Update the task in the database every 10 seconds
        if (newTimeUsed % 10 === 0) {
          updateTaskTimeInDatabase(taskId, newTimeLeft, newTimeUsed);
        }

        return {
          ...prev,
          [taskId]: {
            ...currentTimer,
            timeLeft: newTimeLeft,
            timeUsed: newTimeUsed,
          },
        };
      });
    }, 1000);

    setTimerIntervals((prev) => ({ ...prev, [taskId]: interval }));
  };

  const stopTaskTimer = (taskId: string) => {
    if (timerIntervals[taskId]) {
      clearInterval(timerIntervals[taskId]);
      setTimerIntervals((prev) => {
        const newIntervals = { ...prev };
        delete newIntervals[taskId];
        return newIntervals;
      });
    }

    // Update timer state to paused
    setTaskTimers((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: false,
      },
    }));
  };

  const updateTaskTimeInDatabase = async (
    taskId: string,
    timeLeftSeconds: number,
    timeUsedSeconds: number
  ) => {
    try {
      await supabase
        .from("tasks")
        .update({
          timeLeft: Math.ceil(timeLeftSeconds / 60), // Convert back to minutes
          timeUsed: Math.ceil(timeUsedSeconds / 60), // Convert back to minutes
        })
        .eq("id", taskId);
    } catch (error) {
      console.error("Failed to update task time:", error);
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      // Create a unique filename
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      // Store under user folder to satisfy RLS policy
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (error) {
        console.error("Error uploading avatar:", error);
        showToastMessage("Error uploading avatar", "x", error.message);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" });

      if (updateError) {
        console.error("Error updating profile:", updateError);
        showToastMessage("Error updating profile", "x", updateError.message);
        return;
      }

      // Update local state
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarPreview("");
      showToastMessage(
        "Avatar updated!",
        "check-circle-2",
        "Profile photo changed"
      );
      // Refresh profile from DB to keep in sync
      loadProfile();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      showToastMessage("Error uploading avatar", "x", "Please try again");
    }
  };

  const saveDisplayName = async () => {
    try {
      if (avatarFile) {
        await uploadAvatar();
      }
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: nameInput }, { onConflict: "id" });
      if (error) {
        console.error("Error updating name:", error);
        showToastMessage("Error updating name", "x", error.message);
        return;
      }
      setProfile((prev) => ({ ...prev, full_name: nameInput }));
      showToastMessage("Name updated", "check-circle-2");
      loadProfile();
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const task = tasks.find((t) => t.id === draggedTask);
    if (!task || task.status === newStatus) return;

    updateTaskStatus(draggedTask, newStatus);
    setDraggedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "progress":
        return "bg-green-100 text-green-800";
      case "done":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <ListTodo className="w-4.5 h-4.5 text-neutral-300" />;
      case "progress":
        return <Loader className="w-4.5 h-4.5 text-neutral-300" />;
      case "done":
        return <CheckCircle2 className="w-4.5 h-4.5 text-neutral-300" />;
      default:
        return <ListTodo className="w-4.5 h-4.5 text-neutral-300" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Backlog";
      case "progress":
        return "Active";
      case "done":
        return "Completed";
      default:
        return "";
    }
  };

  const currentLevelBase = xpForLevel(level);
  const toNext = xpNeededForNext(level);
  const progress = Math.max(0, Math.min(1, (xp - currentLevelBase) / toNext));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-neutral-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0B0D12] text-neutral-100 antialiased selection:bg-indigo-500/30 selection:text-white"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      }}
    >
      {/* App Wrapper */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-400">
              <Link
                to="/projects"
                className="px-2 py-1 rounded-md bg-neutral-900/60 ring-1 ring-white/10 hover:bg-neutral-800/60 transition-colors"
              >
                Projects
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="px-2 py-1 rounded-md bg-neutral-900/60 ring-1 ring-white/10">
                {project?.name || "Loading..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-md bg-neutral-900/60 ring-1 ring-white/10 px-2.5 py-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-300">{xp} XP</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors px-3 py-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full ring-1 ring-white/10 overflow-hidden cursor-pointer hover:ring-white/20 transition-all"
                onClick={handleAvatarClick}
                title="Click to change avatar"
              >
                <img
                  alt="User"
                  src={
                    profile?.avatar_url
                      ? `${profile.avatar_url}?v=${encodeURIComponent(
                          profile?.updated_at || ""
                        )}`
                      : `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden sm:inline text-sm text-neutral-300 truncate max-w-[160px]">
                {profile?.full_name || user.email}
              </span>
            </div>
            {(isPremium || isTrial) && (
              <button
                onClick={() =>
                  StripeService.createCustomerPortalSession(user.id)
                }
                className="px-3 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors text-sm"
              >
                Manage Subscription
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/15 ring-1 ring-inset ring-red-500/30 text-red-300 hover:text-red-200 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Gamification Banner */}
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-xl bg-neutral-950 ring-1 ring-white/10">
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background:
                  "radial-gradient(1200px 500px at 80% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(800px 400px at 20% -30%, rgba(236,72,153,0.12), transparent 60%)",
              }}
            ></div>
            <div className="relative p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/30 flex items-center justify-center">
                    <Medal className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="text-[13px] text-neutral-400">
                      Current Level
                    </div>
                    <div className="text-xl md:text-2xl tracking-tight font-semibold">
                      Level {level}
                    </div>
                  </div>
                </div>
                <div className="flex-1 md:max-w-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-neutral-400">
                      Progress to next level
                    </span>
                    <span className="text-[13px] text-neutral-400">
                      {Math.max(0, xp - currentLevelBase)} / {toNext} XP
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-900 ring-1 ring-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                      style={{ width: `${progress * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-lg bg-neutral-900 ring-1 ring-white/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-300" />
                      <span className="text-sm font-medium">{xp} XP</span>
                    </div>
                    <div className="mt-1 text-[12px] text-neutral-400">
                      {Math.max(0, currentLevelBase + toNext - xp)} XP to Level{" "}
                      {level + 1}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHowItWorks(true)}
                    className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 ring-1 ring-white/10 text-neutral-200 hover:text-white transition-colors"
                  >
                    <CircleHelp className="w-4 h-4" />
                    <span className="text-sm">How it works</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Analytics Section */}
        {!isPremium && (
          <div className="mt-6 mb-6">
            <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 ring-1 ring-amber-500/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-200">
                      Unlock Premium Analytics
                    </h3>
                    <p className="text-sm text-amber-300/80">
                      Get detailed insights into your productivity patterns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPaywallFeature("Advanced Analytics");
                    setShowPaywall(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Features Preview */}
        {isPremium && (
          <div className="mt-6 mb-6">
            <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 ring-1 ring-indigo-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="text-indigo-400" size={20} />
                <h3 className="text-lg font-semibold text-indigo-200">
                  Premium Analytics
                </h3>
                {isTrial && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                    {trialDaysLeft} days left
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-300">
                    {tasks.filter((t) => t.status === "done").length}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Tasks Completed
                  </div>
                </div>
                <div className="bg-neutral-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-300">
                    {Math.round(
                      tasks.reduce(
                        (acc, task) => acc + (task.timeUsed || 0),
                        0
                      ) / 60
                    )}
                    m
                  </div>
                  <div className="text-sm text-neutral-400">Total Time</div>
                </div>
                <div className="bg-neutral-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-300">
                    {Math.round(
                      tasks.reduce(
                        (acc, task) => acc + (task.timeUsed || 0),
                        0
                      ) /
                        60 /
                        Math.max(
                          1,
                          tasks.filter((t) => t.status === "done").length
                        )
                    )}
                    m
                  </div>
                  <div className="text-sm text-neutral-400">Avg per Task</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Board */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column: To Do */}
          <section className="rounded-xl bg-neutral-950 ring-1 ring-white/10">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4.5 h-4.5 text-neutral-300" />
                <h2 className="text-[15px] tracking-tight font-semibold">
                  To Do
                </h2>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-neutral-900 ring-1 ring-white/10 text-neutral-300">
                  {tasks.filter((t) => t.status === "todo").length}
                </span>
              </div>
              <div className="text-xs text-neutral-500">Backlog</div>
            </div>
            <div
              className="min-h-[260px] p-3 space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "todo")}
            >
              {tasks
                .filter((t) => t.status === "todo")
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteTask}
                    onUpdateTitle={updateTaskTitle}
                    activeTimers={activeTimers}
                    taskTimers={taskTimers}
                    formatTime={formatTime}
                  />
                ))}
            </div>
          </section>

          {/* Column: In Progress */}
          <section className="rounded-xl bg-neutral-950 ring-1 ring-white/10">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Loader className="w-4.5 h-4.5 text-neutral-300" />
                <h2 className="text-[15px] tracking-tight font-semibold">
                  In Progress
                </h2>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-neutral-900 ring-1 ring-white/10 text-neutral-300">
                  {tasks.filter((t) => t.status === "progress").length}
                </span>
              </div>
              <div className="text-xs text-neutral-500">Active</div>
            </div>
            <div
              className="min-h-[260px] p-3 space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "progress")}
            >
              {tasks
                .filter((t) => t.status === "progress")
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteTask}
                    onUpdateTitle={updateTaskTitle}
                    activeTimers={activeTimers}
                    taskTimers={taskTimers}
                    formatTime={formatTime}
                  />
                ))}
            </div>
          </section>

          {/* Column: Done */}
          <section className="rounded-xl bg-neutral-950 ring-1 ring-white/10">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-neutral-300" />
                <h2 className="text-[15px] tracking-tight font-semibold">
                  Done
                </h2>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-neutral-900 ring-1 ring-white/10 text-neutral-300">
                  {tasks.filter((t) => t.status === "done").length}
                </span>
              </div>
              <div className="text-xs text-neutral-500">Completed</div>
            </div>
            <div
              className="min-h-[260px] p-3 space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "done")}
            >
              {tasks
                .filter((t) => t.status === "done")
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDelete={deleteTask}
                    onUpdateTitle={updateTaskTitle}
                    activeTimers={activeTimers}
                    taskTimers={taskTimers}
                    formatTime={formatTime}
                  />
                ))}
            </div>
          </section>
        </div>

        {/* Subtle help */}
        <div className="mt-6 text-center text-sm text-neutral-500">
          Drag tasks between columns. Completing a task awards its XP. Moving it
          out of Done refunds that XP.
        </div>
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative mx-auto max-w-md w-full mt-24 px-4">
            <div className="rounded-xl bg-neutral-950 ring-1 ring-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SquarePlus className="w-4.5 h-4.5 text-neutral-300" />
                  <h3 className="text-[17px] tracking-tight font-semibold">
                    Create Task
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-900 ring-1 ring-inset ring-white/10/0 hover:ring-white/10 transition"
                >
                  <X className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
              <form onSubmit={createTask} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    placeholder="Describe the task…"
                    className="w-full rounded-md bg-neutral-900 ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500/60 outline-none px-3 py-2 text-sm placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Points
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 20, 30, 40].map((points) => (
                      <label key={points} className="relative">
                        <input
                          type="radio"
                          name="points"
                          value={points}
                          checked={newTaskPoints === points}
                          onChange={(e) =>
                            setNewTaskPoints(Number(e.target.value))
                          }
                          className="peer sr-only"
                        />
                        <div className="w-full px-3 py-2 rounded-md bg-neutral-900 ring-1 ring-white/10 text-neutral-300 text-sm flex items-center justify-center peer-checked:bg-indigo-500/10 peer-checked:text-indigo-300 peer-checked:ring-indigo-500/30 cursor-pointer">
                          {points} XP
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Premium Features */}
                {!isPremium && (
                  <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 ring-1 ring-amber-500/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-200">
                        Premium Features
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-amber-300/80">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        Priority levels (High, Medium, Low)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-300/80">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        Advanced scheduling & deadlines
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-300/80">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        Custom task templates
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setPaywallFeature("Advanced Task Features");
                        setShowPaywall(true);
                      }}
                      className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all duration-200 text-sm"
                    >
                      Upgrade to Unlock
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 ring-1 ring-white/10 text-neutral-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-200 transition"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* How it Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHowItWorks(false)}
          ></div>
          <div className="relative mx-auto max-w-md w-full mt-24 px-4">
            <div className="rounded-xl bg-neutral-950 ring-1 ring-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleHelp className="w-4.5 h-4.5 text-neutral-300" />
                  <h3 className="text-[17px] tracking-tight font-semibold">
                    How it Works
                  </h3>
                </div>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-900 ring-1 ring-inset ring-white/10/0 hover:ring-white/10 transition"
                >
                  <X className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-200">
                    XP to Minutes Mapping
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">10 XP</span>
                      <span className="text-neutral-400">=</span>
                      <span className="text-neutral-300">10 minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">20 XP</span>
                      <span className="text-neutral-400">=</span>
                      <span className="text-neutral-300">20 minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">30 XP</span>
                      <span className="text-neutral-400">=</span>
                      <span className="text-neutral-300">30 minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">40 XP</span>
                      <span className="text-neutral-400">=</span>
                      <span className="text-neutral-300">40 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-200">
                    How to Play
                  </h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <p>
                      • <strong>Board = Projects:</strong> Each board represents
                      a project
                    </p>
                    <p>
                      • <strong>Tasks:</strong> Each project contains many tasks
                    </p>
                    <p>
                      • <strong>Timer:</strong> Timer starts when task moves to
                      In Progress
                    </p>
                    <p>
                      • <strong>Timer stops:</strong> When task moves back to To
                      Do
                    </p>
                    <p>
                      • <strong>Complete tasks:</strong> Drag to Done to earn XP
                      and level up
                    </p>
                    <p>
                      • <strong>Refund XP:</strong> Moving tasks out of Done
                      refunds XP
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-200">
                    Leveling Up
                  </h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <p>• Level 1: 0 XP</p>
                    <p>• Level 2: 100 XP</p>
                    <p>• Level 3: 250 XP</p>
                    <p>• Each level requires +50 XP more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAvatarModal(false)}
          ></div>
          <div className="relative mx-auto max-w-md w-full mt-24 px-4">
            <div className="rounded-xl bg-neutral-950 ring-1 ring-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[17px] tracking-tight font-semibold">
                    Change Avatar
                  </h3>
                </div>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-900 ring-1 ring-inset ring-white/10/0 hover:ring-white/10 transition"
                >
                  <X className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Current Avatar Preview */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 rounded-full ring-2 ring-white/10 overflow-hidden">
                    <img
                      alt="Current Avatar"
                      src={
                        avatarPreview ||
                        profile?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* File Input */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="px-4 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors text-sm">
                      Choose Photo
                    </div>
                  </label>

                  {avatarFile && (
                    <div className="text-xs text-neutral-400 text-center">
                      Selected: {avatarFile.name}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 ring-1 ring-white/10 text-neutral-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadAvatar}
                    disabled={!avatarFile}
                    className="px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Display name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 rounded-md bg-neutral-900 ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500/60 outline-none px-3 py-2 text-sm placeholder:text-neutral-500"
                    />
                    <button
                      onClick={saveDisplayName}
                      className="px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-200 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-3 py-2 rounded-md bg-neutral-900 ring-1 ring-white/10 shadow-lg text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span className="text-neutral-200">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <Paywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={paywallFeature}
        userId={user?.id}
      />
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDelete: (taskId: string) => void;
  onUpdateTitle: (taskId: string, newTitle: string) => void;
  activeTimers: { [taskId: string]: number };
  taskTimers: {
    [taskId: string]: {
      timeLeft: number;
      timeUsed: number;
      isRunning: boolean;
    };
  };
  formatTime: (seconds: number) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdateTitle,
  activeTimers,
  taskTimers,
  formatTime,
}) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="group rounded-lg bg-neutral-900 ring-1 ring-white/10 hover:ring-white/20 transition p-3 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-neutral-500 group-hover:text-neutral-300 transition cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[14px] tracking-tight font-medium text-neutral-100">
              {task.title}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[12px] text-neutral-400">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                {task.points} XP
              </span>
              {task.status === "progress" && taskTimers[task.id] && (
                <span className="text-[12px] text-blue-400 font-mono">
                  ⏱️ {formatTime(taskTimers[task.id].timeLeft)}
                </span>
              )}
              {task.status === "todo" &&
                taskTimers[task.id] &&
                taskTimers[task.id].timeUsed > 0 && (
                  <span className="text-[12px] text-orange-400 font-mono">
                    ⏸️ {formatTime(taskTimers[task.id].timeLeft)} left
                  </span>
                )}
              {task.status === "done" && (
                <span className="text-[12px] text-emerald-400">Completed</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className={`opacity-0 group-hover:opacity-100 transition p-1 rounded-md hover:bg-neutral-800 ring-1 ring-transparent hover:ring-white/10 ${
            showDelete ? "opacity-100" : ""
          }`}
        >
          <Trash2 className="w-4 h-4 text-neutral-300" />
        </button>
      </div>
    </div>
  );
};
