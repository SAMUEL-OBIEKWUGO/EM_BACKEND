const USER = require('../model/userModel');
const jwt = require('jsonwebtoken');
const crypto = require ("crypto");
const sendEmail = require ("../middleware/sendMail");


// registration
const registration = async(req,res)=>{
    try {
      const {userName,email,password,confirmPassword} = req.body;
      if(!userName || !email || !password || !confirmPassword){
        res.status(400).json({success:false,message:"all fields are required to register..."})
        return;
      };
      if(password !== confirmPassword){
        res.status(400).json({success:false,message:"password and confirm password must match"});
        return;
    }

    // for email
    const existingEmail = await USER.findOne({email});
        if(existingEmail){
            res.status(400).json({success:false,message:"Email already in use"});
            return
        };
        
        const existingUserName = await USER.findOne({userName});
        if(existingUserName){
            res.status(400).json({success:false,message:"Username already in use"});
            return
        };

    const user = await USER.create({...req.body});
    res.status(201).json({success:true,message:"registration successful",user})
    } catch (error) {
        // if(error.code === 11000){
        //     res.status(403).json({success:false,message:"Email or username already in use"})
        //     return;
        // }
        console.log(error.message);
        res.status(500).json(error.message)
    }
}

// login
const login = async(req,res)=>{
  try {
    const {email,password}= req.body;
    if(!email || !password){
      res.status(400).json({success:false,message:"all fields are required to login"});
      return;
    }
    // finding a registered email address
    const user = await USER.findOne({email});
    if (!user){
      res.status(404).json({success:false,message:"wrong credentials"});
      return;
    } 

    //comparing password and validating password
    const auth = await user.comparePassword(password);
    if (!auth) {
      res.status(404).json({success:false,message:"wrong credentials"});
      return;
    } 

    // generating token
    const token = await user.generateToken();
    console.log(token);
    if (token) {
      res.status(201).json({success:true,message:"logged in",user:{userName:user.userName,email:user.email,token}})
      
    }


  } catch (error) {
    console.log(error.message);
    res.status(500).json(error.message)
  }
}

// to get username to update on website
const getUserName = async(req,res)=>{
  const {userId} = req.user;
  const user = await USER.findOne({_id:userId});
  res.status(200).json({success:true,userName:user.userName})
}

// isLoggedin function
const isLoggedIn = (req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    if(!token){
      res.json(false);
      return;
    }
    jwt.verify(token,process.env.JWT_SECRET);
    res.json(true);

  } catch (error) {
    console.log(error.message);
    res.json(false)
  }
}

// forgot password ftn
const forgotPassword = async (req, res,next) => {
  const { email } = req.body;
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "email not found" });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `http://localhost:5173/resetpasswordlink/${resetToken}`;
    const message = `<h1>You have requested for a password reset </h1> <p>Please go to this link to reset your password</p> <a href=${resetUrl} clicktracking = off> ${resetUrl} </a> `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });
      res.status(200).json({success:true,data:"Email sent"})
    } catch (error) {
      user.getResetPasswordToken = undefined;
      user.getResetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email couldnt be sent", error });
    }
  } catch (error) {
    res.json(error.message);
  }
};


// reset password ftn
const resetPassword = async (req,res)=>{
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
  try {
    const user = await USER.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt:Date.now()}
      // resetPasswordExpire:{$gt:Date('2024-12-20')}

    })
    if(!user){
      return res.status(400).json({status:false,message:"invalid Reset Token"})
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(201).json({success:true,message:"Password Reset Successfull"})
    
  } catch (error) {
    res.status(500).json(error.message)
    } 
  }



module.exports = {registration,login,getUserName,isLoggedIn,resetPassword,forgotPassword}