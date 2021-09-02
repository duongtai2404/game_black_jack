const host = 'http://localhost:3000'

const socket = io('/');

socket.emit('join-room', roomId, dealerId);

socket.on('player-connection', function(userId, userName){
    console.log(userId, userName);
})