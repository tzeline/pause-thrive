import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Configurable limit - can be adjusted later
const FREE_PAUSE_LIMIT = 3;

interface PauseUsage {
  pausesUsed: number;
  pausesRemaining: number;
  isSubscribed: boolean;
  hasReachedLimit: boolean;
  loading: boolean;
  incrementPause: () => Promise<boolean>;
  resetDate: string;
}

export function usePauseLimit(userId: string | undefined): PauseUsage {
  const [pausesUsed, setPausesUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsageAndSubscription = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Fetch subscription status
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (subError) {
        console.error("Failed to fetch subscription:", subError);
      }
      
      const subscribed = subscription?.status === "active";
      setIsSubscribed(subscribed);
      
      // Fetch today's pause usage
      const today = new Date().toISOString().split("T")[0];
      const { data: usage, error: usageError } = await supabase
        .from("pause_usage")
        .select("pause_count")
        .eq("user_id", userId)
        .eq("usage_date", today)
        .maybeSingle();
      
      if (usageError) {
        console.error("Failed to fetch pause usage:", usageError);
      }
      
      setPausesUsed(usage?.pause_count || 0);
    } catch (err) {
      console.error("Error fetching usage data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsageAndSubscription();
  }, [fetchUsageAndSubscription]);

  const incrementPause = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    
    // Subscribed users always succeed
    if (isSubscribed) return true;
    
    // Check if limit reached
    if (pausesUsed >= FREE_PAUSE_LIMIT) return false;
    
    const today = new Date().toISOString().split("T")[0];
    
    try {
      // Upsert the pause usage
      const { error } = await supabase
        .from("pause_usage")
        .upsert({
          user_id: userId,
          usage_date: today,
          pause_count: pausesUsed + 1,
        }, {
          onConflict: "user_id,usage_date",
        });
      
      if (error) {
        console.error("Failed to increment pause:", error);
        // Return true anyway - don't block user experience due to tracking failure
        return true;
      }
      
      setPausesUsed(prev => prev + 1);
      return true;
    } catch (err) {
      console.error("Error incrementing pause:", err);
      // Return true - intervention is more important than accurate tracking
      return true;
    }
  }, [userId, isSubscribed, pausesUsed]);

  // Calculate reset date (tomorrow at midnight)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const resetDate = tomorrow.toLocaleDateString("en-US", { 
    weekday: "long",
    hour: "numeric",
    minute: "2-digit"
  }).replace(",", " at");

  return {
    pausesUsed,
    pausesRemaining: Math.max(0, FREE_PAUSE_LIMIT - pausesUsed),
    isSubscribed,
    hasReachedLimit: !isSubscribed && pausesUsed >= FREE_PAUSE_LIMIT,
    loading,
    incrementPause,
    resetDate: `Tomorrow`,
  };
}

export const FREE_PAUSE_LIMIT_VALUE = FREE_PAUSE_LIMIT;
