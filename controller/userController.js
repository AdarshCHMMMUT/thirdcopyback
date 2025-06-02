 
import itemmodel from "../models/itemmodel.js";
import jwt from "jsonwebtoken"
import Category from "../models/categorymodel.js";
import {v4 as uuidv4} from 'uuid';
import Stripe from 'stripe';
import User from "../models/usermodel.js";
import Order from "../models/ordermodel.js";
// const stripe = new Stripe('');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    const user  = await User.findById(userId);
    return res.json({success:true, message: 'kaam ho gaya',user});

  }
  catch(error)
  {
    return res.json({success:false, message: 'caught error', error: error.message});
     
  }
}

export const getitems = async(req,res)=>
{
  try{
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit);
      const skip = (page - 1) * limit;
      const items = await itemmodel.find().skip(skip).limit(limit).sort({createdAt: 1});
      const totalItems = await itemmodel.countDocuments();
      if(!items)return res.json({success:false, message: 'No items found'});
      return res.json({success:true,items, currentPage: page, totalPages: Math.ceil(totalItems / limit)});
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
 

export const payment = async (req, res) => {
  const { product, token, userId } = req.body;
  const idempotencyKey = uuidv4();

  try {
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const charge = await stripe.charges.create({
      amount: product.price * 100,
      currency: 'usd',
      customer: customer.id,
      receipt_email: token.email,
      description: `Purchase of ${product.name}`,
      shipping: {
        name: token.card.name,
        address: {
          country: token.card.address_country,
        },
      },
    }, { idempotencyKey });

    const order = new Order({
      user: userId,
      product: {
        name: product.name,
        price: product.price,
        quantity: product.quantity || 1, // default to 1 if not sent
      },
      amount: charge.amount / 100, // convert cents to dollars
      currency: charge.currency,
      paymentId: charge.id,
      receiptEmail: charge.receipt_email,
      shipping: {
        name: charge.shipping.name,
        country: charge.shipping.address.country,
      },
      status: charge.status,
    });

    await order.save();

    res.status(200).json({ charge, message: "Payment successful and order stored." });
  } catch (err) {
    console.error("Payment error: ", err);
    res.status(500).json({ error: "Payment failed." ,message: err.message });
  }
};



export const getOrders = async (req, res) => {
  const { userId } = req.body;
  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders.", error: error.message });
  }
};
