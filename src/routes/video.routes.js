// Import necessary modules and utilities
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js";

// Create a new router instance
const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Define a route to handle video uploads
// The route uses the verifyJWT middleware to ensure the user is authenticated
// The route uses the upload middleware to handle file uploads
router
    .route("/")
    .get(getAllVideos)
    .post(
        // Middleware to handle file uploads for avatar and cover image
        upload.fields([
            {
                name: 'videoFile',
                maxCount: 1
            },
            {
                name: 'thumbnail',
                maxCount: 1
            }
        ]),
        publishAVideo
    );


router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

// Export the router
export default router;