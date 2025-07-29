import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const varifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        // console.log("req.cookies", req.cookies);
        // console.log("req.header", req.header.Authentication);
        // console.log("req.cookies.accessToken ", req.cookies.accessToken);

        if (!token) {
            throw new ApiError(401, "Unauthorized token")
        }
        const varifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // it return payload 
        if (!varifyToken) {
            throw new ApiError(401, 'Wrong Varify Token')
        }
        // console.log(varifyToken)
        const user = await User.findById(varifyToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(404, error?.message || "Invalid access")
    }
})




