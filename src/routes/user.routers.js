import { Router } from "express";
import { loggedOut, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middlewares.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
const userRouter = Router()


userRouter.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
userRouter.route("/login").post(loginUser)

//secure route
userRouter.route("/logout").post(varifyJWT, loggedOut)
userRouter.route("/refresg-token").post(refreshAccessToken)

export { userRouter } 