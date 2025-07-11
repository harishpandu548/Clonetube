import dotenv from "dotenv";
import dbConnection from "./db/index.js";
import { app } from "./app.js";



// Load env variables early
dotenv.config({ path: "./.env" });

// Connect DB and start server
dbConnection()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(" Server running at port", PORT);
    });
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });
