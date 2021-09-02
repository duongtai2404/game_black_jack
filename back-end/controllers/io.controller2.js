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

const distributeCard = (roomInfo) => {
  const { dealer, players, cards } = roomInfo;
  let cardForDealer = randomTwoCard(cards);
  dealer.curCards = cardForDealer.slice();
  players.forEach((element) => {
    let cardForPlayer = randomTwoCard(cards);
    element.curCards = cardForPlayer.slice();
  });
};

//card = [1,2,3,..,52]
const randomTwoCard = (cards) => {
  const arrayCard = [];
  for (let index = 0; index < 2; index++) {
    let index = randomNumber(cards.length);
    arrayCard.push(cards[index]);
    cards.splice(index, 1);
  }
  return arrayCard;
};

const randomNumber = (length) => {
  return Math.floor(Math.random() * length);
};

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

    socket.on('distribute-card', (roomId) => {
      const roomInfo = gameStore.get(+roomId);
      distributeCard(roomInfo);
      const { dealer, players } = roomInfo;
      io.to(+roomId).emit('receive-card-first', dealer, players);
    });
  });
};
