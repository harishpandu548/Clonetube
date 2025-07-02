import mongoose,{Schema} from "mongoose";

const playlistSchema=new Schema({
    name:{
        type:String
    }
    ,description:{
        type:String
    },
    videos:[{
        //videos the user want to add
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        //says who created the playlist.
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})


export const Playlist=mongoose.model("Playlist",playlistSchema)

