import express from 'express';
const app = express.Router();
import auth from '../auth/auth.js'
import board from '../models/board.js'
import list from '../models/list.js'

app.post('/createList',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id,
			list_name
		} = req.body;
		if(!email || !board_id||!list_name){
			return res.status(400).json({
				success:false,
				message:"Email, ListID and Board ID required"
			})
		}
		const newList = await list.create({
			list_name:list_name,
			board_id:board_id
		})
		return res.status(200).json({
			success:true,
			message:"List Created Successfully",
			list_id:newList._id
		})

	}catch(err){
		console.log(err);
	}
})

app.post('/getListsOfBoard',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id,
		} = req.body;
		if(!email){
			return res.status(400).json({success:false,message:"Email required"})
		}
		if(!board_id){
			return res.status(400).json({success:false,message:"Board ID required"})
		}
		const getBoard = await board.findOne({
			_id:board_id,
			contributors:email
		});
		if(!getBoard){
			return res.status(404).json({success:false,message:"Board Not Found or You are not a contributor"})
		}
		const lists = await list.find({
			board_id:board_id
		});
		return res.status(200).json({
			success:true,
			lists:lists
		})
	}catch(err){
		console.log(err);
	}
})

app.post('/renameList',auth,async(req,res)=>{
	try{
		const {
			email,
			list_id,
			new_list_name
		} = req.body;
		if(!email || !list_id || !new_list_name){
			return res.status(400).json({success:false,message:"Email, List ID and New List Name required"})
		}
		const existingList = await list.findOne({
			_id:list_id
		});
		if(!existingList){
			return res.status(404).json({success:false,message:"List Not Found"})
		}
		existingList.list_name = new_list_name;
		await existingList.save();
		return res.status(200).json({
			success:true,

			message:"List Renamed Successfully"
		})
	}catch(err){
		console.log(err);
	}
})


export default app;