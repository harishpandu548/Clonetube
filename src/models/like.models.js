import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema({
    video:{//ref the vid you liked
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    commentliked:{ //ref the comment u liked
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    likedby:{//ref you, the user who liked it
        type:Schema.Types.ObjectId,
        ref:"User"
    }               
},{timestamps:true})


export const Like=mongoose.model("Like",likeSchema)