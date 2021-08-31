module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    console.log('conect', socket);
    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const infoRoom = gameStore.get(roomIdNumber);
        var userInfo = infoRoom.player.find(function(val){
          return val.id == userId;
        })
        socket.to(roomIdNumber).emit('player-connection', +userId, userInfo.name);
      }
    });
  });
};
