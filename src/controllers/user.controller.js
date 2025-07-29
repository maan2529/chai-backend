import { upload } from "../middlewares/multer.middlewares.js";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import cloudinaryFileUpload from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async function (user_id) {
    try {
        const user = await User.findById(user_id)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        // await User.findOneAndUpdate({ _id: user_id }, { $set: { refreshToken: refreshToken } },)
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Sonething went wrong in generating access and refresh token")
    }
}
const registerUser = asyncHandler(async function (req, res) {
    //register 
    /*  take data from from
        check data (validation)
        check if user already exist:username, email
        check img and avatar
        upload to cloudinary ,avatar
        hash the password 
        store in database 
        remove password anf refresh token from response 
        check for user creation
        rense responce in frontend  

    */

    const { username, email, fullName, password } = req.body;

    // console.log(username, email, fullName, password)

    if ([username, email, fullName, password].some((para) => {
        // console.log(para)
        if (para?.trim() === "" || para?.trim() === undefined) {
            return true
        }
    })) {
        const apiError = new ApiError(404, "Some fields are empty");
        return res.status(404).json(
            {
                statusCode: apiError.statusCode,
                message: apiError.message,
                data: apiError.data,
                success: apiError.success,
                error: apiError.errors
            }
        )

    }

    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        },
    )

    if (user) {
        const apiError = new ApiError(409, "User already exist")
        return res.status(409).json(
            {
                statusCode: apiError.statusCode,
                message: apiError.message,
                data: apiError.data,
                success: apiError.success,
                error: apiError.errors
            }
        )
    }
    // console.log(email);
    // console.log("filesss",req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;

    if (req.files.coverImage[0]) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    } else {
        console.log("Cover Image not given")
    }


    if (!avatarLocalPath) {
        const apiError = new ApiError(400, "Need avaitar image")
        return res.status(400).json(
            {
                statusCode: apiError.statusCode,
                message: apiError.message,
                data: apiError.data,
                success: apiError.success,
                error: apiError.errors
            }
        )
    }
    const avatar = await cloudinaryFileUpload(avatarLocalPath)
    const coverImage = await cloudinaryFileUpload(coverImageLocalPath || "");
    console.log("path", { avatar }, { coverImage })

    if (!avatar) {
        const apiError = new ApiError(400, "Avatar file is required")
        return res.status(400).json(
            {
                statusCode: apiError.statusCode,
                message: apiError.message,
                data: apiError.data,
                success: apiError.success,
                error: apiError.errors
            }
        )
    }

    const userData = await User.create({
        username,
        email: email.toLowerCase(),
        fullName: username.toLowerCase(),
        password,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",

    })

    // console.log({ userData })
    const userCreated = await User.findById(userData._id).select("-password -refreshToken");
    if (!userCreated) {

        const apiError = new ApiError(500, "Something went wrong while registering the user")
        return res.status(400).json(
            {
                statusCode: apiError.statusCode,
                message: apiError.message,
                data: apiError.data,
                success: apiError.success,
                error: apiError.errors
            }
        )
    }
    return res.status(200).json(
        new ApiResponce(200, userCreated, "User registered successfully")
    )

})

const loginUser = asyncHandler(async function (req, res) {

    //get data from req
    // data mila ki nahi mila
    //mila to check if existing user or not 
    // if yess then check for password
    // generate access and refresh token 
    // store it in database 
    // then send access token to frontend via cookies

    let { username, password, email } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "require username or email");
    }

    if (!password) {
        throw new ApiError(400, "one of field is missing");
    }

    const user = await User.findOne({ // it will store current user all data
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not fount, if you are new signup first");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    if (!(accessToken || refreshToken)) {
        throw new ApiError(500, "did not get access token or refres token")
    }


    const loggedinUser = await User.findById(user._id).select("-password -accessToken");


    const option = {
        httpOnly: true,
        secure: false
    }

    res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponce(200, {
                user: loggedinUser, accessToken, refreshToken
            }, "User loggedIn succesfully")
        )

})

const loggedOut = asyncHandler(async function (req, res) {
    //take user data 

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponce(200, "User logout successfully"))
})

const refreshAccessToken = asyncHandler(async function (req, res) {
    const incomingRefreshToken = req.cookies.refreshToken || req.header.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorize user")
    }

    const decodedTokenData = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedTokenData) {
        throw new ApiError(401, "Wrong refresh token ")
    }

    const user = User.findById(decodedTokenData._id)

    if (user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token ")
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(decodedTokenData._id)

    const option = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
            new ApiResponce(200,
                {
                    user: decodedTokenData,
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token Refreshed")
        )



})

const changeCurrentPassword = asyncHandler(async function (req, res) {
    const { oldPassword, newPassword } = req.body;
    const user = User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "user not authenticated")
    }

    if (!oldPassword || !newPassword) {
        throw new ApiError(401, "require old and new password")
    }

    const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isOldPasswordValid) {
        throw new ApiError(401, "Password incorrect")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password changed succesfully"))

})
const getCurrentUser = asyncHandler(async function (req, res) {
    return res.status(200).json(200, req.user, "Current user fetched succesfully")
})

const updateUserAvatar = asyncHandler(async function (req, res) {
    const avatarLocalpath = req.files?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is missing ")
    }

    const avatar = await cloudinaryFileUpload(avatarLocalpath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true,
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponce(200, user, "Avatar updated successfully")
        )
})
const updateUserCoverImage = asyncHandler(async function (req, res) {
    const userCoverImagepath = req.files?.path;
    console.log(req.files)

    if (!userCoverImagepath) {
        throw new ApiError(400, "Cover Image file is missing ")
    }

    const coverImage = await cloudinaryFileUpload(userCoverImagepath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cover Image")
    }

    const user = User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: { coverImage: coverImage.url }
        },
        {
            new: true,
        }
    ).select("-password")

    return res.status(200).json(
        new ApiResponce(200, user, "Cover Image updated successfully")
    )
})
export {
    registerUser,
    loginUser,
    loggedOut,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage
} 