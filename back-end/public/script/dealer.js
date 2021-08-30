const userId = Math.floor(1000 + Math.random() * 9000);
localStorage.setItem(userId, userId);
const socket = io('/');

socket.emit('isDealer', roomId, userId);
