import { Playlist } from "../models/playlist.models.js";

const createPlaylist = async (req, res) => {
    const {name,description,videos} = req.body;
    try{
        if(!name){
            return res.status(400).json({
                success: false,
                message: "Playlist name is required"
            })
        }
        const playList=await Playlist.create({
            name,description,
            videos:videos||[],
            owner:req.user._id
        })
        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            playList
        })

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to create playlist",
            error: error.message
        })
    }
}

export { createPlaylist };