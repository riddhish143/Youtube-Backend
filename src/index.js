// require('dotenv').config() Better way
import dotenv from 'dotenv'
import connectDB from "../db/index.js";
import { app } from './app.js'


// const app = express()
dotenv.config({
  path:'./.env'
})


// Second Approach to connect to MongoDB
connectDB().then(
  () => {
    app.listen(process.env.PORT || 8000 , () => {
      console.log(`Server is listening at port: ${process.env.PORT}`)
    })
  }
).catch((error)=>{
  console.log("MongoDB connection Failed",error)
})


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