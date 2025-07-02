import { Subscription } from "../models/subscriptions.models.js"


// subscribe to a channel
const subscribeToChannel=async(req,res)=>{
    const {channelId}=req.params

    if(channelId===req.user.id.toString()){
        return res.satus(400).json({
            success:false,
            message:"You cannot subscribe to your own channel"
        })
    }

    const alreadySubscribed=await Subscription.findOne({
        channel:channelId,
        subscriber:req.user.id
    })

    if(alreadySubscribed){
        return res.status(400).json({
            success:false,
            message:"You are already subscribed to this channel"
        })
    }

    const subscription=await Subscription.create({
        channel:channelId,
        subscriber:req.user._id
    })

    return res.status(201).json({
        success:true,
        message:"Subscribed to channel successfully",
        data:subscription
    })
}

// unsubscribe from a channel
const unsubscribeFromChannel=async(req,res)=>{
    const {channelId}=req.params
    const subscription=await Subscription.findOneAndDelete({
        channel:channelId,
        subscriber:req.user._id
    })

    if(!subscription){
        return res.status(404).json({
            success:false,
            message:"You are not subscribed to this channel"
        })
    }

    return res.status(200).json({
        success:true,
        message:"Unsubscribed from channel successfully",
        data:subscription
    })

}

// check the status of subscription
const checkSubscriptionStatus=async(req,res)=>{
    const {channelId}=req.params
    console.log("channelId",channelId)

    const isSubscribed=await Subscription.exists({
        channel:channelId,
        subscriber:req.user._id
    })
    return res.status(200).json({
        success:true,
        message:"Subscription status fetched successfully",
        subscriber:Boolean(isSubscribed)
    })
}

// check the total number of subscribers for a channel
const getTotalSubscribers=async(req,res)=>{
    const {channelId}=req.params

    const totalSubscribers=await Subscription.countDocuments({
        channel:channelId
    })

    return res.status(200).json({
        success:true,
        message:"Total subscribers fetched successfully",
        subsciberCount:totalSubscribers
    })
}

export {subscribeToChannel,unsubscribeFromChannel,checkSubscriptionStatus,getTotalSubscribers}

