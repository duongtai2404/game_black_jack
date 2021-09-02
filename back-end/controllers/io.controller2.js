//game store = {
//  roomId : {
//   dealer: {
//     dealerId,
//     dealerName,
//     curCards : []
//   },
//   player : [
//     {
//       playerId,
//       playerName,
//       curCards : [],
//        bet: 0
//     }
//   ],
//   cards : []
// }
//}

module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    socket.on('join-room', (roomId, playerId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.dealer.dealerId === +playerId) {
          //if dealer does not join room, join room and set joinRoomIo = true
          if (roomInfo.dealer.joinRoomIo === false) {
            roomInfo.dealer.joinRoomIo = true;
            socket.join(roomIdNumber);
          }
        } else {
          //if player does not join room, join room and set joinRoomIo = true

          const player = roomInfo.players.find((element) => {
            return element.playerId === +playerId;
          });

          if (player.joinRoomIo === false) {
            player.joinRoomIo = true;
            socket.join(roomIdNumber);
            socket.to(roomIdNumber).emit('player-connection', player);
          }
        }
      }
    });
  });
};
