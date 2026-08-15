import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(file);
    fs.unlinkSync(file);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(file);
    console.log(`error while uploading on cloudinary : ${error}`);
  }
};

export default uploadOnCloudinary;
