import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const mongoDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log('mongoDB connection succesfully created', connectInstance.connection.host) //note point
    } catch (err) {
        console.log("MONGODB connection fail", err)
        process.exit(1); // note point
    }

}

export default mongoDB













// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`/n MongoDB connected !! Db HOST : ${connectionInstance.connection.host}`)
//         // console.log(connectionInstance)
//     } catch (err) {
//         console.log("MONGODB connection error", err);
//         process.exit(1)
//     }
// }

// export default connectDB;