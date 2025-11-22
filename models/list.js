import mongoose from 'mongoose'
const listDetails = new mongoose.Schema({
	board_id : {
		type : String,
		required : true,
	},
	list_name : {
		type : String,
		required : true,
	}
})
const list =  mongoose.model('list',listDetails)

export default list