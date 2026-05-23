import prisma from "../utils/db.js";
import { calculatePriority } from "../utils/priority.js";

// POST /api/followups - Log a new follow-up
export const createFollowUp = async (req, res) => {
  try {
    const { comment, status = "Planned", nextFollowUpDate, leadId } = req.body;

    if (!comment || !nextFollowUpDate || !leadId) {
      return res.status(400).json({ error: "Comment, nextFollowUpDate, and leadId are required." });
    }

    // Get lead and check ownership
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { followUps: true }
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found." });
    }

    // Counselor security check
    if (req.user.role === "COUNSELOR" && lead.counselorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You are not assigned to this lead." });
    }

    // Create follow-up
    const followUp = await prisma.followUp.create({
      data: {
        comment,
        status,
        nextFollowUpDate: new Date(nextFollowUpDate),
        leadId
      }
    });

    // Recalculate lead priority based on updated follow-up list
    const updatedFollowUps = [...lead.followUps, followUp];
    const newPriority = calculatePriority(lead, updatedFollowUps);

    // Update lead priority
    await prisma.lead.update({
      where: { id: leadId },
      data: { priority: newPriority }
    });

    return res.status(201).json({
      message: "Follow-up logged successfully",
      followUp
    });
  } catch (error) {
    console.error("Create follow-up error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/followups/:id - Update an existing follow-up (e.g. mark completed)
export const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, status, nextFollowUpDate } = req.body;

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: { lead: true }
    });

    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found." });
    }

    // Counselor security check
    if (req.user.role === "COUNSELOR" && followUp.lead.counselorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You are not assigned to this lead." });
    }

    const updateData = {};
    if (comment !== undefined) updateData.comment = comment;
    if (status !== undefined) updateData.status = status;
    if (nextFollowUpDate !== undefined) updateData.nextFollowUpDate = new Date(nextFollowUpDate);

    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: updateData
    });

    // Recalculate lead priority
    const allFollowUps = await prisma.followUp.findMany({
      where: { leadId: followUp.leadId }
    });
    const newPriority = calculatePriority(followUp.lead, allFollowUps);

    await prisma.lead.update({
      where: { id: followUp.leadId },
      data: { priority: newPriority }
    });

    return res.status(200).json({
      message: "Follow-up updated successfully",
      followUp: updatedFollowUp
    });
  } catch (error) {
    console.error("Update follow-up error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
