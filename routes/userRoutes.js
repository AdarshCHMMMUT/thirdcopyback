import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getcategory, getitems, getprofile, getUserData } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData)
userRouter.get('/profile',getprofile)
userRouter.get('/items', getitems)
userRouter.get('/category', getcategory)

export default userRouter;