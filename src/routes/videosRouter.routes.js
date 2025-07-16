import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideoById,  
  updateVideo,views,searchvideos,getallvideos
} from "../controllers/video.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router
  .route("/")
  .get(getAllVideos)

router.use(verifyJWT);

router
.route("/")
.post(
    upload.fields([
      {
        name: "videofile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishVideo,
  );

router.route("/myvideos").get(getallvideos)

router.route("/:videoId").
get(getVideoById).
delete(deleteVideoById).
patch(upload.single("thumbnail"),updateVideo)

router.route("/views/:videoId").patch(views)

router.route("/search").get(searchvideos)

export default router;
