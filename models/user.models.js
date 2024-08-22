import mongoose from "mongoose";
// import { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String, //cloudinary url will be pasted
    required: true,
  },
  coverImage: {
    type: String
  },
  watchHistroy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  password: {
    type: String,
    required: ['true', "Password Is Required"]
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
})

// Pre is a token that is used before saving user information mean before saving encryption will be done

// we use function () {} instead of callback because in call back we don't have access to this key word and this key word is required to access userSchema

userSchema.pre("save", async function (next) {
  // we use this if because if any change made in user schema like avatar , image then this should run again and again and this will cause problem so to avoid this we use if this.isModified is an inbuilt function 
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// creating our own method we are creating this because we have stored password in encrypted form in a database and user will enter in normal form like riddhish123 so how to check whether password is correct or not so we use below like syntax

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// used in .env
userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
 }

export const User = mongoose.model("User", userSchema)
