// const asyncHandler = () => {

// }

// #abhi to nahi samjha kya kaam karne vala hai ye , shayd use krte time samjh aaye 

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next())
    }
}

export default asyncHandler 