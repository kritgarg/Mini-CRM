import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import leadRoutes from "./routes/leads.routes.js";
import followupRoutes from "./routes/followups.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import importRoutes from "./routes/import.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes mounting
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/import", importRoutes);

app.get("/", (req, res) => {
  res.send("CRM Backend Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export default app;