import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getcategory, getitems, getOrders, getprofile, getUserData, payment } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData)
userRouter.post('/profile',getprofile)
userRouter.get('/items', getitems)
userRouter.get('/category', getcategory)
userRouter.post('/payment',payment)
userRouter.post('/getorders', getOrders)

export default userRouter;