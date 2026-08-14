const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

const storage = useCloudinary ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'campusbridge_uploads';
        if (req.body.collegeId) folderName += `/college_${req.body.collegeId}`;
        else if (req.user && req.user.collegeId) folderName += `/college_${req.user.collegeId}`;
        
        return {
            folder: folderName,
            resource_type: 'auto',
            public_id: `${file.fieldname}-${Date.now()}`
        };
    }
}) : multer.diskStorage({
    destination(req, file, cb) {
        // Basic local fallback if Cloud Storage isn't wired fully
        let dir = 'uploads/';
        // if collegeId is passed, store in specific college folder
        if (req.body.collegeId) {
            dir += `college_${req.body.collegeId}/`;
        } else if (req.user && req.user.collegeId) {
            dir += `college_${req.user.collegeId}/`;
        }

        // Ensure the dir exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only accepted formats
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.fieldname === 'resumePDF' || file.fieldname === 'fileAttachment' || file.fieldname === 'resume') {
            if (ext !== '.pdf') {
                return cb(new Error('Only PDF documents are allowed'));
            }
        } else if (file.fieldname === 'resourceFile') {
            const allowedResourceExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
            if (!allowedResourceExts.includes(ext)) {
                return cb(new Error('Invalid resource file type. Allowed: PDF, DOC/X, PPT/X, Images'));
            }
        } else if (file.fieldname === 'demoVideo') {
            const allowedVideoExts = ['.mp4', '.webm', '.avi'];
            if (!allowedVideoExts.includes(ext)) {
                return cb(new Error('Invalid video type. Allowed: MP4, WEBM, AVI'));
            }
        } else {
            if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
                return cb(new Error('Only standard image files are allowed'));
            }
        }
        cb(null, true);
    }
});

module.exports = { upload };
