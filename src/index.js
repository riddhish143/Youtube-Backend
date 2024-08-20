// require('dotenv').config() Better way
import dotenv from 'dotenv'
import connectDB from "../db/index.js";

dotenv.config({
  path:'./env'
})


// Second Approach to connect to MongoDB
connectDB()


// First Approach to connect to MongoDB 
/*
;(async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
  }catch(error){
    console.error("Error:",error)
  }
})()
*/