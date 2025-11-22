import mongoose from 'mongoose'
const boardDetails = new mongoose.Schema({
	board_name : {
		type : String,
		required : true,
	},
	created_by : {
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
	},
	contributors:{
		type: [String],
		required: true,
	}
})
const board =  mongoose.model('board',boardDetails)

export default board