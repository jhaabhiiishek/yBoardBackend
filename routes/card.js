import express from 'express'
const app = express.Router();
import auth from '../auth/auth.js'
import card from '../models/card.js'
import board from '../models/board.js'

app.post('/createCard',auth,async(req,res)=>{
	try{
		const {
			email,
			card_name,
			board_id,
			description,
			list_id,
			type
		} = req.body;

		console.log(email,
			card_name,
			board_id,
			description,
			list_id,
			type)

		if(!email || !board_id||!card_name||!list_id){
			return res.status(400).json({
				success:false,
				message:"Email and Board ID required"
			})
		}
		
		const newCard = await card.create({
			card_name:card_name,
			created_by:email,
			contributors:[email],
			board_id:board_id,
			description:description,
			list_id:list_id,
			isCompleted:false,
			activity:['Card Created by - '+email+' at - '+new Date().toISOString()],
			type:type,
			created_at:new Date(),
			updated_at:new Date(),
		})

		if(newCard==null){
			return res.status(500).json({
				success:false,
				message:"Internal Server Error"
			})
		}

		return res.status(200).json({
			success:true,
			message:"Card Created Successfully",
			card_id:newCard._id,
		})

	}catch(err){
		console.log(err);
	}
})

app.post('/getCardsOfBoard',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id
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
		const cards = await card.find({
			board_id:board_id
		});
		return res.status(200).json({
			success:true,
			cards:cards
		})
	}catch(err){
		console.log(err);
	}
})

app.post('/getCard',auth,async(req,res)=>{
	try{
		const {
			email,
			card_id
		} = req.body;
		if(!email || !card_id){
			return res.status(400).json({success:false,message:"Email and Card ID required"})
		}
		const existingCard = await card.findOne({
			_id:card_id,
			contributors:email
		});
		if(!existingCard){
			return res.status(404).json({success:false,message:"Card Not Found or You are not a contributor"})
		}
		return res.status(200).json({
			success:true,
			card:existingCard
		})
	}catch(err){
		console.log(err);
	}
});

app.post('/updateCard',auth,async(req,res)=>{
	try{
		const {
			email,
			card_id,
			new_card_name,
			new_description,
			new_list_id,
			new_isCompleted,
			new_type
		} = req.body;
		if(!email || !card_id){
			return res.status(400).json({success:false,message:"Email and Card ID required"})
		}

		const existingCard = await card.findOne({
			_id:card_id
		});

		if(!existingCard){
			return res.status(404).json({success:false,message:"Card Not Found"})
		}
		const update = await card.updateOne({
			_id:card_id
		},{
			card_name:new_card_name?new_card_name:existingCard.card_name,
			description:new_description?new_description:existingCard.description,
			list_id:new_list_id?new_list_id:existingCard.list_id,
			isCompleted:new_isCompleted!==undefined?new_isCompleted:existingCard.isCompleted,
			type:new_type?new_type:existingCard.type,
			updated_at:new Date(),
			$push:{
				activity:'Card Updated by - '+email+' at - '+new Date().toISOString()
			}
		})
		const newCard = await card.findOne({_id:card_id});
		if(update.modifiedCount==0){
			return res.status(409).json({
				success:false,
				message:"Error in Updating Card"
			})
		}
		return res.status(200).json({
			success:true,
			message:"Card Updated Successfully",
			card:newCard
		});

	}catch(err){
		console.log(err);
	}
});

export default app;