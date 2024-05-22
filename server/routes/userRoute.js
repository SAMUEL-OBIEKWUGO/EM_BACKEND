const express = require("express");
const { getBioProfile, followUser, unfollowUser, getSingleUser, getAllUsers, searchUsers, updateUserprofile} = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middleware/auth")

// search users
router.get("/search",searchUsers)

// single user by id
router.get("/", authMiddleware,getBioProfile);

// follow a user 14-05-2024
router.post("/follow/:followersId",authMiddleware,followUser);

// unfollow a user
router.post("/unfollow/:followerId",authMiddleware,unfollowUser);

// single user
router.get("/userprofile/:userId",getSingleUser);

// all users
router.get("/all",getAllUsers);

// update User profile 20-05-2024
router.patch('/update-profile',authMiddleware,updateUserprofile)



module.exports = router