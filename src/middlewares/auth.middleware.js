import Apierrors from "../utils/Apierrors.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";


export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (! token) {
      throw new Apierrors(401, "you are not logged in");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new Apierrors(401, "you are not logged in");
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("error at logout middleware",error.message)
    throw new Apierrors(401, "you are not logged in");
  }
};
