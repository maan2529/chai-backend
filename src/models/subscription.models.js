import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //
        ref: "User",

    },
    channel: {  // jiska channel hai 
        type: Schema.Types.ObjectId, //
        ref: "User",
        required: true,
    }
},
    { timeseries: true })

export const Subscription = mongoose.model('Subscription', subscriptionSchema)