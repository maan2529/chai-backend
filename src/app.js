import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    "origin": process.env.CORS_ORIGIN,
    "credentials": true,
    "optionsSuccessStatus": 204
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extends: true, limit: '16kb' }))
app.use(express.static("public"))
app.use(cookieParser())


// Route import 
import { userRouter } from "./routes/user.routers.js"

//Route use
app.use("/api/v1/user", userRouter)

export { app }
