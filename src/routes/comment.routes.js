import { Router } from "express"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postComment ,getAllCommentsForVideo,deleteComment} from "../controllers/comment.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(postComment)
router.route("/:videoId").get(getAllCommentsForVideo)
router.route("/:commentId").delete(deleteComment)                    

export default router