// require('dotenv').config({ path: './env' })

/*
import mongoose from "mongoose";
import express from "express"
import { DB_NAME } from "./constants";
const app = express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("err", (err) => {
            console.log("ERROR: ", err)
            throw err
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`https://localhost:${process.env.PORT}`)
        })
    } catch (err) {
        console.log("ERROR: ", err)
        throw err
    }
})()
    */

import connectDB from "./db/index.js";
import express from 'express'
import dotenv from "dotenv"
dotenv.config()
const app = express();


connectDB()
    .then(() => {
        console.log("database conneted succesfully")
        app.listen(process.env.PORT || 8000, () => {
            console.log(`databse is running on port http://localhost:${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("database connection fail", err)
    })