import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {createPlaylist,} from "../controllers/playlist.controllers.js";

const router = Router();
router.use(verifyJWT);


router.route("/create").post(createPlaylist);


export default router;