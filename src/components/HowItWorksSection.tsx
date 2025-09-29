import React from "react";
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ListTodoIcon,
  BrainIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
export const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="bg-indigo-900 text-white py-20 w-full"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Our task management system is specifically designed to work with
            your brain, not against it. Here's how it helps you stay on track.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10 mt-12">
          {/* Step 1 */}
          <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-600/30 relative">
            <div className="absolute -top-5 -left-5 bg-yellow-300 text-indigo-800 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              1
            </div>
            <div className="h-16 w-16 bg-indigo-700/50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ListTodoIcon className="h-8 w-8 text-yellow-300" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">
              Create Your Tasks
            </h3>
            <p className="text-indigo-200 text-center">
              Add tasks to your list with estimated time commitments. No
              pressure to complete them all at once - just organize what needs
              to get done.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-600/30 relative">
            <div className="absolute -top-5 -left-5 bg-yellow-300 text-indigo-800 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              2
            </div>
            <div className="h-16 w-16 bg-indigo-700/50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <PlayIcon className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">
              Start When Ready
            </h3>
            <p className="text-indigo-200 text-center">
              Begin tasks when your focus is strong. The timer tracks your
              active work time, helping you understand your actual productivity
              patterns.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-600/30 relative">
            <div className="absolute -top-5 -left-5 bg-yellow-300 text-indigo-800 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              3
            </div>
            <div className="h-16 w-16 bg-indigo-700/50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <PauseIcon className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">
              Pause Without Guilt
            </h3>
            <p className="text-indigo-200 text-center">
              When focus wanes or you need a break, simply pause. The app
              remembers where you left off so you can return when you're ready.
            </p>
          </div>
        </div>
        {/* Additional Steps */}
        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {/* Step 4 */}
          <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-600/30 relative">
            <div className="absolute -top-5 -left-5 bg-yellow-300 text-indigo-800 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              4
            </div>
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 bg-indigo-700/50 rounded-full flex-shrink-0 flex items-center justify-center">
                <BrainIcon className="h-8 w-8 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Learn Your Patterns</h3>
                <p className="text-indigo-200">
                  The app tracks your focus patterns and productivity times,
                  helping you understand when you work best and for how long.
                  These insights help you plan better and reduce frustration.
                </p>
              </div>
            </div>
          </div>
          {/* Step 5 */}
          <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-600/30 relative">
            <div className="absolute -top-5 -left-5 bg-yellow-300 text-indigo-800 font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              5
            </div>
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 bg-indigo-700/50 rounded-full flex-shrink-0 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Complete At Your Pace
                </h3>
                <p className="text-indigo-200">
                  Finish tasks in your own time, with no penalties for pauses or
                  breaks. The app celebrates your completions based on your
                  actual working style, not arbitrary deadlines.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl mb-6">
            <p className="text-lg font-medium text-yellow-300">
              No more forcing your brain to work in ways it wasn't designed to
            </p>
          </div>
          <Link
            to="/signup"
            className="bg-white text-indigo-700 hover:bg-yellow-300 hover:text-indigo-800 transition-all px-8 py-4 rounded-xl font-bold text-lg shadow-lg inline-block"
          >
            Try It Free For 3 Days
          </Link>
        </div>
      </div>
    </section>
  );
};
