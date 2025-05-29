import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    verifyOtp: {type:String, default:''},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetotp: {type:String, default : ''},
    resetOtpExpireAt: {type: Number, default: 0},
    profilePicture: {
        type: String, 
        default: "", 
      },
    accountCreatedOn: { type: Date, default: () => new Date("2025-01-01") },
    address:{type:String, default:""}
})

const userModel =  mongoose.models.user || mongoose.model('user',userSchema);

export default userModel;
