import prisma from "../utils/db.js";
import { faker } from "@faker-js/faker";

const COURSES = [
  "Data Science",
  "Data Analytics",
  "Full Stack Development",
  "Digital Marketing"
];

// POST /api/import/leads - Simulate importing leads from a Google Sheet
export const importLeads = async (req, res) => {
  try {
    let sheetLeads = req.body?.leads;

    // If no leads are provided in request body, generate 10 mock leads simulating a Google Sheet sync
    if (!sheetLeads || !Array.isArray(sheetLeads) || sheetLeads.length === 0) {
      sheetLeads = [];
      for (let i = 0; i < 10; i++) {
        sheetLeads.push({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.string.numeric(10),
          course: faker.helpers.arrayElement(COURSES),
          stage: "New Lead",
          priority: "Low"
        });
      }
    }

    // Save leads to PostgreSQL using prisma.lead.createMany
    const createdLeads = await prisma.lead.createMany({
      data: sheetLeads.map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        course: lead.course,
        stage: lead.stage || "New Lead",
        priority: lead.priority || "Low",
        counselorId: null // initially unassigned
      }))
    });

    return res.status(200).json({
      message: `Successfully synchronized ${sheetLeads.length} leads from Google Sheets!`,
      count: createdLeads.count,
      leads: sheetLeads
    });
  } catch (error) {
    console.error("Import leads error:", error);
    return res.status(500).json({ error: "Internal server error during Google Sheet sync simulation" });
  }
};
