require('dotenv/config')
const express = require("express");
const app = express();
const port = 5320 || process.env.PORT;
const connect = require('./config/DB');
const authRoute = require('./routes/authRoutes');
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
const fileUpload = require("express-fileupload");


// custom middlewares
// fileupload 20-05-2024
app.use(fileUpload({useTempFiles: true }));

app.use(express.json());
app.use(cors());

// API's 
app.use('/api/v1/auth',authRoute);
app.use('/api/v1/users',userRoute);
app.use('/api/v1/post',postRoute);

// Cloudinary 20-05-2024
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });


// server and DB connection
connect()
.then(()=>{
try{
    app.listen(port,"localhost",()=>{
        console.log(`Em-Server is connected to http://localhost:${port}`);
    })
}catch(error){
    console.log("cannot connect to EM server");
}
})
.catch((error)=>{
    console.log("invalid database connection...",error);
})


// Route
app.get('/',(req,res)=>{
   res.status(200).json({success:true,message:"EM server is live"})
})

app.use((req,res)=>{
    res.status(404).json({success:false,message:"Route doesn't exist"})
})
