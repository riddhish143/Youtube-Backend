import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null
    }

    // upload the file in cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    // File has been uploaded successfully
    console.log("File is successfully uploaded on cloudinary :",response.url);
    fs.unlinkSync(localFilePath)
    return response

  } catch (error) {
    // using fs so that we unlink the file so that crupted file is not in this server
    // remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath)
    return null;
  }
}

export { uploadOnCloudinary }