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
        const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: auto,
                overwrite: true,
            }
            )
        console.log("File uploaded on Cloudinary", uploadResult.url)
        return uploadResult
    } catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

