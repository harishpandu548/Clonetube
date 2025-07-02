import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema=new Schema({
    content:{
        type:String,
    },
    video:{
        //the video you commented on
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        //you (xyz)
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment=mongoose.model("Comment",commentSchema)