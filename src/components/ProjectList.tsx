import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trophy,
  CheckCircle2,
  ClipboardList,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Archive,
  MoreHorizontal,
  KanbanSquare,
  Trash2,
  FolderPlus,
  X,
  Sparkles,
  GripVertical,
  Trash,
} from "lucide-react";

interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_count?: number;
  total_xp?: number;
}

interface ProjectListProps {
  user: any;
}

export const ProjectList: React.FC<ProjectListProps> = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("blue");
  const [draggedProject, setDraggedProject] = useState<number | null>(null);
  const [isDragOverTrash, setIsDragOverTrash] = useState(false);
  const [showTrashZone, setShowTrashZone] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  // Load projects with task statistics
  useEffect(() => {
    loadProjects();
    loadProfile();
  }, []);

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

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Get projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (projectsError) {
        console.error("Error loading projects:", projectsError);
        return;
      }

      // Get task statistics for each project
      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: tasksData } = await supabase
            .from("tasks")
            .select("status, points")
            .eq("project_id", project.id);

          const taskCount = tasksData?.length || 0;
          const completedCount =
            tasksData?.filter((t) => t.status === "done").length || 0;
          const totalXp =
            tasksData
              ?.filter((t) => t.status === "done")
              .reduce((sum, t) => sum + (t.points || 0), 0) || 0;

          return {
            ...project,
            task_count: taskCount,
            completed_count: completedCount,
            total_xp: totalXp,
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => setShowAvatarModal(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });
      if (error) {
        console.error("Error uploading avatar:", error);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" });
      if (updateError) {
        console.error("Error updating profile:", updateError);
        return;
      }
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarPreview("");
      loadProfile();
    } catch (err) {
      console.error("Failed to upload avatar:", err);
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
        return;
      }
      setProfile((prev: any) => ({ ...prev, full_name: nameInput }));
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

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            color: newProjectColor,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating project:", error);
        return;
      }

      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("blue");
      setShowNewProjectModal(false);
      loadProjects(); // Reload to get updated stats
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const deleteProject = async (projectId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will also delete all tasks in this project."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project:", error);
        return;
      }

      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, projectId: number) => {
    setDraggedProject(projectId);
    setShowTrashZone(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", projectId.toString());
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setShowTrashZone(false);
    setIsDragOverTrash(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(false);
    setShowTrashZone(false);

    const projectId = parseInt(e.dataTransfer.getData("text/plain"));
    if (projectId && draggedProject === projectId) {
      deleteProject(projectId);
    }
  };

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        !searchQuery.trim() ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "recent")
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      if (sortBy === "az") return a.name.localeCompare(b.name);
      if (sortBy === "progress")
        return (b.completed_count || 0) - (a.completed_count || 0);
      return 0;
    });

  const totalTasks = projects.reduce((sum, p) => sum + (p.task_count || 0), 0);
  const totalCompleted = projects.reduce(
    (sum, p) => sum + (p.completed_count || 0),
    0
  );
  const totalXp = projects.reduce((sum, p) => sum + (p.total_xp || 0), 0);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    pink: "from-pink-500 to-pink-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-neutral-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-400">
              <span className="px-2 py-1 rounded-md bg-neutral-900/60 ring-1 ring-white/10">
                Projects
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-md bg-neutral-900/60 ring-1 ring-white/10 px-2.5 py-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-300">{totalXp} XP</span>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-md bg-neutral-900/60 ring-1 ring-white/10 px-2.5 py-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-neutral-300">
                {totalCompleted} Done
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-md bg-neutral-900/60 ring-1 ring-white/10 px-2.5 py-1.5">
              <ClipboardList className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-neutral-300">
                {totalTasks} Tasks
              </span>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors px-3 py-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Project</span>
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
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/15 ring-1 ring-inset ring-red-500/30 text-red-300 hover:text-red-200 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Your Projects
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Pick a project to open its tasks and workflow.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-6">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-neutral-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              {showFilterMenu && (
                <div className="absolute z-20 mt-2 w-56 rounded-xl bg-neutral-900/90 backdrop-blur ring-1 ring-white/10 shadow-xl p-2">
                  <div className="px-2 py-1.5 text-xs text-neutral-400">
                    Sort
                  </div>
                  <div className="px-2 pb-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setSortBy("recent");
                          setShowFilterMenu(false);
                        }}
                        className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs hover:bg-white/10 ${
                          sortBy === "recent" ? "bg-white/10" : "bg-white/5"
                        }`}
                      >
                        Recent
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("az");
                          setShowFilterMenu(false);
                        }}
                        className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs hover:bg-white/10 ${
                          sortBy === "az" ? "bg-white/10" : "bg-white/5"
                        }`}
                      >
                        A–Z
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("progress");
                          setShowFilterMenu(false);
                        }}
                        className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs hover:bg-white/10 ${
                          sortBy === "progress" ? "bg-white/10" : "bg-white/5"
                        }`}
                      >
                        Progress
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center rounded-lg bg-white/5 ring-1 ring-white/10 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-neutral-300 ${
                  viewMode === "grid" ? "bg-white/10" : "hover:bg-white/10"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-neutral-300 ${
                  viewMode === "list" ? "bg-white/10" : "hover:bg-white/10"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trash Zone */}
        {showTrashZone && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute bottom-8 right-8">
              <div
                className="w-20 h-20 bg-red-500/20 border-2 border-dashed border-red-500 rounded-full flex items-center justify-center animate-pulse"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-500 text-sm text-center mt-2 font-medium">
                Drop to delete
              </p>
            </div>
          </div>
        )}

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                <FolderPlus className="w-6 h-6 text-neutral-400" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                No projects found
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Create your first project to get started.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-500/10 text-indigo-200 ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-500/20 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-3"
            }
          >
            {filteredProjects.map((project) => {
              const progress = project.task_count
                ? Math.round(
                    ((project.completed_count || 0) / project.task_count) * 100
                  )
                : 0;

              if (viewMode === "list") {
                return (
                  <div
                    key={project.id}
                    className={`group grid grid-cols-12 gap-3 items-center rounded-xl px-3 py-3 bg-neutral-900/60 ring-1 ring-white/10 hover:ring-white/20 hover:bg-neutral-900 transition ${
                      draggedProject === project.id ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0">
                      {/* Drag Handle for List View */}
                      <div
                        className="w-6 h-6 bg-neutral-800/80 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                        draggable
                        onDragStart={(e) => handleDragStart(e, project.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <GripVertical className="w-3 h-3 text-neutral-400" />
                      </div>

                      <div
                        className={`h-12 w-16 rounded-md bg-gradient-to-br ${
                          colorClasses[
                            project.color as keyof typeof colorClasses
                          ] || colorClasses.blue
                        } ring-1 ring-white/10 flex items-center justify-center`}
                      >
                        <span className="text-white font-semibold text-lg">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold tracking-tight truncate">
                            {project.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-emerald-500/10 text-emerald-200 ring-emerald-500/30 ring-1 text-[11px]">
                            Active
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-neutral-400">
                          {project.description || "No description"}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-4 sm:col-span-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-neutral-300">
                          <ClipboardList className="w-4 h-4 text-neutral-400" />
                          {project.task_count || 0}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-amber-200">
                          <Trophy className="w-4 h-4" />
                          {project.total_xp || 0} XP
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex items-center justify-between sm:justify-end gap-3">
                      <Link
                        to={`/project/${project.id}`}
                        className="inline-flex items-center gap-2 h-8 px-3 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm"
                      >
                        <KanbanSquare className="w-4 h-4" />
                        Open
                      </Link>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/5 text-neutral-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={project.id}
                  className={`group block rounded-2xl overflow-hidden bg-neutral-900/60 ring-1 ring-white/10 hover:ring-white/20 hover:bg-neutral-900 transition ${
                    draggedProject === project.id ? "opacity-50 scale-95" : ""
                  }`}
                >
                  {/* Drag Handle */}
                  <div
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-neutral-800/80 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical className="w-3 h-3 text-neutral-400" />
                  </div>

                  <Link
                    to={`/project/${project.id}`}
                    className={`block ${
                      draggedProject === project.id ? "opacity-50" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <div
                        className={`h-full w-full bg-gradient-to-br ${
                          colorClasses[
                            project.color as keyof typeof colorClasses
                          ] || colorClasses.blue
                        } flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-4xl">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-500/10 text-emerald-200 ring-emerald-500/30 ring-1 text-[11px] backdrop-blur">
                          Active
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <h3 className="text-white text-lg font-semibold tracking-tight truncate">
                              {project.name}
                            </h3>
                            <p className="text-[11px] text-neutral-400 truncate">
                              {project.description || "No description"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm font-medium">
                              {project.task_count || 0}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              tasks
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-neutral-300">
                            <ClipboardList className="w-4 h-4 text-neutral-400" />
                            {project.task_count || 0}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-amber-200">
                            <Trophy className="w-4 h-4" />
                            {project.total_xp || 0} XP
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Progress</span>
                          <span className="text-neutral-300">
                            {project.completed_count || 0}/
                            {project.task_count || 0}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-white/5 ring-1 ring-inset ring-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Avatar Upload + Profile Modal */}
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
                    Profile
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
                <div className="flex justify-end gap-2 pt-2">
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
      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewProjectModal(false)}
          ></div>
          <div className="relative mx-auto max-w-md w-full mt-24 px-4">
            <div className="rounded-xl bg-neutral-950 ring-1 ring-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4.5 h-4.5 text-neutral-300" />
                  <h3 className="text-[17px] tracking-tight font-semibold">
                    Create Project
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-900 ring-1 ring-inset ring-white/10/0 hover:ring-white/10 transition"
                >
                  <X className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
              <form onSubmit={createProject} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    placeholder="Enter project name"
                    className="w-full rounded-md bg-neutral-900 ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500/60 outline-none px-3 py-2 text-sm placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                    className="w-full rounded-md bg-neutral-900 ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500/60 outline-none px-3 py-2 text-sm placeholder:text-neutral-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-1.5">
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.keys(colorClasses).map((color) => (
                      <label key={color} className="relative">
                        <input
                          type="radio"
                          name="color"
                          value={color}
                          checked={newProjectColor === color}
                          onChange={(e) => setNewProjectColor(e.target.value)}
                          className="peer sr-only"
                        />
                        <div
                          className={`w-full h-8 rounded-md bg-gradient-to-br ${
                            colorClasses[color as keyof typeof colorClasses]
                          } ring-1 ring-white/10 cursor-pointer peer-checked:ring-2 peer-checked:ring-indigo-500/50`}
                        ></div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 ring-1 ring-white/10 text-neutral-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-200 transition"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Trash Zone */}
      {showTrashZone && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
            isDragOverTrash ? "scale-110" : "scale-100"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 ${
              isDragOverTrash
                ? "bg-red-500/20 border-red-500 text-red-400"
                : "bg-neutral-900/80 border-neutral-700 text-neutral-400"
            }`}
          >
            <Trash className="w-6 h-6" />
            <span className="text-lg font-medium">
              {isDragOverTrash
                ? "Drop to delete"
                : "Drag project here to delete"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
