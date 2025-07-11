import dotenv from "dotenv";
import dbConnection from "./db/index.js";
import { app } from "./app.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// Load environment variables early
dotenv.config({ path: "./.env" });

// DB Connection
dbConnection()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    // Serve frontend build (assuming Vite build is inside /frontend/dist)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendPath = path.join(__dirname, "frontend", "dist");

    app.use(express.static(frontendPath));

    // SPA Fallback: send index.html for unknown routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });

    // Start server
    app.listen(PORT, () => {
      console.log(" Server running at port", PORT);
    });
  })
  .catch((error) => {
    console.log(" DB connection error:", error);
  });
