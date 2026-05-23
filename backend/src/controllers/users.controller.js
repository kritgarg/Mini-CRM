import bcrypt from "bcryptjs";
import prisma from "../utils/db.js";

// GET /api/users - Get all counselors (Admin only)
export const getCounselors = async (req, res) => {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: "COUNSELOR" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { leads: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = counselors.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      createdAt: c.createdAt,
      assignedLeadsCount: c._count.leads
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Get counselors error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users - Create new counselor (Admin only)
export const createCounselor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "COUNSELOR"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Counselor created successfully",
      user: newUser
    });
  } catch (error) {
    console.error("Create counselor error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
