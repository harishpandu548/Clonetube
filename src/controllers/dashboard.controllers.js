import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Subscription } from "../models/subscriptions.models.js";

const dashboardOverview = async (req, res) => {
  const userId = req.user._id;

  try {
    const totalVideos = await Video.countDocuments({ owner: userId });
    const userVideos = await Video.find({ owner: userId });
    const totalViews = userVideos.reduce(
      (acc, vid) => acc + (vid.views || 0),
      0,
    );
    const totalComments = await Comment.countDocuments({ owner: userId });
    const totalLikes = await Like.countDocuments({ likedby: userId });
    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalVideos,
        totalViews,
        totalComments,
        totalLikes,
        totalSubscribers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error.message,
    });
  }
};
export { dashboardOverview };
