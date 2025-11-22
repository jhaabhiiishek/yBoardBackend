import express from 'express'
import user from '../models/userDetails.js'
import jwt from 'jsonwebtoken'
const app = express.Router()

app.post('/login',async(req,res)=>{
	try{
		const {email,password} = req.body;
		if(!email || !password){
			return res.status(400).json({success:false,message:"Email and Password required"})
		}
		const existingUser = await user.findOne({
			email:email,
			password:password
		});
		if(existingUser){
			var user_token = jwt.sign({
				"email":existingUser.email
			},process.env.TOKEN_KEY,{
				expiresIn:"7d"
			})
			res.cookie("user_token",user_token,{
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite:"lax",
				secure:false,
				// httpOnly:true
			})
			return res.status(200).json({
				success:true,
				message:"Login Successful",
				email:email
			})
		}else{
			return res.status(204).json({
				success:false,
				message:"Invalid Credentials",
			})
		}
	}catch(err){
		console.log(err);
	}
})
app.post('/signup',async(req,res)=>{
	try{
		const {email,password} = req.body;

		if(!email || !password){
			return res.status(400).json({success:false,message:"Email and Password required"})
		}

		const existingUser = await user.findOne({
			email:email
		});
		console.log('user exists',existingUser);
		if(existingUser){
			return res.status(409).json({success:false,message:"User Already Exists"})
		}
		console.log('Creating User');

		const newUser = await user.create({
			email:email,
			password:password
		})
		
		if(newUser){
			return res.status(200).json({success:true,message:"User Signed Up Successfully"})
		}else{
			return res.status(500).json({success:false,message:"Error in Signing Up"})
		}
	}catch(err){
		console.log(err);
	}
})

export default app;