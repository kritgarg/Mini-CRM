import express from "express";
import { importLeads } from "../controllers/import.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/leads", authenticate, importLeads);

export default router;
