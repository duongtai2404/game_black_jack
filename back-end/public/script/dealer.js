localStorage.setItem(dealerId, dealerId);
const socket = io('/');

socket.emit('join-room', roomId, dealerId);
