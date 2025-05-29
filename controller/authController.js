import bcrypt from "bcryptjs";
import userModel from "../usermodel.js";
import jwt from "jsonwebtoken"
import transporter from "../config/nodemailer.js";
import fs from 'fs';
import path from 'path';
export const register = async (req, res) => {
  const { name, email, password, profilePicture, address } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: `Missing Details ${name} ${email} ${password}` })
  }
  try {
    const existingUser = await userModel.findOne({ email })

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword,profilePicture,address});
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    
    const filePath = path.resolve('config', 'welcome.html'); 
    let html = fs.readFileSync(filePath, 'utf-8');

    html = html.replace('{{name}}', name).replaceAll('{{email}}', email);
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to Instagarm',
        text: `Welcome to Instagarm. Your account has been created with email: ${email}`,
        html: html
      };
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Mail send error:", mailError.message);
    }
    res.json({ success: true, message: "User registered successfully" });

  }
  catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email' })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' })

    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite:"lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });    

    return res.json({ success: true });
  }
  catch (error) {
    return res.json({ success: false, message: error.message })
  }

}
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      path : "/"
    }

    )
    return res.json({ success: true, message: "Logged Out" })
  }
  catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

//OTP verification
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account verification opt',
      text: `Your otp is  ${otp}`,
    }
    await transporter.sendMail(mailOption);
    res.json({ success: true, message: 'Verification otp sent on Email' })
  }
  catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.body.userId;
  // const decoded = jwt.verify(token, secret);
  // const userId = decoded.userId;
  // const data = req.cookies.token;
  // console.log(req.body);
  if (!userId || !otp) {
    return res.json({ success: false, message: `Missing details${req.body}` });
  }
  try {

    const user = await userModel.findById(userId);
    console.log(user);
    if (!user) {
      return res.json({ success: false, message: 'user not found' });

    }
    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: `invalid otp ${user.VerifyOtp}` });

    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'otp expired' });

    }
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: 'Email verified successfully' });

  }
  catch (error) {
    return res.json({ success: false, message: error.message });

  }

}
//authentication
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  }
  catch (error) {
    return res.json({ success: false, message: error.message });

  }
}


// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false, message: 'Email is required'
    })
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetotp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset otp',
      text: `Your otp is  ${otp}.Verify your account using this OTP`,
    }
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: 'otp sent to your email' })
  }
  catch (error) {
    return res.json({ success: false, message: error.message });
  }
}
// reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log(email);
  console.log(otp);
  console.log(newPassword);

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'all things are required' })
  }
  try {
    const user = await userModel.findOne({ email }); 
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.resetotp === "" || user.resetotp !== otp) {
      console.log(user.resetotp);
      return res.json({ success: false, message: 'Invalid otp' });
    }
    if (user.resetOtpExpireAt < Date.now) {
      return res.json({ success: false, message: 'otp expired' });

    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetotp = '';
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: 'password has been reset successfully' });

  }
  catch (error) {
    return res.json({ success: false, message: error.message });
  }
}


