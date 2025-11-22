import express from 'express'
import auth from '../auth/auth.js'
import board from '../models/board.js'
import nodemailer from'nodemailer';
import { analyzeCard } from '../service/recommendationService.js';
import card from '../models/card.js';
const app = express.Router();
app.post('/createBoard',auth,async(req,res)=>{
	try{
		const {
			email,
			board_name
		} = req.body;
		if(!email || !board_name){
			return res.status(400).json({
				success:false,
				message:"Email and Board Name required"
			})
		}
		const newBoard = await board.create({
			board_name:board_name,
			created_by:email,
			created_at:new Date(),
			updated_at:new Date(),
			contributors:[email]
		})

		if(newBoard==null){
			return res.status(500).json({
				success:false,
				message:"Internal Server Error"
			})
		}

		return res.status(200).json({
			success:true,
			message:"Board Created Successfully",
			board:newBoard
		})

	}catch(err){
		console.log(err);
	}
})

app.post('/getBoards',auth,async(req,res)=>{
	try{
		const {email} = req.body;
		if(!email){
			return res.status(400).json({success:false,message:"Email required"})
		}
		const boards = await board.find({
			contributors:email
		});
		return res.status(200).json({
			success:true,
			boards:boards
		})
	}catch(err){

		console.log(err);
	}
})
app.post('/deleteBoards',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id
		} = req.body;

		if(!email || !board_id){
			return res.status(400).json({success:false,message:"Email and Board ID required"})
		}
		const existingBoard = await board.findOne({
			_id:board_id,
			created_by:email
		});
		if(!existingBoard){
			return res.status(404).json({success:false,message:"Board Not Found or You are not authorized to delete this board"})
		}

		const delBoard = await board.deleteOne({
			_id:board_id,
			created_by:email
		});
		if(delBoard.deletedCount==0){
			return res.status(404).json({success:false,message:"Board Not Found or You are not authorized to delete this board"})
		}
		return res.status(200).json({
			success:true,
			message:"Board Deleted Successfully"
		})
	}catch(err){
		console.log(err);
	}
})

app.post('/renameBoard',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id,
			new_board_name
		} = req.body;
		if(!email || !board_id || !new_board_name){
			return res.status(400).json({success:false,message:"Email, Board ID and New Board Name required"})
		}
		const existingBoard = await board.findOne({
			_id:board_id,
			contributors:email
		});
		if(!existingBoard){
			return res.status(404).json({success:false,message:"Board Not Found or You are not authorized to rename this board"})
		}
		existingBoard.board_name = new_board_name;
		existingBoard.updated_at = new Date();
		await existingBoard.save();
		return res.status(200).json({
			success:true,
			message:"Board Renamed Successfully",
			board:existingBoard
		})
	}catch(err){
		console.log(err);
	}
})

app.post('/addContributor',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id,
			contributor_email
		} = req.body;
		if(!email || !board_id || !contributor_email){
			return res.status(400).json({success:false,message:"Email, Board ID and Contributor Email required"})

		}
		const existingBoard = await board.findOne({
			_id:board_id,
			contributors:email
		});
		if(!existingBoard){
			return res.status(404).json({success:false,message:"Board Not Found or You are not authorized to add contributors to this board"})
		}
		if(existingBoard.contributors.includes(contributor_email)){
			return res.status(409).json({success:false,message:"Contributor already added to this board"})
		}
		
		existingBoard.contributors.push(contributor_email);
		existingBoard.updated_at = new Date();
		await existingBoard.save();
		return res.status(200).json({
			success:true,
			message:"Contributor Added & Mail Sent Successfully"
		})
	}catch(err){
		console.log(err);
	}
})

app.post('/getRecommendations',auth,async(req,res)=>{
	try{
		const {
			email,
			board_id,
			card_id
		} = req.body;
		if(!email || !board_id || !card_id){
			return res.status(400).json({success:false,message:"Email, Board ID and Card ID required"})
		}
		const existingBoard = await board.findOne({

			_id:board_id,
			contributors:email
		});
		if(!existingBoard){
			return res.status(404).json({success:false,message:"Board Not Found or You are not a contributor"})
		}
		
		const cards = await card.findOne({
			_id:card_id,
			board_id:board_id
		});
		if(!cards){
			return res.status(404).json({success:false,message:"Card Not Found in this board"})
		}
		const allBoardCards = await card.find({
			board_id:board_id
		});
		const analysis = analyzeCard(cards, allBoardCards);
		return res.status(200).json({
			success:true,
			recommendations:analysis.suggestions,
			relatedCards:analysis.relatedCards
		})
	}catch(err){
		console.log(err);
	}
})


export default app;