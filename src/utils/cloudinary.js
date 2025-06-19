import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

// Upload an image
const uploadonCloudinary = async (localfilepath) => {
  try {
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log(response.url);
    return response;
  } catch (error) {
    // delete the local file if the uploadation failed
    fs.unlinkSync(localfilepath);
    console.log(error);
    return null;
  }
};

export default uploadonCloudinary;