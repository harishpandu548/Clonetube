import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";

// post or create a comment
const postComment=async(req,res)=>{
    try{
        const {videoId}=req.params;
        const {content}=req.body;

        const video=await Video.findById(videoId)
        if(!video){
            return res.status(404).json({
                success:false,
                message:"Video not found"
            });
        }

        const comment=await Comment.create({
            content,
            video:videoId,
            owner:req.user._id
        })
        return res.status(201).json({
            success:true,
            message:"Comment posted successfully",
            data:comment
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Failed to post the comment"
        })
    }
}

//getting all comments for a video
const getAllCommentsForVideo=async(req,res)=>{
    try{
        const {videoId}=req.params;

        const video=await Video.findById(videoId)
        if(!video){
            return res.status(404).json({
                success:false,
                message:"Video not found"
            });
        }

        const comments=await Comment.find({video:videoId}).populate("owner", "_id username avatar");
        console.log(comments);

        return res.status(200).json({
            success:true,
            message:"Comments fetched successfully",
            data:comments
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Failed to fetch comments"
        })}
}

// delete the comment if you are the owner of the comment
const deleteComment=async(req,res)=>{
    try{
        const {commentId}=req.params;

        const comment=await Comment.findById(commentId)
        if(!comment){
            return res.status(404).json({
                success:false,
                message:"Comment not found"
            });
        }
        if(comment.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"You are not authorized to delete this comment"
            });
        }

        await comment.deleteOne()
        return res.status(200).json({
            success:true,
            message:"Comment deleted successfully"
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Failed to delete the comment"
        })
    }
}


export {postComment,getAllCommentsForVideo,deleteComment}