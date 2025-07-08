import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {createPlaylist, getplaylist} from "../controllers/playlist.controllers.js";

const router = Router();
router.use(verifyJWT);


router.route("/create").post(createPlaylist);
router.route("/getplaylist").get(getplaylist);


export default router;