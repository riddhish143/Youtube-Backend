import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken = async (UserId) => {
  try {
    const user = await User.findById(UserId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }
}

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

  const exitedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (exitedUser) {
    throw new ApiError(409, "User with email or username already exists.")
  }

  // Check for images and Avatar
  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log(avatarLocalPath)

  // const coverImageLocalPath = req.files?.coverImage[0]?.path
  // console.log(coverImageLocalPath)

  // Above thing can cause issue when we don't have coverImage uploaded so better code is given below

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required.")
  }

  // Upload them to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
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

  const createdUser = await User.findById(user._id).select("-password -refreshToken").lean();

  // Check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong.")
  }

  // Return response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registred Successfully.")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  // bring data from req body
  const { email, password, username } = req.body

  // username or email is there or not
  if (!(username || !email)) {
    throw new ApiError(400, "Username or email is requried.")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  // find the user
  if (!user) {
    throw new ApiError(400, "User does not exist.")
  }

  // password check
  const isPasswordValid = user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential.")
  }

  // if password true in server then generate access token and secret token
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

  // send cookie
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken").lean();


  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In Successfully.")
    );

})


const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User Logged Out.")
    );

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request.")
    }
  
    const decodedToken = jwt.verify(
      token = incomingRefreshToken,
      secretOrPublicKey = process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Invalid User.")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Used or Expired.")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const { accessToken, newrefreshToken } = await generateAccessandRefreshToken(user._id)
  
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "New Refresh and Access Token Created."))
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token.")
  }
})
export { registerUser, loginUser, logOutUser,  refreshAccessToken }