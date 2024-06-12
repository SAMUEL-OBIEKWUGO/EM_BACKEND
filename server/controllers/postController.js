const POST = require("../model/postModel");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const USER = require("../model/userModel");

// 23rd/05/2024
// creating functions for post

const createPost = async (req, res) => {
  const { text } = req.body;
  const image = req.files ? req.files.imagePath : null;
  req.body.user = req.user.userId; 

  if (!text && !image) {
    res
      .status(400)
      .json({
        success: false,
        message: "You must provide either text or image",
      });
    return;
  }
  try {
    let imagePath = null;
    if (image) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "EM_posts",
      });
      console.log("cloudinary upload successful", result);
      if (result && result.secure_url) {
        imagePath = result.secure_url;
        console.log("url for img:", imagePath);

        // remove the uploaded file from the server
        fs.unlinkSync(image.tempFilePath);
      } else {
        console.log("cloudinary upload failed");
        res
          .status(500)
          .json({ success: false, message: "failed to upload image" });
        return;
      }
    }
    const post = new POST({ text, imagePath, user: req.user.userId });
    await post.save();
    res
      .status(201)
      .json({ success: true, message: "post created successfully", post });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getTimeline = async (req,res)=>{
  const {userId} = req.user
  try {
    const user = await USER.findById(userId).populate("following");
    const followingIds = user.following.map((fIdx)=>fIdx._id);
    followingIds.push(userId);

    const posts = await POST.find({user:{$in:followingIds}}).populate({path:"user",select:'userName profilePhoto'}).populate("comments.user","userName").sort({createdAt:-1});

    // add comment count to each post
    const postsWithCommentsCount = posts.map(post =>({
      ...post.toObject(),
      commentCount: post.comments.length
    }));
    res.status(200).json({success:true, message:"timeline post", posts:postsWithCommentsCount})
  } catch (error) {
    res.status(500).json(error.message) 
  }
}

const likePost = async(req,res)=>{
  const {userId} = req.user
  try {
    const post = await POST.findById(req.params.postId);
    if(!post){
      return res.status(404).json({error:"Post not found"});
    }
    if(post.likes.includes(userId)){
      post.likes.pull(userId);
      await post.save();
      return res.status(200).json({success:true, message:"post unliked successful.",post});
    }else{
      post.likes.push(userId);
      await post.save();
      returnres.status(200).json({success:true, message:"post liked successfully.",post});
    }
  } catch (error) {
    res.status(500).json({success:false, message:"Failed to like/unlike post ."})
  } 
}

const commentPost = async(req,res)=>{
  const {userId} = req.user;
  const {text} = req.body;
  try {
    const post = await POST.findById(req.params.postId);
    if(!post){
      return res.status(404).json({success:false, message:"Post not found"});
    }
    if(!text){
      return res.status(400).json({success:false, message:'comment box can not be empty'});
    }
    const comment = {user:userId, text: req.body.text};
    post.comments.push(comment);

    await post.save();
    res,status(201).json({success:true, message:'comment added successfully', post})
  } catch (error) {
    res.status(500).json(err.message)
  }
} 

// get comments for a post
const getComments = async(req,res)=>{
  try {
    const post = await POST.findById(req.params.postId).populate('comments.user', 'userName profilePhoto');
    if (!post) {
      return res.status(404).json({ success:false,message: 'Post not found.' });
    }

    res.status(200).json({success:true,comments:post.comments});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.'});
  }
} 

// get all posts by a user
const getPostsByUser = async(req,res)=>{
  const {userId} = req.user

  try {
    const post = await POST.find({user:userId}).populate({path:"user",select:"-password"});
    res.status(200).json({success:true,message:"users post",post})
  } catch (error) {
    res.status(500).json(error.message)
  }
} 

module.exports = {
  createPost,
  getTimeline,
  likePost,
  commentPost,
  getComments,
  getPostsByUser
}; 
