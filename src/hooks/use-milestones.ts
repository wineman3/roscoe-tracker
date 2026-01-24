"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DestinationMilestone } from "@/lib/types";

export function useMilestones() {
  const [milestones, setMilestones] = useState<DestinationMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("destination_milestones")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error loading milestones:", error);
        return;
      }

      setMilestones(data || []);
      setLoading(false);
    };

    load();
  }, []);

  return { milestones, loading };
}
