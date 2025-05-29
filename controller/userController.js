import userModel from "../usermodel.js";
import jwt from "jsonwebtoken"
export const getUserData = async(req,res) =>
{
  try{
       const {userId}  = req.body;
       const user  = await userModel.findById(userId);
       if(!user)return res.json({success:false, message: 'Invalid otp'});
    

        res.json({success:true,
        userData:{
            name: user.name,
            isAccountVerified: user.isAccountVerified
        }
       });
       console.log({user})

  }
  catch(error)
  {
    return res.json({success:false, message: 'Invalid otp'});

  }
}
export const getprofile = async(req,res)=>
{
  try{
    const {token}  = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.decode(token);
    const userId = decoded.id;
    const user  = await userModel.findById(userId);
    return res.json({success:true, message: 'kaam ho gaya',user});

  }
  catch(error)
  {
    return res.json({success:false, message: 'caught error'});
     
  }
}
