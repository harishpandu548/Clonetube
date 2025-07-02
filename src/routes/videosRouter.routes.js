import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideoById,  
  updateVideo
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .get(getAllVideos)
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


router.route("/:videoId").
get(getVideoById).
delete(deleteVideoById).
patch(upload.single("thumbnail"),updateVideo); 

export default router;
