import mongoose from 'mongoose'
const cardDetails = new mongoose.Schema({
	card_name : {
		type : String,
		required : true,
	},
	description : {
		type : String,
		required : false,
	},
	created_by : {
		type : String,
		required : true,
	},
	isCompleted : {
		type : Boolean,
		required : true,
		default : false
	},
	list_id : {
		type : String,
		required : true,
	},
	board_id : {
		type : String,
		required : true,
	},
	activity:{
		// user - update - time
		type: [String],
		required: true,
	},
	type:{
		type : String,
		required : true,
	},
	created_at : {
		type : Date,
		required : true,
	},
	updated_at : {
		type : Date,
		required : true,
	}
})
const card =  mongoose.model('card',cardDetails)

export default card