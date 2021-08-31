module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const infoRoom = gameStore.get(roomIdNumber);
        if (infoRoom.dealer.id !== +userId) {
          infoRoom.player.push({ id: +userId });
          socket.to(roomIdNumber).broadcast.emit('player-connection', +userId);
        }
      }
    });
  });
};
