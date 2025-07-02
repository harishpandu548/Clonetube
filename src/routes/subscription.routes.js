import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { subscribeToChannel,unsubscribeFromChannel,checkSubscriptionStatus,getTotalSubscribers } from "../controllers/subscription.controllers.js";

const router = Router();
router.use(verifyJWT)

// subscribe to a channel
router.post("/:channelId",subscribeToChannel)
router.delete("/:channelId",unsubscribeFromChannel)
router.get("/status/:channelId",checkSubscriptionStatus)
router.get("/count/:channelId",getTotalSubscribers)

export default router
