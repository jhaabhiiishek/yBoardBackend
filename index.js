import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import { Server } from 'socket.io';
import { createServer } from 'http';

import loginRoute from './routes/login.js'
import boardRoute from './routes/board.js'
import listRoute from './routes/list.js'
import card from './routes/card.js'

const app = express();

app.use(express.json())
app.use(cors({
	origin:"http://localhost:5173",
	credentials:true
}))
app.use(cookieParser());

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true
	}
});

const port = process.env.PORT||3000
io.on('connection',(socket)=>{
	socket.on('join_board',(board_id)=>{
		socket.join(board_id);
		io.to(board_id).emit('active_members', io.sockets.adapter.rooms.get(board_id).size-1);
		console.log('User joined board: '+board_id);
	})
	socket.on('close_board',(board_id)=>{
		socket.leave(board_id);
		console.log('User left board: '+board_id);
	})
	socket.on('send_update',(data)=>{
		console.log('Update received for board: '+data._id);
		socket.to(data._id).emit('receive_update',data);
	})
	socket.on('send_card_update',(data)=>{
		console.log('Card Update received for board: '+data.board_id);
		socket.to(data.board_id).emit('receive_card_update',data);
	})
	socket.on('card_create',(data)=>{
		console.log('Card Created in board: '+data.board_id);
		socket.to(data.board_id).emit('card_created',data.card);
	})
	socket.on('list_create',(data)=>{
		console.log('List Created in board: '+data.board);
		socket.to(data.board).emit('list_created',data);
	})
	socket.on('listNameUpdate',(data)=>{
		console.log('List Name Update in board: '+data.board_id);
		socket.to(data.board_id).emit('listNameUpdated',data);
	})
	socket.on('disconnect',()=>{
		console.log('user disconnected: '+socket.id);
	})
})



const DB = process.env.MONGOCOMMAND
mongoose.connect(DB, {
	useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() =>{
	console.log('Database connected..')
})

app.use(loginRoute)
app.use(boardRoute)
app.use(listRoute)
app.use(card)



app.get('/',(req,res)=>{
	res.send("App is running")
})

server.listen(port,()=>{
	console.log(`Server is running on port ${port}`)
})