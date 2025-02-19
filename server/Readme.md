# FlickHive

## Overview

FlickHive is a backend service for a video sharing platform. It provides APIs for user authentication, video uploads, comments, likes, subscriptions, playlists, and more.

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/flickhive.git
   cd flickhive
   ```
2. Install dependencies:
   `sh npm install`
3. Create a .env file and add your environment variables:
   `sh touch .env`
4. Start the server:
   `sh npm run dev`

## Environment Variables

Create a .env file in the root directory and add the following environment variables:

```sh
PORT=8000
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=your_cors_origin
```

## Project Structure

```sh
.env
.gitignore
.prettierignore
.prettierrc
package.json
public/
temp/
.gitkeep
Readme.md
src/
app.js
constants.js
controllers/
comment.controller.js
dashboard.controller.js
healthCheck.controller.js
like.controller.js
playlist.controller.js
subscription.controller.js
tweet.controller.js
user.controller.js
video.controller.js
db/
index.js
index.js
middlewares/
auth.middleware.js
multer.middleware.js
models/
comment.model.js
like.model.js
playlist.model.js
subscription.model.js
tweet.model.js
user.model.js
video.model.js
routes/
comment.routes.js
dashboard.routes.js
healthCheck.routes.js
like.routes.js
playlist.routes.js
subscription.routes.js
tweet.routes.js
user.routes.js
video.routes.js
utils/
ApiError.js
ApiResponse.js
asyncHandler.js
cloudinary.js
```

## API Endpoints

### User Routes

- POST `sh/api/v1/users/register` : Register a new user
- POST `sh/api/v1/users/login` : Login a user
- GET `sh/api/v1/users/refresh-token` : Refresh access token
- GET `sh/api/v1/users/logout` : Logout a user
- PATCH `sh/api/v1/users/change-password` : Change user password
- GET `sh/api/v1/users/curr-user` : Get current user information
- PATCH `sh/api/v1/users/update-account-details` : Update account details
- PATCH `sh/api/v1/users/update-avatar` : Update user avatar
- PATCH `sh/api/v1/users/update-cover-image` : Update cover image
- GET `sh/api/v1/users/c/:username` : Get user channel profile
- GET `sh/api/v1/users/watch-history` : Get user watch history

### Video Routes

- GET `sh/api/v1/videos` : Get all videos
- POST `sh/api/v1/videos` : Publish a video
- GET `sh/api/v1/videos/:videoId` : Get video by ID
- DELETE `sh/api/v1/videos/:videoId` : Delete a video
- PATCH `sh/api/v1/videos/:videoId` : Update a video
- PATCH `sh/api/v1/videos/toggle/publish/:videoId` : Toggle video publish status

### Comment Routes

- GET `sh/api/v1/comments/:videoId` : Get comments for a video
- POST `sh/api/v1/comments/:videoId` : Add a comment to a video
- DELETE `sh/api/v1/comments/c/:commentId` : Delete a comment
- PATCH `sh/api/v1/comments/c/:commentId` : Update a comment

### Like Routes

- POST `sh/api/v1/likes/toggle/v/:videoId` : Toggle like on a video
- POST `sh/api/v1/likes/toggle/c/:commentId` : Toggle like on a comment
- POST `sh/api/v1/likes/toggle/t/:tweetId` : Toggle like on a tweet
- GET `sh/api/v1/likes/videos` : Get all liked videos of the user

### Playlist Routes

- POST `sh/api/v1/playlist` : Create a new playlist
- GET `sh/api/v1/playlist/:playlistId` : Get a playlist by its ID
- PATCH `sh/api/v1/playlist/:playlistId` : Update a playlist
- DELETE `sh/api/v1/playlist/:playlistId` : Delete a playlist
- PATCH `sh/api/v1/playlist/add/:videoId/:playlistId` : Add a video to a playlist
- PATCH `sh/api/v1/playlist/remove/:videoId/:playlistId` : Remove a video from a playlist
- GET `sh/api/v1/playlist/user/:userId` : Get all playlists of a user

### Subscription Routes

- POST `sh/api/v1/subscriptions/c/:channelId` : Toggle subscription to a channel
- GET `sh/api/v1/subscriptions/c/:subscriberId` : Get the list of channels to which a user has subscribed
- GET `sh/api/v1/subscriptions/u/:channelId` : Get the subscriber list of a channel

### Tweet Routes

- POST `sh/api/v1/tweets` : Create a new tweet
- GET `sh/api/v1/tweets/user/:userId` : Get all tweets of the authenticated user
- PATCH `sh/api/v1/tweets/:tweetId` : Update a tweet
- DELETE `sh/api/v1/tweets/:tweetId` : Delete a tweet

### Dashboard Routes

- GET `sh/api/v1/dashboard/stats` : Get channel stats
- GET `sh/api/v1/dashboard/videos` : Get all videos uploaded by the channel

### Health Check Route

- GET `sh/api/v1/healthCheck` : Check if the service is up and running
