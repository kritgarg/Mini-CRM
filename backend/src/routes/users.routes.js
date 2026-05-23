import express from "express";
import { getCounselors, createCounselor } from "../controllers/users.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, getCounselors);
router.post("/", authenticate, requireAdmin, createCounselor);

export default router;
