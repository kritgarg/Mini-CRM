/**
 * Calculates lead priority based on stage, creation date, and follow-ups.
 * 
 * - High Priority (Red):
 *   - Any pending ("Planned") follow-up that is in the past (overdue).
 *   - Active leads (Interested, Re-Engagement, Call Back, Follow-Up) with no follow-up action for 3+ days.
 * - Medium Priority (Yellow):
 *   - Any upcoming ("Planned") follow-up in the future.
 * - Low Priority (Green):
 *   - Converted, Lost, or Not Interested leads.
 *   - Recently contacted active leads (last follow-up < 3 days ago).
 *   - Newly created leads with no follow-ups yet (less than 3 days old).
 */
export function calculatePriority(lead, followUps) {
  const stage = lead.stage;
  const createdAt = new Date(lead.createdAt);

  if (["Converted", "Lost Lead", "Not Interested"].includes(stage)) {
    return "Low";
  }

  const now = new Date();
  const plannedFollowUps = followUps.filter(f => f.status === "Planned");
  const completedFollowUps = followUps.filter(f => f.status === "Completed");

  // Rule 1: Overdue planned follow-ups are High priority
  const hasOverdue = plannedFollowUps.some(f => new Date(f.nextFollowUpDate) < now);
  if (hasOverdue) {
    return "High";
  }

  // Rule 2: Active stages with no contact for 3+ days are High priority
  if (["Interested", "Re-Engagement", "Call Back", "Follow-Up"].includes(stage)) {
    let lastContactTime = createdAt.getTime();

    if (completedFollowUps.length > 0) {
      const times = completedFollowUps.map(f => new Date(f.createdAt).getTime());
      lastContactTime = Math.max(...times);
    }

    const diffDays = Math.ceil(Math.abs(now.getTime() - lastContactTime) / (1000 * 60 * 60 * 24));
    if (diffDays >= 3) {
      return "High";
    }
  }

  // Rule 3: Pending future follow-ups are Medium priority
  if (plannedFollowUps.length > 0) {
    return "Medium";
  }

  // Default fallback
  return "Low";
}
