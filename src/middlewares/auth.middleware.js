// import Apierrors from "../utils/Apierrors.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No access token. You are not logged in." });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found. You are not logged in." });
    }

    req.user = user; 
    next();

  } catch (error) {
    console.log("error at verifyJWT middleware", error.message);
    return res.status(401).json({ success: false, message: "Invalid token or login expired" });
  }
};
