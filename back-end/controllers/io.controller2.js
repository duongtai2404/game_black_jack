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
        socket.join(roomIdNumber);

        if (roomInfo.dealer.dealerId === +playerId) {
          //if dealer does not join room, join room and set joinRoomIo = true
          roomInfo.dealer.joinRoomIo = true;
        } else {
          //if player does not join room, join room and set joinRoomIo = true

          const player = roomInfo.players.find((element) => {
            return element.playerId === +playerId;
          });
          player.joinRoomIo = true;
          socket.to(roomIdNumber).emit('player-connection', player);
        }
      }
    });

    socket.on('open-bet', (roomId) => {
      socket.to(+roomId).emit('allow-bet');
    });

    socket.on('bet', (roomId, playerId, bet) => {
      socket.to(+roomId).emit('player-bet', playerId, bet);
      const players = gameStore.get(+roomId).players;
      const player = players.find((element) => {
        return element.playerId === +playerId;
      });
      player.bet = +bet;
    });
  });
};
