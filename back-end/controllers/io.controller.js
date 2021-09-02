module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    console.log('conect', socket);
    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const infoRoom = gameStore.get(roomIdNumber);
        socket.to(roomIdNumber).emit('player-connection', +userId);
      }
    });

    socket.on('bet', (roomId, userId, betVal)=>{
      const roomIdNumber = +roomId;

      if (gameStore.has(roomId)){
        const room = gameStore.get(roomId)
        if (room.players.has(userId)){
          console.log("alo")
        }
      }
    })
  });


};
