// src/server.ts

import express from "express";
import path from "path";
import uploadRoutes from "./routes/uploadRoutes";
import tournamentRoutes from "./routes/tournamentRoutes";

console.log("[server] Bootstrapping...");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (✅ moved upload under /api)
app.use("/api/upload", uploadRoutes);
app.use("/api/tournaments", tournamentRoutes);

// Serve frontend views
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

app.get("/tournaments", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "tournaments.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`[server] Running at http://localhost:${PORT}`);
});
