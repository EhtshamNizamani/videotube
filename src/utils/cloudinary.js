import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("localFilePath  ====>" + localFilePath);
    fs.unlinkSync(localFilePath);

    return uploadResult;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// Function to delete a video from Cloudinary using its public ID
const deleteVideoFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const deleteResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    console.log("Deleted publicId  ====>" + publicId);

    return deleteResult;
  } catch (err) {
    console.error("Error deleting from Cloudinary: ", err);
    return null;
  }
};
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const deleteResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log("Deleted publicId  ====>" + publicId);

    return deleteResult;
  } catch (err) {
    console.error("Error deleting from Cloudinary: ", err);
    return null;
  }
};
export {
  uploadOnCloudinary,
  deleteVideoFromCloudinary,
  deleteImageFromCloudinary,
};
