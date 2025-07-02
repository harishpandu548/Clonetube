import { Router } from "express";

import { logoutUser, refreshedAccessToken, registerUser,updatePassword, getCurrentUser,
    updateUser, updateUserAvatar,coverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router=Router()

// for register
router.route("/register").post(
    upload.fields([{name:"avatar",maxCount:1},{name:"coverimage",maxCount:1}]
),registerUser)

// for login
router.route("/login").post(loginUser)

// this are secured routes means to perform any action you should verify the user first we can do it by using middlewares

// logout
router.route("/logout").post(verifyJWT,logoutUser)

// refreshing token
router.route("/refresh-token").post(refreshedAccessToken)

router.route("/change-password").post(verifyJWT,updatePassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/updateuser").patch(verifyJWT,updateUser)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/coverimage").patch(verifyJWT,upload.single("coverimage"),coverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT,getWatchHistory)


export default router
