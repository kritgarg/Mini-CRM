import prisma from "../utils/db.js";
import { calculatePriority } from "../utils/priority.js";

// GET /api/leads - List all leads with paginated, filtered search
export const getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      stage = "",
      priority = "",
      course = "",
      counselorId = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Building query filters
    const where = {};

    // Role-based scoping
    if (req.user.role === "COUNSELOR") {
      where.counselorId = req.user.id;
    } else if (counselorId) {
      // Admin filter by counselor
      where.counselorId = counselorId === "unassigned" ? null : counselorId;
    }

    // Search query (on name, email, phone)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ];
    }

    // Dropdown filters
    if (stage) where.stage = stage;
    if (priority) where.priority = priority;
    if (course) where.course = course;

    // Sorting options validation
    const allowedSortFields = ["name", "email", "course", "stage", "priority", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : "desc";

    // Query DB
    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: order },
        include: {
          counselor: {
            select: { id: true, name: true, email: true }
          },
          followUps: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }),
      prisma.lead.count({ where })
    ]);

    // Format response
    const formattedLeads = leads.map(lead => {
      const lastFollowUp = lead.followUps[0] || null;
      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        course: lead.course,
        stage: lead.stage,
        priority: lead.priority,
        createdAt: lead.createdAt,
        counselor: lead.counselor,
        lastFollowUpComment: lastFollowUp ? lastFollowUp.comment : "No follow-up recorded",
        lastFollowUpDate: lastFollowUp ? lastFollowUp.createdAt : null,
        lastFollowUpStatus: lastFollowUp ? lastFollowUp.status : null
      };
    });

    return res.status(200).json({
      leads: formattedLeads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/leads/:id - Get details of a single lead
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        counselor: {
          select: { id: true, name: true, email: true }
        },
        followUps: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Role verification
    if (req.user.role === "COUNSELOR" && lead.counselorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You are not assigned to this lead." });
    }

    // Recalculate priority to keep database fresh
    const computedPriority = calculatePriority(lead, lead.followUps);
    if (computedPriority !== lead.priority) {
      await prisma.lead.update({
        where: { id },
        data: { priority: computedPriority }
      });
      lead.priority = computedPriority;
    }

    return res.status(200).json(lead);
  } catch (error) {
    console.error("Get lead by id error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/leads - Create a new lead
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, course, stage = "New Lead", counselorId } = req.body;

    if (!name || !email || !phone || !course) {
      return res.status(400).json({ error: "Name, email, phone, and course are required." });
    }

    // Counselors can only create leads assigned to themselves (or unassigned if permitted)
    let assignedCounselorId = counselorId;
    if (req.user.role === "COUNSELOR") {
      assignedCounselorId = req.user.id;
    }

    // Initially priority is set to Low for new leads with no follow ups
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        course,
        stage,
        priority: "Low",
        counselorId: assignedCounselorId || null
      }
    });

    return res.status(201).json({
      message: "Lead created successfully",
      lead
    });
  } catch (error) {
    console.error("Create lead error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/leads/:id - Update lead details / stage / counselor assignment
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, course, stage, counselorId } = req.body;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { followUps: true }
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Counselor security check
    if (req.user.role === "COUNSELOR" && lead.counselorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You are not assigned to this lead." });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (course) updateData.course = course;
    if (stage) updateData.stage = stage;
    
    // Only Admin can assign counselors
    if (counselorId !== undefined) {
      if (req.user.role === "ADMIN") {
        updateData.counselorId = counselorId === "unassigned" ? null : counselorId;
      } else if (counselorId !== lead.counselorId) {
        return res.status(403).json({ error: "Access denied. Only Admins can reassign counselors." });
      }
    }

    // Recalculate priority based on new values
    const mockUpdatedLead = { ...lead, ...updateData };
    updateData.priority = calculatePriority(mockUpdatedLead, lead.followUps);

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        counselor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return res.status(200).json({
      message: "Lead updated successfully",
      lead: updatedLead
    });
  } catch (error) {
    console.error("Update lead error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/leads/:id - Delete lead (Admin only)
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    await prisma.lead.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
