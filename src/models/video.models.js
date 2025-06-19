import mongoose ,{Schema}from "mongoose"; 
import mongooseaggregatepaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new Schema({
    videofile:{
        type:String, //comes from cloudinary
        required:true
    },
    thumbnail:{
        type:String, //comes from cloudinary
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number, //clodinary url
        required:true
    },
    views:{
        type:Number,
        default:0,
        
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User", 
    },
    ispublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

videoSchema.plugin(mongooseaggregatepaginate)

export const Video=mongoose.model("Video",videoSchema)