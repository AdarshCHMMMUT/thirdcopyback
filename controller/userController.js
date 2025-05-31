import User from "../models/usermodel.js";
import itemmodel from "../models/itemmodel.js";
import jwt from "jsonwebtoken"
import Category from "../models/categorymodel.js";
export const getUserData = async(req,res) =>
{
  try{
       const {userId}  = req.body;
       const user  = await User.findById(userId);
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

export const getitems = async(req,res)=>
{
  try{
      const items = await itemmodel.find();
      if(!items)return res.json({success:false, message: 'No items found'});
      return res.json({success:true, message: 'Items fetched successfully', item: items});
  }
  catch(error)
  {
    return res.json({success:false, message: error.message});
     
  }
}

export const getcategory = async(req,res)=>
{
  try{
      
    
      const categories = await Category.find();
       if(!categories)return res.json({success:false, message: 'No categories found'});
      return res.json({success:true, message: 'Categories fetched successfully', categories});
  }
  catch(error)
  {
    return res.json({success:false, message: error.message});
     
  }
}
