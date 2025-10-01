import React, { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Confetti from "confetti-js";
export const HeroSection = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete project proposal",
      status: "in-progress",
      timeUsed: 29,
      timeLeft: 1,
      estimatedTime: 30,
      color: "green",
    },
    {
      id: 2,
      title: "Research competitors",
      status: "paused",
      timeUsed: 44,
      timeLeft: 1,
      estimatedTime: 45,
      color: "amber",
    },
    {
      id: 3,
      title: "Schedule team meeting",
      status: "not-started",
      timeUsed: 0,
      timeLeft: 30,
      estimatedTime: 30,
      color: "purple",
    },
  ]);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeCountdown, setActiveCountdown] = useState<{
    [taskId: number]: number;
  }>({});
  const [initialCountdown, setInitialCountdown] = useState<{
    [taskId: number]: number;
  }>({});
  const [fadingTasks, setFadingTasks] = useState<Set<number>>(new Set());
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const confettiInstance = useRef<Confetti | null>(null);

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Trigger confetti
      if (confettiInstance.current) {
        try {
          confettiInstance.current.render();
        } catch (error) {
          console.error("Confetti render error:", error);
        }
      }
      setCountdown(null);
    }
  }, [countdown]);

  // Initialize confetti
  useEffect(() => {
    const initializeConfetti = () => {
      if (confettiRef.current && !confettiInstance.current) {
        try {
          confettiInstance.current = new Confetti(confettiRef.current);
          confettiInstance.current.setCount(75);
          confettiInstance.current.setSize(1);
          confettiInstance.current.setPower(25);
          confettiInstance.current.setFade(false);
        } catch (error) {
          console.error("Confetti initialization error:", error);
        }
      }
    };

    // Initialize after a short delay to ensure canvas is ready
    const timer = setTimeout(initializeConfetti, 100);

    return () => {
      clearTimeout(timer);
      if (confettiInstance.current) {
        try {
          confettiInstance.current.destroyTarget(true);
        } catch (error) {
          console.error("Confetti cleanup error:", error);
        }
        confettiInstance.current = null;
      }
    };
  }, []);

  // Active task countdown effect
  useEffect(() => {
    const activeTasks = Object.keys(activeCountdown).filter(
      (taskId) => activeCountdown[parseInt(taskId)] > 0
    );

    if (activeTasks.length > 0) {
      const timer = setTimeout(() => {
        setActiveCountdown((prev) => {
          const newCountdown = { ...prev };
          activeTasks.forEach((taskId) => {
            const id = parseInt(taskId);
            if (newCountdown[id] > 0) {
              newCountdown[id] = newCountdown[id] - 1;

              // Update task time in real-time
              setTasks((prevTasks) =>
                prevTasks.map((task) => {
                  if (task.id === id && task.status === "in-progress") {
                    const secondsLeft = newCountdown[id];
                    const minutesLeft = Math.ceil(secondsLeft / 60);
                    const timeUsed = task.estimatedTime - minutesLeft;
                    return {
                      ...task,
                      timeUsed: Math.max(0, timeUsed),
                      timeLeft: Math.max(0, minutesLeft),
                    };
                  }
                  return task;
                })
              );

              if (newCountdown[id] === 0) {
                // Trigger confetti when task completes
                if (confettiInstance.current) {
                  try {
                    confettiInstance.current.render();
                  } catch (error) {
                    console.error("Confetti render error:", error);
                  }
                }

                // Trigger fade effect when timer completes for this specific task
                setFadingTasks((prev) => new Set(prev).add(id));
                setTimeout(() => {
                  setFadingTasks((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                  });
                }, 500);

                // Update the specific task when completed - reset to not-started
                setTasks((prevTasks) =>
                  prevTasks.map((task) => {
                    if (task.id === id && task.status === "in-progress") {
                      return {
                        ...task,
                        status: "not-started",
                        timeUsed: 0,
                        timeLeft: task.estimatedTime,
                      };
                    }
                    return task;
                  })
                );

                delete newCountdown[id];
              }
            }
          });
          return newCountdown;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeCountdown]);

  const handleTaskAction = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.status === "not-started") {
            // Start countdown when play button is clicked
            setCountdown(5);
            const fixedSeconds = 15; // Fixed 15 seconds for all tasks
            setActiveCountdown((prev) => ({
              ...prev,
              [taskId]: fixedSeconds,
            }));
            setInitialCountdown((prev) => ({
              ...prev,
              [taskId]: fixedSeconds,
            }));
            return {
              ...task,
              status: "in-progress",
            };
          } else if (task.status === "in-progress") {
            setActiveCountdown((prev) => {
              const newCountdown = { ...prev };
              delete newCountdown[taskId];
              return newCountdown;
            });
            setInitialCountdown((prev) => {
              const newInitial = { ...prev };
              delete newInitial[taskId];
              return newInitial;
            });
            return {
              ...task,
              status: "paused",
            };
          } else if (task.status === "paused") {
            // Start countdown when play button is clicked
            setCountdown(5);
            const fixedSeconds = 15; // Fixed 15 seconds for all tasks
            setActiveCountdown((prev) => ({
              ...prev,
              [taskId]: fixedSeconds,
            }));
            setInitialCountdown((prev) => ({
              ...prev,
              [taskId]: fixedSeconds,
            }));
            return {
              ...task,
              status: "in-progress",
            };
          }
        }
        return task;
      })
    );
  };

  const getTaskTimeText = (task: any) => {
    if (task.status === "not-started") {
      return `Estimated: ${task.estimatedTime} minutes`;
    } else if (task.status === "in-progress") {
      if (
        activeCountdown[task.id] !== undefined &&
        activeCountdown[task.id] > 0
      ) {
        const minutesLeft = Math.ceil(activeCountdown[task.id] / 60);
        const totalMinutes = task.estimatedTime;
        return `${minutesLeft} mins left, total time ${totalMinutes} min total`;
      }
      return `${task.timeUsed} minutes used • ${task.timeLeft} minutes left`;
    } else if (task.status === "paused") {
      return `${task.timeUsed} minutes used • Resume anytime`;
    }
    return "";
  };

  const getProgressPercentage = (task: any) => {
    if (
      task.status === "in-progress" &&
      activeCountdown[task.id] !== undefined &&
      activeCountdown[task.id] > 0 &&
      initialCountdown[task.id] !== undefined
    ) {
      const currentSeconds = activeCountdown[task.id];
      const initialSeconds = initialCountdown[task.id];
      const usedSeconds = initialSeconds - currentSeconds;
      const percentage = (usedSeconds / initialSeconds) * 100;
      return Math.max(0, Math.min(percentage, 100));
    }
    return 0;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white min-h-screen w-full relative">
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      />
      <div className="container mx-auto px-6 py-16 md:py-24 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Task management that works{" "}
              <span className="text-yellow-300">with your brain</span>, not
              against it
            </h1>
            <p className="text-xl opacity-90">
              Easily pause, resume, and complete tasks at your own pace. No more
              overwhelm, just progress at the speed that works for you.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/auth"
                className="bg-white text-indigo-700 hover:bg-yellow-300 hover:text-indigo-800 transition-all px-8 py-3 rounded-xl font-bold text-lg shadow-lg inline-block"
              >
                Get Started Free
              </Link>
              <button
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="bg-indigo-800/50 hover:bg-indigo-800/70 border border-indigo-400 transition-all px-8 py-3 rounded-xl font-bold text-lg"
              >
                See How It Works
              </button>
            </div>
            <div className="flex items-center gap-8 pt-6">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-yellow-300 w-5 h-5" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-yellow-300 w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          {/* App Demo/Illustration */}
          <div className="md:w-1/2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl relative">
              <div className="absolute -top-3 -left-3 bg-yellow-300 text-indigo-800 font-bold px-4 py-1 rounded-lg text-sm">
                Task Manager
              </div>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white/20 rounded-xl p-4 border-l-4 transition-all duration-500 hover:bg-white/30 ${
                      task.color === "green"
                        ? "border-green-400"
                        : task.color === "amber"
                        ? "border-amber-400"
                        : "border-purple-400"
                    } ${
                      fadingTasks.has(task.id)
                        ? "opacity-0 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        {/* Task-specific countdown */}
                        {task.status === "in-progress" &&
                          activeCountdown[task.id] !== undefined &&
                          activeCountdown[task.id] > 0 && (
                            <div className="bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-sm animate-pulse">
                              {activeCountdown[task.id]}s
                            </div>
                          )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.status === "in-progress"
                              ? "bg-green-400/20 text-green-300"
                              : task.status === "paused"
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-purple-400/20 text-purple-300"
                          }`}
                        >
                          {task.status === "in-progress"
                            ? "In Progress"
                            : task.status === "paused"
                            ? "Paused"
                            : "Not Started"}
                        </span>
                        <button
                          onClick={() => {
                            handleTaskAction(task.id);
                          }}
                          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                            task.status === "in-progress"
                              ? "bg-yellow-300 text-indigo-800 hover:bg-yellow-400"
                              : "bg-green-400 text-indigo-800 hover:bg-green-500"
                          }`}
                        >
                          {task.status === "in-progress" ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm opacity-80">
                      {getTaskTimeText(task)}
                    </div>
                    {/* Progress Bar */}
                    {task.status === "in-progress" &&
                      activeCountdown[task.id] !== undefined &&
                      activeCountdown[task.id] > 0 && (
                        <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${getProgressPercentage(task)}%` }}
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
