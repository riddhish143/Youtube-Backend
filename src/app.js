import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// Use while using middle ware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credential: true
}))

app.use(express.json({
  limit: "16kb"
}))

app.use(express.urlencoded({
  extended: true, limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// routes import 
import userRouter from '../routes/user.routes.js';

// routes declaration
// when we use /users the command it given to userRouter then on /register specific method is called
// example https://localhost:7000/users/register
// app.use('/users',userRouter) not a best practise use below one

app.use("/api/v1/users",userRouter)
// example https://localhost:7000/api/v1/users/register

export { app }

