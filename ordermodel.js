import mongoose from "mongoose";

const orderschema = new mongoose.Schema(
    {
     name: {type:String, required:true, unique:true},
    }
)
export default orderschema;