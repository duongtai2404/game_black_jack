module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    socket.on('isDealer', (roomId, userId) => {
      if (gameStore.has(+roomId)) {
        const valueRoom = gameStore.get(+roomId);
        valueRoom.dealer = userId;
        console.log(gameStore);
      }
    });
  });
};
