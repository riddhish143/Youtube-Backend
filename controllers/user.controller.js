import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"



const registerUser = asyncHandler(async (req, res) => {
  // Get user from FrontEnd

  const { fullname, email, username, password } = req.body
  console.log("Email:", email);

  // Validation - not Empty

  // if (fullname === "") {
  //   throw new ApiError(400,"Fullname is Required")
  // }

  // Above one works fine but we have to do this for all fields so better way is given below

  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Fullname is Required.")
  }

  // Check if user already exists (check using username or email)

  const exitedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if (exitedUser) {
    throw new ApiError(409, "User with email or username already exists.")
  }

  // Check for images and Avatar
  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log(avatarLocalPath)

  const coverImageLocalPath = req.files?.coverImage[0]?.path
  console.log(coverImageLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required.")
  }

  // Upload them to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar){
    throw new ApiError(400, "Avatar File is Required.")
  }

  // Create user object - Create entry in DB

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

 
  // Remove password and refresh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -prefreshToken"
  )

  // Check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong.")
  }

  // Return response
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registred Successfully.")
  )
})

export { registerUser }