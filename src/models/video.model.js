import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new Schema({
    video: {
        type: String, //cloudinary url
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


},
    { timeseries: true })


videoSchema.plugin(mongooseAggregatePaginate)  //👉 "Apne videoSchema me ek extra feature jod do jo page-by-page data laane me madad kare."

//"Jab video ka model banaye, to usme ek aisa option jod do jisse hum videos page-by-page laa saken (pagination), taaki ek baar me pura data na aaye, thoda-thoda aaye."
export const Video = mongoose.model('Video', userSchema)