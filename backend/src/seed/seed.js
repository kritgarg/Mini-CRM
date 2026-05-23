import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const COURSES = [
  "Data Science",
  "Data Analytics",
  "Full Stack Development",
  "Digital Marketing"
];

const STAGES = [
  "New Lead",
  "Interested",
  "Call Back",
  "Follow-Up",
  "Walk-In Scheduled",
  "Walk-In Missed",
  "Visited",
  "Converted",
  "Not Interested",
  "Lost Lead",
  "Re-Engagement"
];

const FOLLOWUP_COMMENTS = [
  "Spoke with the candidate. Interested in curriculum details.",
  "Callback requested tomorrow evening.",
  "Discussed fee structure and scholarship options. Will confirm by Friday.",
  "Scheduled walk-in for course counseling next Tuesday.",
  "Did not pick up call. Left a WhatsApp message.",
  "Walked in today. Discussed batch timings and projects. Positive response.",
  "Candidate enrolled and paid the booking amount.",
  "Not interested at the moment. Looking for cheaper options.",
  "Wants online classes instead of offline classroom training.",
  "Will attend free demo session scheduled this weekend."
];

function calculatePriority(stage, followUps, leadCreatedAt) {
  // If converted or lost, priority is low
  if (["Converted", "Lost Lead", "Not Interested"].includes(stage)) {
    return "Low";
  }

  // Check follow-ups
  const completed = followUps.filter(f => f.status === "Completed");
  const planned = followUps.filter(f => f.status === "Planned");

  // Overdue planned follow-ups
  const now = new Date();
  const hasOverdue = planned.some(f => new Date(f.nextFollowUpDate) < now);
  if (hasOverdue) {
    return "High";
  }

  // Interested or Re-Engagement with no recent contact for 3+ days
  if (["Interested", "Re-Engagement", "Call Back", "Follow-Up"].includes(stage)) {
    let lastContactDate = leadCreatedAt;
    if (completed.length > 0) {
      // Find latest completed follow-up date
      const latest = Math.max(...completed.map(f => new Date(f.createdAt).getTime()));
      lastContactDate = new Date(latest);
    }

    const diffDays = Math.ceil(Math.abs(now - new Date(lastContactDate)) / (1000 * 60 * 60 * 24));
    if (diffDays >= 3) {
      return "High";
    }
  }

  // If there's an upcoming follow-up, it is medium priority
  if (planned.length > 0) {
    return "Medium";
  }

  // Default priority
  return "Low";
}

async function main() {
  console.log("Cleaning database...");
  await prisma.followUp.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@crm.com",
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  // 5 Counselors
  const counselorNames = [
    "Counselor User",
    "Alice Smith",
    "Bob Jones",
    "Carol White",
    "David Black"
  ];
  
  const counselorEmails = [
    "counselor@crm.com",
    "alice@crm.com",
    "bob@crm.com",
    "carol@crm.com",
    "david@crm.com"
  ];

  const counselors = [];
  for (let i = 0; i < counselorNames.length; i++) {
    const counselor = await prisma.user.create({
      data: {
        name: counselorNames[i],
        email: counselorEmails[i],
        password: hashedPassword,
        role: "COUNSELOR"
      }
    });
    counselors.push(counselor);
  }

  console.log(`Created 1 Admin and ${counselors.length} Counselors.`);
  console.log("Seeding 1000 leads...");

  // Generate 1000 leads in batches to avoid Prisma/DB timeouts or limits
  const batchSize = 100;
  const totalLeads = 1000;

  for (let b = 0; b < totalLeads; b += batchSize) {
    const leadDataBatch = [];
    const followUpDataToInsert = [];

    for (let i = 0; i < batchSize; i++) {
      const isAssigned = Math.random() > 0.15; // 85% chance of assignment
      const assignedCounselor = isAssigned ? faker.helpers.arrayElement(counselors) : null;
      const stage = faker.helpers.arrayElement(STAGES);
      const course = faker.helpers.arrayElement(COURSES);
      const leadCreatedAt = faker.date.past({ years: 0.15 }); // past ~55 days
      const leadId = faker.string.uuid();

      // Create dummy follow-ups for this lead
      const followUps = [];
      const numFollowUps = ["New Lead"].includes(stage) ? 0 : faker.number.int({ min: 1, max: 4 });

      let currentFollowUpDate = new Date(leadCreatedAt);

      for (let j = 0; j < numFollowUps; j++) {
        // distribute follow-up dates over time
        currentFollowUpDate = new Date(currentFollowUpDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000);
        
        // determine if follow-up is in the past (Completed) or future (Planned)
        const isFuture = currentFollowUpDate > new Date() && j === numFollowUps - 1; 
        const status = isFuture ? "Planned" : "Completed";
        const comment = faker.helpers.arrayElement(FOLLOWUP_COMMENTS);
        
        const nextFollowUpDate = isFuture 
          ? currentFollowUpDate 
          : new Date(currentFollowUpDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000);

        const followUpId = faker.string.uuid();
        
        followUps.push({
          id: followUpId,
          comment,
          status,
          nextFollowUpDate,
          leadId,
          createdAt: currentFollowUpDate
        });
      }

      const priority = calculatePriority(stage, followUps, leadCreatedAt);

      leadDataBatch.push({
        id: leadId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.string.numeric(10),
        course,
        stage,
        priority,
        counselorId: assignedCounselor ? assignedCounselor.id : null,
        createdAt: leadCreatedAt
      });

      // Save followups to add after lead creation
      followUpDataToInsert.push(...followUps);
    }

    // Insert leads
    await prisma.lead.createMany({
      data: leadDataBatch
    });

    // Insert follow-ups
    if (followUpDataToInsert.length > 0) {
      await prisma.followUp.createMany({
        data: followUpDataToInsert
      });
    }

    console.log(`Seeded batch ${b / batchSize + 1}/${totalLeads / batchSize}...`);
  }

  console.log("Seeding complete! 1000 leads and associated follow-ups generated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
