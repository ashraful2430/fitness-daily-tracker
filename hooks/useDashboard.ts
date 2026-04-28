import { useState, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";
import toast from "react-hot-toast";

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getDashboard();
      setData(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateWaterIntake = async (glasses: number) => {
    try {
      await dashboardAPI.updateWaterIntake(glasses);
      await fetchDashboard();
      toast.success("Water intake updated!");
    } catch (err) {
      toast.error("Failed to update water intake");
    }
  };

  const logFocusSession = async (
    startTime: Date,
    endTime: Date,
    category: string,
  ) => {
    try {
      await dashboardAPI.logFocusSession(startTime, endTime, category);
      await fetchDashboard();
      toast.success("Focus session logged!");
    } catch (err) {
      toast.error("Failed to log focus session");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard,
    updateWaterIntake,
    logFocusSession,
  };
}
