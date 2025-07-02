import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { dashboardOverview } from "../controllers/dashboard.controllers.js";

const router=Router()
router.use(verifyJWT);

// Dashboard routes
router.route("/dashboard/overview").get(dashboardOverview);


export default router;
