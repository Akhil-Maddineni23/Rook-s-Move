const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = "http://127.0.0.1:5500"
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === CORS_ORIGIN || origin.startsWith(CORS_ORIGIN)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

//Middlewares
app.use(express.json());
app.use(cors(corsOptions));

const io = socketIO(server, {
  cors: corsOptions,
});

// Store room information
const rooms = {};

io.on('connection', (socket) => {
    console.log('A Player connected');

    // Listen for 'joinRoom' event 
    socket.on('joinRoom', (data) => {
        const { roomID } = data;

        // Check if the room is full (2 players)
        if (rooms[roomID] && rooms[roomID].length >= 2) {
            console.log(`Room ${roomID} is full. Cannot join.`); 
        }else{
          console.log('Room is full');
        }

        socket.join(roomID);

        // Initialize the room if it doesn't exist
        if (!rooms[roomID]) {
            rooms[roomID] = [];
        }

        // Add the player to the room
        rooms[roomID].push(socket.id);
        console.log(`Player ${socket.id} joined room ${roomID}`);

        if(rooms[roomID].length == 2){
            // Emit 'opponentStatus' to all clients in the room
            io.to(roomID).emit('opponentStatus', { status: 'online' });
        }
    });

    socket.on('playerMove', (data) => {
      // Broadcast the move to all players in the room except the sender
      socket.to(data.roomID).emit('playerMove', data);
    });
    

    socket.on('gameOver', (data) => {
      const { roomID , targetReached} = data;
      // Emit game result to all members in the room
      io.to(roomID).emit('gameResult', {
        senderSocketID: socket.id, 
        targetReached
      });
    });
    
    socket.on('disconnect', () => {
        console.log('Player disconnected');
        // Remove the user from the room when they disconnect
        Object.keys(rooms).forEach((roomID) => {
            rooms[roomID] = rooms[roomID].filter((id) => id !== socket.id);
            if (rooms[roomID].length === 0) {
                // Delete the room if it becomes empty
                delete rooms[roomID];
            }
        });
    });
});


server.listen(3000, () => {
  console.log("Server is running on Port = 3000");
});
