import Apierrors from "../utils/Apierrors.js";
import { User } from "../models/user.models.js";
import uploadonCloudinary from "../utils/cloudinary.js";
import Apires from "../utils/Apires.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//generate access and refresh tokens
// this function will generate the access and refresh tokens for the user
const generateRefreshandAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user)
    if (!user) {
      throw new Error("User not found while generating tokens");
    }
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error.message);
    throw new Apierrors(
      500,
      "something went wrong while generating the tokens",
    );
  }
};

const registerUser = async (req, res) => {
  try {
    // console.log("Register route hit ✅");
    // const response=await res.status(200).json({success:true,message:"user registered successfully"})
    // return response

    // getting user details from front end
    const { username, email, password, fullname } = req.body;
    console.log(email, password, username);

    // validating if data is present or empty
    if (email === "") {
      throw new Apierrors(400, "email is required");
    }
    if (username === "") {
      throw new Apierrors(400, "username is required");
    }
    if (fullname === "") {
      throw new Apierrors(400, "fullname is required");
    }
    if (password === "") {
      throw new Apierrors(400, "pass is required");
    }

    // check if user already exits
    const ifUserExits = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (ifUserExits) {
      throw new Apierrors(400, "user already exits");
    }

    // check for file uploads and avatar is present or not
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverimagelocalpath = req.files?.coverimage?.[0]?.path || null;
    if (!avatarlocalpath) {
      throw new Apierrors(400, "avatar is required");
    }
    console.log(avatarlocalpath);
    console.log(coverimagelocalpath);

    // if file is available upload them to cloudinary
    const avatar = await uploadonCloudinary(avatarlocalpath);
    // const coverimage = await uploadonCloudinary(coverimagelocalpath)
    if (!avatar) {
      throw new Apierrors(400, "avatar upload failed");
    }

    let coverimage = null;
    if (coverimagelocalpath) {
      coverimage = await uploadonCloudinary(coverimagelocalpath);
    }

    // create user object and make in entry in db and check for if user is created
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      avatar: avatar.url,
      coverimage: coverimage?.url || "",
      fullname,
      password,
    });
    const usercreated = await User.findById(user._id).select(
      "-password -refreshtoken",
    ); //remove password and refresh tokens from response like this
    //checking for user creation weather user created or not
    if (!usercreated) {
      throw new Apierrors(400, "user not created");
    }

    const { accessToken, refreshToken } = await generateRefreshandAccessToken(
      user._id,
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite:"None"
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res
      .status(201)
      .json(new Apires(200, usercreated, "user created successfully"));
  } catch (error) {
    console.log("error at register user", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message || "server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    // take data from front end
    const { email, password } = req.body;
    console.log(email, password);
    // const email=req.body.email the upper process if u dont understand like this we can use this also
    // username or email based login ur wish
    if (!email) {
      throw new Apierrors(400, "Email  is required");
    }

    // find the user
    const user = await User.findOne({
      email: email.trim(),
      // $or:[{email},{username}]
    });

    console.log(user);

    if (!user) {
      throw new Apierrors(400, "user not found");
    }

    // if user got then check for the password
    const validPassword = await user.isPasswordCorrect(password);
    if (!validPassword) {
      throw new Apierrors(400, "password is incorrect");
    }

    // access and refresh token generation
    const { accessToken, refreshToken } = await generateRefreshandAccessToken(
      user._id,
    );
    console.log(accessToken, refreshToken);

    user.refreshToken=refreshToken
    await user.save();

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    // send this tokens in type of cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite:"None"

    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new Apires(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "user logged in successfully",
        ),
      );
  } catch (error) {
    console.log("error at logging in user", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message || "server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: undefined,
      },
    });
    const options = {
      httpOnly: true,
      secure: true,
      sameSite:"None"
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new Apires(200, "user logged out successfully"));
  } catch (error) {
    console.log(error.message);
    throw new Apierrors(500, "something went wrong while logouting the user");
  }
};

// refreshing refresh tokens
const refreshedAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    console.log(req.cookies,"cookies recieved");
    if (!incomingRefreshToken) {
      console.log(" No refresh token found in cookies");
      throw new Apierrors(401, "refresh token not found");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
     console.log("Decoded token:", decodedToken);

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      console.log("User not found");
      throw new Apierrors(401, "user not found");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      console.log(" Refresh token mismatch");
      throw new Apierrors(401, "refresh token expierd");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite:"None"
    };

    const { accessToken, refreshToken } = await generateRefreshandAccessToken(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new Apires(200, "access token refreshed successfully"));
  } catch (error) {
    console.log(error.message);
    throw new Apierrors(
      500,
      "something went wrong while refreshing access token",
    );
  }
};

// update password
const updatePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;
    const user = await User.findById(req.user?._id);
    const validPassword = await user.isPasswordCorrect(oldPass);
    if (!validPassword) {
      console.log("error at old password", error.message);
      throw new Apierrors(400, "old password is incorrect");
    }
    user.password = newPass;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new Apires(200, "password updated successfully"));
  } catch (error) {
    console.log("error at updating password", error.message);
    throw new Apierrors(500, "something went wrong while updating password");
  }
};

//get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select(
      "-password -refreshToken",
    );
    return res.status(200).json(new Apires(200, user));
  } catch (error) {
    console.log("error at getting current user", error.message);
    throw new Apierrors(500, "something went wrong while getting current user");
  }
};

//update fullname and email
const updateUser = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
      throw new Apierrors(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname,
          email: email,
        },
      },
      { new: true },
    ).select("-password");
    return res
      .status(200)
      .json(new Ap(200, user, "Account details updated successfully"));
  } catch (error) {
    console.log("error at updating user", error.message);
    throw new Apierrors(500, "something went wrong while updating user");
  }
};

//update avatar
//here we are directly updating the new avatar if u want u can add more code for deleting the old avatar from cloudinary to save some space but it is optional or lets update it in future
const updateUserAvatar = async (req, res) => {
  const avatarlocalpath = req.file.path; //current uploaded file
  if (!avatarlocalpath) {
    throw new Apierrors(400, "avatar file is missing or required");
  }
  const avatar = await uploadonCloudinary(avatarlocalpath);
  if (!avatar) {
    throw new Apierrors(400, "something went wrong while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true },
  ).select("-password -refreshToken");
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new Apires(200, user, "avatar updated successfully"));
};

//update coverimage
const coverImage = async (req, res) => {
  const coverimagelocalpath = req.file.path; //current uploaded file
  if (!coverimagelocalpath) {
    throw new Apierrors(400, "coverimage file is missing or required");
  }
  const coverimage = await uploadonCloudinary(coverimagelocalpath);
  if (!coverimage) {
    throw new Apierrors(
      400,
      "something went wrong while uploading cover image",
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverimage: coverimage.url },
    },
    { new: true },
  ).select("-password -refreshToken");
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new Apires(200, user, "cover image updated successfully"));
};

// channel profile
const getUserChannelProfile = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new Apierrors(400, "username is required");
  }
  // const user =await User.find({username}) use this if u want but in agg pipeline there is  a match field which does the matching
  const channel = await User.aggregate([
    {
      //filtering the user or document based on the username
      $match: { username: username?.toLowerCase() },
    },
    {
      //after filtering we are getting the user so now the user as howmany subscribers we are checking that
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      //getting the no of subscribers does the channel user subscribed
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      //in user u have fields like email fullname etc but this method will add more fields under them
      $addFields: {
        subscribersCount: {
          //this will give the no of subscribers or basically counts the no of documents
          $size: "$subscribers",
        },
        channelsSubscribedTo: {
          //this will give the no of channels or basically counts the no of documents (showing the user what the no of channels does he subs to)
          $size: "$subscribedTo",
        },
        isSubscribed: {
          //when landing on the channel profile page if the user is subscribed or not
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      //gives the values u want to show like u have some fields which u dont want to show so the name suggests it projects only show the fields u want
      $project: {
        _id: 1,
        username: 1,
        fullname: 1,
        avatar: 1,
        coverimage: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscribed: 1,
      },
    },
  ]);
  console.log(channel);

  if (!channel?.length) {
    throw new Apierrors(400, "channel not found");
  }
  return res
    .status(200)
    .json(
      new Apires(200, channel[0], "user channel profile fetched successfully"),
    );
};

const getWatchHistory = async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new Apires(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully",
      ),
    );
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshedAccessToken,
  updatePassword,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  coverImage,
  getUserChannelProfile,
  getWatchHistory,
};
