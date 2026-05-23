import express from "express";
import { getLeads, getLeadById, createLead, updateLead, deleteLead } from "../controllers/leads.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getLeads);
router.get("/:id", authenticate, getLeadById);
router.post("/", authenticate, createLead);
router.put("/:id", authenticate, updateLead);
router.delete("/:id", authenticate, requireAdmin, deleteLead);

export default router;
