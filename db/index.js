import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\nMongoDB connected with DB HOST: ${connectionInstance.connection.host}`)
  } catch (error) {
    console.error("MongoDB Error")
    // process is the inbuilt in javascript 
    process.exit(1)
  }
}

export default connectDB;