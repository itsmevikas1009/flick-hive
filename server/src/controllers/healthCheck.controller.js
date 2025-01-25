// Import necessary utilities
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to perform a health check
const healthCheck = asyncHandler(async (req, res) => {
    // Return a successful response with status 200 and message 'OK'
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                'OK'
            )
        );
});

// Export the healthCheck function
export { healthCheck };