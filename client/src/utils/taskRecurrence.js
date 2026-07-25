import { supabase } from "../supabase";

/**
 * Generate next occurrence date based on recurrence pattern
 * @param {Date} baseDate - Starting date for the recurrence
 * @param {string} recurrenceType - 'daily', 'weekly', 'monthly', 'yearly'
 * @param {number} occurrenceNumber - Which occurrence (1st, 2nd, etc.)
 * @returns {Date} Next occurrence date
 */
export function getNextOccurrenceDate(baseDate, recurrenceType, occurrenceNumber = 1) {
  const date = new Date(baseDate);
  
  switch (recurrenceType.toLowerCase()) {
    case "daily":
      date.setDate(date.getDate() + (occurrenceNumber - 1));
      break;
    case "weekly":
      date.setDate(date.getDate() + (7 * (occurrenceNumber - 1)));
      break;
    case "monthly":
      date.setMonth(date.getMonth() + (occurrenceNumber - 1));
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + (occurrenceNumber - 1));
      break;
    default:
      break;
  }
  
  return date;
}

/**
 * Check if a new instance of a recurring task should be generated
 * @param {Object} task - The recurring task object
 * @returns {boolean} Whether a new instance should be created
 */
function shouldGenerateNewInstance(task) {
  if (!task.is_recurring || !task.recurrence) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const baseDate = new Date(task.due_date || task.created_at);
  baseDate.setHours(0, 0, 0, 0);
  
  const lastInstanceDate = new Date(task.last_instance_date || task.due_date || task.created_at);
  lastInstanceDate.setHours(0, 0, 0, 0);
  
  switch (task.recurrence.toLowerCase()) {
    case "daily":
      return now.getTime() >= lastInstanceDate.getTime() + (24 * 60 * 60 * 1000);
      
    case "weekly": {
      const dayOfWeek = baseDate.getDay();
      const lastWeekStart = new Date(lastInstanceDate);
      lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay());
      
      const nowWeekStart = new Date(now);
      nowWeekStart.setDate(nowWeekStart.getDate() - nowWeekStart.getDay());
      
      const nextOccurrence = new Date(lastWeekStart);
      nextOccurrence.setDate(nextOccurrence.getDate() + dayOfWeek);
      
      if (nextOccurrence.getTime() <= lastInstanceDate.getTime()) {
        nextOccurrence.setDate(nextOccurrence.getDate() + 7);
      }
      
      return now.getTime() >= nextOccurrence.getTime();
    }
      
    case "monthly": {
      const dayOfMonth = baseDate.getDate();
      const nextOccurrence = new Date(lastInstanceDate);
      nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
      nextOccurrence.setDate(Math.min(dayOfMonth, new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth() + 1, 0).getDate()));
      
      return now.getTime() >= nextOccurrence.getTime();
    }
      
    case "yearly": {
      const monthDay = `${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`;
      const nowMonthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastInstanceMonthDay = `${String(lastInstanceDate.getMonth() + 1).padStart(2, '0')}-${String(lastInstanceDate.getDate()).padStart(2, '0')}`;
      
      if (monthDay === nowMonthDay && now.getFullYear() > lastInstanceDate.getFullYear()) {
        return true;
      }
      
      if (nowMonthDay > monthDay && now.getFullYear() === lastInstanceDate.getFullYear() && lastInstanceMonthDay <= monthDay) {
        return true;
      }
      
      return false;
    }
      
    default:
      return false;
  }
}

/**
 * Generate and create new instances of recurring tasks
 * @param {Object} recurringTasks - Array of recurring task objects
 * @param {string} assignedTo - Username of the person tasks are assigned to
 */
export async function generateRecurringTaskInstances(recurringTasks, assignedTo) {
  if (!recurringTasks || recurringTasks.length === 0) return [];
  
  const generatedTasks = [];
  
  for (const task of recurringTasks) {
    if (!shouldGenerateNewInstance(task)) continue;
    
    const baseDate = new Date(task.due_date || task.created_at);
    const lastInstanceDate = new Date(task.last_instance_date || task.due_date || task.created_at);
    
    const nextDueDate = getNextOccurrenceDate(lastInstanceDate, task.recurrence);
    
    // Create new task instance
    const newTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: "pending",
      assigned_to: task.assigned_to,
      assigned_by: task.assigned_by,
      site_name: task.site_name,
      due_date: nextDueDate.toISOString().split('T')[0],
      is_recurring: true,
      recurrence: task.recurrence,
      parent_recurring_id: task.id,
      created_at: new Date().toISOString(),
      last_instance_date: lastInstanceDate.toISOString().split('T')[0],
    };
    
    const { data: createdTask, error: createError } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .single();
    
    if (!createError && createdTask) {
      // Update the parent task's last_instance_date
      await supabase
        .from("tasks")
        .update({ last_instance_date: nextDueDate.toISOString().split('T')[0] })
        .eq("id", task.id);
      
      generatedTasks.push(createdTask);
    }
  }
  
  return generatedTasks;
}
