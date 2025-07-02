import express, { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { likeVideo ,unLikeVideo,likeCount,likeComment,unlikeComment,getCommentLikeCount} from '../controllers/like.controllers.js';

const router=Router();
router.use(verifyJWT);

// video like and unlike routes
router.route("/video/:videoId").post(likeVideo)
router.route("/video/:videoId").delete(unLikeVideo);
router.route("/count/:videoId").get(likeCount)

// comment like and unlike routes
router.route("/comment/:commentId").post(likeComment);
router.route("/comment/:commentId").delete(unlikeComment);
router.route("/comment/count/:commentId").get(getCommentLikeCount);



export default router;      