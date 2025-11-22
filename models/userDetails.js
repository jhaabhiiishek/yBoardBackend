import mongoose from 'mongoose'
const userDetails = new mongoose.Schema({
    email : {
		type : String,
        required : true,
    },
	password :{
		type: String,
		required: true
	},
})
const user =  mongoose.model('user',userDetails)

export default user