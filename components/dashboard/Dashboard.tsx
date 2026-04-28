// frontend/components/dashboard/Dashboard.tsx

"use client";

import { useDashboard } from "@/hooks/useDashboard";
import type { Workout, WeeklyStat } from "@/types/dashboard";
import {
  Activity,
  Flame,
  Droplets,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Zap,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, loading, updateWaterIntake } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 md:p-12 text-white"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  FITNESS DAILY TRACKER
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Build habits, track fitness,
                <br />
                and protect your focus.
              </h1>
              <p className="text-lg text-purple-100 mb-6">
                A colorful daily system for workouts, habits, water intake,
                Pomodoro focus sessions, and weekly progress analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg">
                  Start today
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/20 transition-all">
                  View analytics
                </button>
              </div>
            </div>

            {/* Today's Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 110}`}
                    strokeDashoffset={`${2 * Math.PI * 110 * (1 - data.todayScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm font-medium text-purple-200 mb-1">
                    Today's score
                  </div>
                  <div className="text-6xl font-bold">{data.todayScore}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">
                {data.workoutStreak.current}
              </div>
              <div className="text-sm text-purple-200">Workout</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">
                {data.waterIntake.consumed}
              </div>
              <div className="text-sm text-purple-200">Water</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">{data.focusTime.hours}h</div>
              <div className="text-sm text-purple-200">Focus</div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Flame}
            title="Workout Streak"
            value={data.workoutStreak.current}
            subtitle="days active"
            color="orange"
            trend={`Longest: ${data.workoutStreak.longest} days`}
          />
          <StatCard
            icon={Droplets}
            title="Water Intake"
            value={`${data.waterIntake.consumed}/${data.waterIntake.goal}`}
            subtitle="glasses today"
            color="cyan"
            progress={data.waterIntake.percentage}
            onAction={() => updateWaterIntake(data.waterIntake.consumed + 1)}
          />
          <StatCard
            icon={Clock}
            title="Focus Time"
            value={`${data.focusTime.hours}h`}
            subtitle="completed today"
            color="purple"
            trend={`${data.focusTime.sessionsCount} sessions`}
          />
          <StatCard
            icon={Target}
            title="Weekly Goal"
            value={`${data.weeklyGoal.percentage}%`}
            subtitle="progress"
            color="green"
            progress={data.weeklyGoal.percentage}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Weekly Activity
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {data.weeklyStats.map((stat: WeeklyStat, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.day}
                  </div>
                  <div className="flex-1">
                    <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
                        style={{ width: `${(stat.workouts / 3) * 100}%` }}
                      >
                        {stat.workouts > 0 ? stat.workouts : null}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {stat.focusMinutes}m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {data.recentWorkouts.length > 0 ? (
                data.recentWorkouts
                  .slice(0, 5)
                  .map((workout: Workout, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {workout.duration} min {workout.exercise}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {workout.calories ?? 0} cal
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent workouts
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard icon={Plus} label="Log Workout" color="purple" />
          <QuickActionCard
            icon={Droplets}
            label="Add Water"
            color="cyan"
            onClick={() => updateWaterIntake(data.waterIntake.consumed + 1)}
          />
          <QuickActionCard icon={Clock} label="Start Focus" color="indigo" />
          <QuickActionCard
            icon={TrendingUp}
            label="View Reports"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ColorKey = "orange" | "cyan" | "purple" | "green" | "indigo";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  color: ColorKey;
  progress?: number;
  trend?: string;
  onAction?: () => void;
}

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  color: ColorKey;
  onClick?: () => void;
}

// ─── StatCard ────────────────────────────────────────────────────────────────

const gradients: Record<ColorKey, string> = {
  orange: "from-orange-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-600",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-green-600",
  indigo: "from-indigo-500 to-indigo-600",
};

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  progress,
  trend,
  onAction,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} text-white`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradients[color]} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {trend && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {trend}
        </div>
      )}
    </motion.div>
  );
}

// ─── QuickActionCard ─────────────────────────────────────────────────────────

const hoverColors: Record<ColorKey, string> = {
  purple: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
  cyan: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
  indigo: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  green: "hover:bg-green-50 dark:hover:bg-green-900/20",
  orange: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
};

function QuickActionCard({
  icon: Icon,
  label,
  color,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${hoverColors[color]} transition-all flex flex-col items-center gap-3 group`}
    >
      <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </button>
  );
}
