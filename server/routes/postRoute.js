const express = require("express");
const { createPost, getTimeline, likePost, commentPost, getComments, getPostsByUser } = require("../controllers/postController")
const router = express.Router(); 
const authMiddleware = require("../middleware/auth") 

// create post
router.post('/create-post',authMiddleware,createPost);
// timeline
router.get('/timeline',authMiddleware,getTimeline);
// like a post
router.post('/like-post/:postId',authMiddleware,likePost);
// comment 
router.post('/comment-post/:postId',authMiddleware,commentPost);
// getting comment for a post
router.get("/comments/:postId",getComments) 
// getting all posts by user
router.get('/user-posts',authMiddleware,getPostsByUser)
module.exports = router;