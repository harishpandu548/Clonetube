import { Like } from '../models/like.models.js';
import { Video } from '../models/video.models.js';
import { Comment } from '../models/comment.models.js';

//Like and unlike video
const likeVideo = async (req, res) => {
    try{
        const { videoId } = req.params;
        const video=await Video.findById(videoId);
        if(!video){
            return res.status(404).json({
                success: false,
                message: "Video not found"
            })
        }

        const alreadyLiked=await Like.findOne({video:videoId})
        if(alreadyLiked){
            return res.status(400).json({
                success: false,
                message: "You have already liked this video"
            });
        }
        const like=await Like.create({
            video:videoId,
            likedby:req.user._id
        })
        return res.status(201).json({
            success: true,
            message: "Video liked successfully",
            data: like
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to like the video",
            error: error.message
        });
    }
}

const unLikeVideo = async (req, res) => {
    const { videoId } = req.params;
    try{
        const like=await Like.findOne({video:videoId,likedby:req.user._id});
        if(!like){
            return res.status(404).json({
                success: false,
                message: "You have not liked this video"
            });
        }
        await Like.deleteOne({video:videoId,likedby:req.user._id});
        return res.status(200).json({
            success: true,
            message: "Video unliked successfully"
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to unlike the video",
            error: error.message
        });

    }
}

const likeCount = async (req, res) => {
    const { videoId } = req.params;
    try{
        const count=await Like.countDocuments({video:videoId});
        return res.status(200).json({
            success: true,
            message: "Like count fetched successfully",
            data: { count }
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to fetch like count",
            error: error.message
        }); }
}


// Like and unlike comment
const likeComment=async(req,res)=>{
    try{
        const {commentId}=req.params

        const comment=await Comment.findById(commentId);
        if(!comment){
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const alreadycommentLiked=await Like.findOne({commentliked:commentId,likedby:req.user._id});
        if(alreadycommentLiked){
            return res.status(400).json({
                success: false,
                message: "You have already liked this comment"
            });
        }

        const commentLike=await Like.create({
            commentliked:commentId,
            likedby:req.user._id
        })
        return res.status(201).json({
            success: true,
            message: "Comment liked successfully",
            data: commentLike
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to like the comment",
            error: error.message
        });

    }
}
const unlikeComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const like = await Like.findOne({ commentliked: commentId, likedby: req.user._id });

    if (!like) {
      return res.status(404).json({ success: false, message: "Like not found" });
    }

    await like.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment unliked"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to unlike comment", error: error.message });
  }
};

const getCommentLikeCount = async (req, res) => {
  const { commentId } = req.params;
  try {
    const count = await Like.countDocuments({ commentliked: commentId });
    res.status(200).json({
      success: true,
      likeCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get comment like count", error: error.message });
  }
};


export { likeVideo,unLikeVideo,likeCount,likeComment,unlikeComment,getCommentLikeCount };