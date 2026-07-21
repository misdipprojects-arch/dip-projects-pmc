/**
 * useRecurringTasks.js
 *
 * Drop this hook into any page that should auto-generate recurring task instances.
 * Call it once on mount (e.g. in OfficePortal and AdminPortal).
 *
 * Logic:
 *  1. Fetch all recurring tasks (is_recurring = true).
 *  2. For each, decide if today is a "trigger day" based on recurrence + recurrence_anchor.
 *  3. If yes, AND the last_generated_date is not already today (de-dup guard):
 *     a. Check if the previous instance (latest child with this parent_task_id) is still incomplete.
 *     b. Create a new non-recurring task instance (a "child") regardless — even if old one is incomplete
 *        (the child inherits the parent's due_date offset by one cycle forward).
 *     c. Update parent's last_generated_date to today so we don't double-spawn.
 *
 * Recurrence patterns:
 *  daily   → triggers every calendar day
 *  weekly  → triggers on the weekday stored in recurrence_anchor (0=Sun … 6=Sat)
 *  monthly → triggers on the day-of-month stored in recurrence_anchor (1–31)
 *  yearly  → triggers on the "MM-DD" stored in recurrence_anchor (e.g. "03-25")
 */

import { useEffect } from "react";
import { supabase } from "../supabase";

// ── helpers ────────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string (local time, no UTC shift). */
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add `n` days to a YYYY-MM-DD string and return a new YYYY-MM-DD string. */
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Given a recurrence pattern + anchor, should today trigger a new instance? */
function shouldTriggerToday(recurrence, anchor) {
  const now = new Date();
  switch (recurrence) {
    case "daily":
      return true;

    case "weekly": {
      // anchor = "0"–"6"  (JS getDay weekday)
      const targetDay = parseInt(anchor, 10);
      return now.getDay() === targetDay;
    }

    case "monthly": {
      // anchor = "1"–"31" (day of month)
      const targetDom = parseInt(anchor, 10);
      return now.getDate() === targetDom;
    }

    case "yearly": {
      // anchor = "MM-DD" e.g. "03-25"
      if (!anchor) return false;
      const [mm, dd] = anchor.split("-");
      return now.getMonth() + 1 === parseInt(mm, 10) && now.getDate() === parseInt(dd, 10);
    }

    default:
      return false;
  }
}

/** Compute the due_date for the new instance (one cycle ahead of today). */
function nextDueDate(recurrence) {
  const today = todayStr();
  switch (recurrence) {
    case "daily":   return addDays(today, 1);
    case "weekly":  return addDays(today, 7);
    case "monthly": {
      const d = new Date(today + "T00:00:00");
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().slice(0, 10);
    }
    case "yearly": {
      const d = new Date(today + "T00:00:00");
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    }
    default: return null;
  }
}

// ── main hook ──────────────────────────────────────────────────────────────

/**
 * @param {object|null} user   – the logged-in user from localStorage
 * @param {function}    onDone – optional callback after generation (e.g. refetch tasks)
 */
export function useRecurringTasks(user, onDone) {
  useEffect(() => {
    if (!user) return;
    processRecurringTasks(user, onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_name]);
}

async function processRecurringTasks(user, onDone) {
  const today = todayStr();

  // Fetch all recurring template tasks (both assigned to or by this user covers all cases)
  // Admin typically wants ALL recurring tasks processed; engineer only needs theirs.
  // We fetch globally so admins can trigger generation too.
  const { data: recurringTasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_recurring", true);

  if (error || !recurringTasks?.length) return;

  const toGenerate = recurringTasks.filter((task) => {
    // Already generated today → skip
    if (task.last_generated_date === today) return false;
    // Check if today matches the recurrence pattern
    return shouldTriggerToday(task.recurrence, task.recurrence_anchor);
  });

  if (!toGenerate.length) return;

  for (const parent of toGenerate) {
    // Check if the most recent child instance is still incomplete
    // (we still create new ones either way, but you can gate this with the flag below)
    const { data: lastChild } = await supabase
      .from("tasks")
      .select("id, status")
      .eq("parent_task_id", parent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevIncomplete = lastChild && lastChild.status !== "completed";

    // Build the new instance
    const newInstance = {
      title:             parent.title,
      description:       parent.description,
      assigned_to:       parent.assigned_to,
      site_name:         parent.site_name,
      assigned_by:       parent.assigned_by,
      priority:          parent.priority,
      status:            "pending",
      due_date:          nextDueDate(parent.recurrence),
      is_recurring:      false,      // child is a one-off instance
      recurrence:        null,
      recurrence_anchor: null,
      parent_task_id:    parent.id,
      // Attach a note if previous was not completed
      ...(prevIncomplete
        ? { description: (parent.description ? parent.description + "\n\n" : "") + "⚠️ Previous instance was not completed." }
        : {}),
    };

    // Insert the new instance
    await supabase.from("tasks").insert([newInstance]);

    // Stamp the parent so we don't re-generate today
    await supabase
      .from("tasks")
      .update({ last_generated_date: today })
      .eq("id", parent.id);
  }

  // Notify caller (e.g. refetch task lists)
  if (typeof onDone === "function") onDone();
}
