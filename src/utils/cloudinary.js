import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
});

async function cloudinaryFileUpload(localFilePath) { //link of local file upload on server

    try {
        if (!localFilePath) return null;
        // console.log({ localFilePath })
        const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto",
                overwrite: true,
            }
            )
        console.log("File uploaded on Cloudinary", uploadResult.url);
        fs.unlinkSync(localFilePath);
        return uploadResult
    } catch (err) {

        console.log("Error from cloudinary file upload", err)
        // fs.unlinkSync(localFilePath);
        return null;
    }
}

export default cloudinaryFileUpload