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
//       curCards : []
//     }
//   ],
//   cards : []
// }
//}

const distributeCard = (infoRoom) => {
  const { dealer, player, cards } = infoRoom;
  let cardForDealer = randomTwoCard(cards);
  dealer.curCards = cardForDealer.slice();
  player.forEach((element) => {
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

const plugOutAndAddCardInCurCard = (curCardUser, cards) => {
  const index = randomNumber(cards.length);
  curCardUser.push(cards[index]);
  cards.splice(index, 1);
  return curCardUser;
};

module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    console.log('connect', socket);
    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const roomInfo = gameStore.get(roomIdNumber);
        var userInfo = roomInfo.player.find((player) => {
          return player.id == userId;
        });
        socket.to(roomIdNumber).emit('player-connection', userInfo);
      }
    });

    socket.on('distribute-card', (roomId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        distributeCard(roomInfo);
        const data = {
          dealer: roomInfo.dealer,
          player: roomInfo.player,
        };

        io.to(roomIdNumber).emit('distribute-card-for-all', data);
      }
    });

    socket.on('plug-out-card', (roomId, userId) => {
      const roomIdNumber = +roomId;
      if (gameStore.has(roomIdNumber)) {
        const { dealer, player, cards } = gameStore.get(roomIdNumber);
        let curCards = null;
        let isDealer = false;
        if (dealer.dealerId == userId) {
          isDealer = true;
          curCards = plugOutAndAddCardInCurCard(dealer.curCards, cards);
        } else {
          const playerElement = player.find((element) => {
            return element.playerId == userId;
          });
          curCards = plugOutAndAddCardInCurCard(playerElement.curCards, cards);
        }

        const data = {
          userId,
          isDealer,
          curCards,
        };

        io.to(roomIdNumber).emit('plug-in-card-for-special-user', data);
      }
    });
  });
};
