import uploadonCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

// getting all the videos
const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 15, sortBy, sortType } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = { ispublished: true }; //filtering the videos which are published

    // if(userId){              //unnecessary bcz i am taking the user from the params and finding the user from the database
    //     filter.owner=userId
    // }
    const sort = {
      [sortBy]: sortType === "asc" ? 1 : -1,
    };
    const videos = await Video.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .select("title description thumbnail duration views owner  createdAt")
      .populate("owner", "username avatar"); //selecting the fields to return

    const totalVideos = await Video.countDocuments(filter);

    // here i am not using the structure of the api response
    res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      data: videos,
      totalVideos,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    console.log("error in getAllVideos controller", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//publishing  a video
const publishVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const videofile = req.files?.videofile;
    // console.log(req.files.videofile)
    console.log("Received video file:", videofile?.[0]?.path);

    const thumbnail = req.files?.thumbnail;
    // console.log(req.files.thumbnail)
    console.log("Received thumbnail:", thumbnail?.[0]?.path);

    if (!videofile || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Please upload both video and thumbnail",
      });
    }

    const videoUpload = await uploadonCloudinary(videofile[0]?.path);
    const thumbnailUpload = await uploadonCloudinary(thumbnail[0]?.path);
    if (!videoUpload || !thumbnailUpload) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload video or thumbnail",
      });
    }
    const duration = videoUpload.duration;
    console.log("duration", duration);

    //after uploading save to mongodb
    const video = await Video.create({
      videofile: videoUpload.url,
      thumbnail: thumbnailUpload.url,
      title,
      description,
      duration: duration,
      owner: req.user._id, //req.user is set by the verifyJWT middleware
    });

    res.status(201).json({
      success: true,
      message: "Video published successfully",
      data: video,
    });
  } catch (error) {
    console.log("error in publishVideo controller", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to publish video",
    });
  }
};

//get video by id
const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate(
      "owner",
      "username _id avatar",
    );
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    const user = await User.findById(req.user._id);

    const alreadywatched = user.watchHistory.includes(video._id);
    if (!alreadywatched) {
      user.watchHistory.unshift(video._id);
      if (user.watchHistory.length > 50) {
        user.watchHistory.pop();
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Video fetched successfully",
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get the video",
    });
  }
};

//delete the video
const deleteVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    //check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this video",
      });
    }

    await video.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      // message:'Failed to delete the video'
    });
  }
};

// update the video
const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    //check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this video",
      });
    }

    if (title) {
      video.title = title;
    }
    if (description) {
      video.description = description;
    }

    if (req.file) {
      const thumbnailUpload = await uploadonCloudinary(req.file.path);
      video.thumbnail = thumbnailUpload.url;
    }
    await video.save();
    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update the video",
    });
  }
};

const views = async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    const hasViewed = video.viewsby.some(
      (viewerId) => viewerId.toString() === req.user._id.toString(),
    );

    if (!hasViewed) {
      video.views += 1;
      video.viewsby.push(req.user._id);
      await video.save();
    }
    res.status(200).json({
      success: true,
      message: hasViewed
        ? "View already recorded for this user"
        : "View count incremented",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//get all the user videos
const getallvideos=async(req,res)=>{
  try{
    const myvideos=await Video.find({owner:req.user._id}).populate("owner","username avatar")
    return res.status(200).json({
      success:true,
      data:myvideos,
      message:"videos of the user fetched"
    })
  }
  catch(error){
    return res.status(500).json({
      success:false,
      error:error.message,
      message:"failed getting user videos"
    })
  }
}


// search bar ur wish optional
const searchvideos = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "search query failed",
      });
    }
    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    }).populate("owner", "username avatar");

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    return res.status({
      success: false,
      error: error.message,
      message:"search failed"
    });
  }
};

export {
  publishVideo,
  getAllVideos,
  getVideoById,
  deleteVideoById,
  updateVideo,
  views,searchvideos,getallvideos
};

// completed the video controller if u want to manupulate the video data like update, delete, get by id, get all videos then u can add it in future
