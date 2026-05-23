import express from "express";
import { createFollowUp, updateFollowUp } from "../controllers/followups.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createFollowUp);
router.put("/:id", authenticate, updateFollowUp);

export default router;
