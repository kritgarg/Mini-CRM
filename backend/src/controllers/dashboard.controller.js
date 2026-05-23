import prisma from "../utils/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const isCounselor = req.user.role === "COUNSELOR";
    const where = {};
    if (isCounselor) {
      where.counselorId = req.user.id;
    }

    // 1. KPI Counts
    const totalLeads = await prisma.lead.count({ where });
    
    const newLeads = await prisma.lead.count({
      where: { ...where, stage: "New Lead" }
    });

    const convertedLeads = await prisma.lead.count({
      where: { ...where, stage: "Converted" }
    });

    const hotLeads = await prisma.lead.count({
      where: { ...where, priority: "High" }
    });

    // Pending followups is leads that have at least one follow-up with status = "Planned"
    const pendingFollowUps = await prisma.lead.count({
      where: {
        ...where,
        followUps: {
          some: { status: "Planned" }
        }
      }
    });

    // 2. Leads by Course (Pie Chart)
    const courseStats = await prisma.lead.groupBy({
      by: ["course"],
      where,
      _count: { id: true }
    });

    const leadsByCourse = courseStats.map(stat => ({
      name: stat.course,
      value: stat._count.id
    }));

    // 3. Lead Trends - past 30 days (Line Chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const trendLeads = await prisma.lead.findMany({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    // Group leads by date
    const trendMap = {};
    // Pre-populate past 30 days with 0 counts
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      trendMap[dateString] = 0;
    }

    trendLeads.forEach(lead => {
      const dateString = lead.createdAt.toISOString().split("T")[0];
      if (trendMap[dateString] !== undefined) {
        trendMap[dateString]++;
      }
    });

    const leadTrends = Object.keys(trendMap).map(date => ({
      date,
      count: trendMap[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 4. Counselor Performance (Bar Chart) - Admin view: Conversions/Leads per counselor
    let counselorPerformance = [];
    if (!isCounselor) {
      const counselors = await prisma.user.findMany({
        where: { role: "COUNSELOR" },
        include: {
          leads: {
            select: { stage: true }
          }
        }
      });

      counselorPerformance = counselors.map(c => {
        const total = c.leads.length;
        const converted = c.leads.filter(l => l.stage === "Converted").length;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
        return {
          name: c.name,
          leads: total,
          converted: converted,
          rate: conversionRate
        };
      });
    } else {
      // Counselor personal monthly history
      const total = totalLeads;
      const rate = total > 0 ? Math.round((convertedLeads / total) * 100) : 0;
      counselorPerformance = [
        { name: "My Performance", leads: total, converted: convertedLeads, rate }
      ];
    }

    // 5. Recent Leads (top 5)
    const recentLeadsRaw = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        counselor: {
          select: { name: true }
        }
      }
    });

    const recentLeads = recentLeadsRaw.map(lead => ({
      id: lead.id,
      name: lead.name,
      course: lead.course,
      stage: lead.stage,
      priority: lead.priority,
      createdAt: lead.createdAt,
      counselorName: lead.counselor ? lead.counselor.name : "Unassigned"
    }));

    // 6. Follow-up Reminders (Planned follow-ups upcoming or overdue)
    const remindersRaw = await prisma.followUp.findMany({
      where: {
        lead: isCounselor ? { counselorId: req.user.id } : {},
        status: "Planned"
      },
      orderBy: { nextFollowUpDate: "asc" },
      take: 5,
      include: {
        lead: {
          select: { id: true, name: true, phone: true, course: true }
        }
      }
    });

    const followUpReminders = remindersRaw.map(rem => ({
      id: rem.id,
      comment: rem.comment,
      nextFollowUpDate: rem.nextFollowUpDate,
      leadId: rem.leadId,
      leadName: rem.lead.name,
      leadPhone: rem.lead.phone,
      leadCourse: rem.lead.course
    }));

    return res.status(200).json({
      kpis: {
        totalLeads,
        newLeads,
        pendingFollowUps,
        convertedLeads,
        hotLeads
      },
      leadsByCourse,
      leadTrends,
      counselorPerformance,
      recentLeads,
      followUpReminders
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
