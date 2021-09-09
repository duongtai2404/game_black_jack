const aceList = [1, 14, 27, 40];

const cardValue = function (card) {
  var val = 0;
  if (card < 14) {
    val = card % 14;
  } else if (card < 27) {
    val = (card - 13) % 14;
  } else if (card < 40) {
    val = (card - 26) % 14;
  } else if (card <= 52) {
    val = (card - 39) % 14;
  }

  if (val > 10) {
    return 10;
  }
  console.log('val card', card, val);
  return val;
};

const cardsValue = function (cards) {
  var aceNum = 0;
  var sumVal = cards.reduce(function (sum, card) {
    var cardVal = cardValue(card);
    if (aceList.indexOf(card) != -1) {
      aceNum += 1;
    }
    return cardVal + sum;
  }, 0);
  console.log(cards, sumVal);
  for (var i = 0; i < aceNum; i++) {
    if (sumVal + 10 <= 21) {
      sumVal += 10;
    } else if (sumVal + 9 <= 21) {
      sumVal += 9;
    } else {
      break;
    }
  }

  return sumVal;
};

const checkBlackJack = function (cards) {
  var aces = cards.filter(function (val) {
    return aceList.indexOf(val) != -1;
  });
  console.log('check ace', aces);
  if (aces.length > 0) {
    var ten = cards.filter(function (val) {
      return cardValue(val) == 10;
    });
    console.log('check ten', ten);
    if (ten.length > 0) {
      return true;
    }
  }
  return false;
};

const checkDoubleBJ = function (cards) {
  var aces = cards.filter(function (val) {
    return aceList.indexOf(val) != -1;
  });

  return aces.length == 2;
};

const getRoomInfo = function (room) {
  var players = [];
  room.players.forEach(function (val, idx) {
    players.push({ id: idx, name: val.name, bet: val.bet, card: val.card });
  });
  const dealer = room.dealer.name;

  var roomInfo = {
    dealer: { name: dealer, card: room.dealer.card },
    players: players,
  };
  // console.log(roomInfo);

  return roomInfo;
};

const checkAllBetted = function (players) {
  var result = true;
  players.forEach(function (val) {
    if (val.bet <= 0) {
      result = false;
    }
  });

  return result;
};
const suffleCard = function () {
  var cards = [];
  for (var i = 1; i <= 52; i++) {
    cards.push(i);
  }
  var l = cards.length;
  for (let i = l - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

const setCardTable = function (roomInfo) {
  var cards = suffleCard();
  // var cards = [27, 40,  5, 6,1, 13, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  roomInfo.cards = cards;
  roomInfo.playersCard = new Map();
  roomInfo.result = new Map();
};

const dealCards = function (roomInfo) {
  const players = roomInfo.players;
  const playersCard = roomInfo.playersCard;
  const cards = roomInfo.cards;

  playersCard.clear();
  players.forEach(function (val, idx) {
    var playerCard = cards.splice(0, 2);
    val.card = playerCard.length;
    playersCard.set(idx, playerCard);
  });

  var dealerCard = cards.splice(0, 2);
  roomInfo.dealer.card = dealerCard.length;
  playersCard.set(roomInfo.dealer.id, dealerCard);
};

const checkResultAfterDeal = function (roomInfo) {
  const dealerId = roomInfo.dealer.id;
  const playersCard = roomInfo.playersCard;
  const bjId = [];
  const dbjId = [];

  playersCard.forEach(function (val, id) {
    if (id != dealerId) {
      if (checkDoubleBJ(val)) {
        dbjId.push(id);
      } else if (checkBlackJack(val)) {
        bjId.push(id);
      }
    }
  });

  const dealerCard = playersCard.get(dealerId);
  const result = roomInfo.result;
  var bjRes = 1;
  var dbjRes = 1;
  var res = false;
  if (checkDoubleBJ(dealerCard)) {
    bjRes = -1;
    dbjRes = 0;
    res = true;
  } else if (checkBlackJack(dealerCard)) {
    bjRes = 0;
    dbjRes = 1;
    res = true;
  }

  bjId.forEach(function (val) {
    result.set(val, bjRes);
  });
  dbjId.forEach(function (val) {
    result.set(val, dbjRes);
  });

  result.set(dealerId, 0);
  return res;
};

const dealerBlackJack = function (roomInfo) {
  const playersCard = roomInfo.playersCard;
  const result = roomInfo.result;
  playersCard.forEach(function (val, id) {
    if (result.has(id) == false) {
      result.set(id, -1);
    }
  });
};

const nextTurnId = function (roomInfo) {
  roomInfo.isPlaying += 1;
  var playersId = Array.from(roomInfo.playersCard.keys());
  var turn = roomInfo.isPlaying;
  if (turn < playersId.length) {
    return Number(playersId[turn]);
  } else {
    return null;
  }
};

const isUserTurn = function (roomInfo, userId) {
  const turn = roomInfo.isPlaying;
  const turnId = Array.from(roomInfo.playersCard.keys())[turn];
  return turnId == userId;
};

const hitCard = function (roomInfo, userId) {
  const playersCard = roomInfo.playersCard;
  if (playersCard.has(userId)) {
    const playerCard = playersCard.get(userId);
    if (playerCard.length < 5) {
      const card = roomInfo.cards.splice(0, 1);
      console.log('cards', roomInfo.cards.length);
      console.log('new card', card);
      const newPlayerCard = playerCard.concat(card);
      console.log('new player card', newPlayerCard);
      playersCard.set(userId, newPlayerCard);
      console.log(roomInfo.playersCard);
      if (userId != roomInfo.dealer.id) {
        roomInfo.players.get(userId).card = newPlayerCard.length;
      } else {
        roomInfo.dealer.card = newPlayerCard.length;
      }

      return true;
    }
  }

  return false;
};

const canShowCard = function (roomInfo, userId) {
  const turn = roomInfo.isPlaying;
  const userTurn = Array.from(roomInfo.playersCard.keys()).indexOf(userId);

  return userTurn < turn;
};

const compareCardVal = function (dealerCard, playerCard) {
  const dealerCardVal = cardsValue(dealerCard);
  const playerCardVal = cardsValue(playerCard);
  console.log('dealercard val', dealerCard, dealerCardVal);
  console.log('playercard val', playerCard, playerCardVal);

  var result = 0;
  if (playerCard.length == 5) {
    if (playerCardVal < 22) {
      if (dealerCard.length < 5 || playerCardVal > 21) {
        result = 1;
      } else if (playerCardVal > dealerCardVal) {
        result = 1;
      } else if (playerCardVal == dealerCardVal) {
        result = 0;
      } else {
        result = -1;
      }
    } else {
      if (dealerCardVal < 15 || dealerCardVal > 21) {
        result = 0;
      } else {
        result = -1;
      }
    }
  } else {
    if (playerCardVal < 16 || playerCardVal > 21) {
      if (dealerCardVal < 15 || dealerCardVal > 21) {
        result = 0;
      } else {
        result = -1;
      }
    } else {
      if (dealerCardVal < 15 || dealerCardVal > 21) {
        result = 1;
      } else if (playerCardVal > dealerCardVal) {
        result = 1;
      } else if (playerCardVal == dealerCardVal) {
        result = 0;
      } else {
        result = -1;
      }
    }
  }

  return result;
};

const compareAllCard = function (roomInfo) {
  const playersCard = roomInfo.playersCard;
  const dealerCard = playersCard.get(roomInfo.dealer.id);

  playersCard.forEach(function (card, userId) {
    if (roomInfo.result.has(userId) == false) {
      var result = compareCardVal(dealerCard, card);
      roomInfo.result.set(userId, result);
    }
  });
};

const getResult = function (roomInfo) {
  const result = [];
  roomInfo.result.forEach(function (val, id) {
    result.push({ id: id, res: val });
  });

  return result;
};

const resetRoom = function (roomInfo) {
  roomInfo.playersCard.clear();
  roomInfo.result.clear();
  roomInfo.isPlaying = -1;

  const players = roomInfo.players;
  players.forEach(function (val, idx) {
    val.card = 0;
    val.bet = 0;
  });

  roomInfo.dealer.card = 0;
};

module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    console.log('connect', socket);

    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const roomInfo = gameStore.get(roomIdNumber);
        console.log(roomInfo);
        if (roomInfo.players.has(userIdNumber) && roomInfo.isPlaying < 0) {
          // var userInfo = roomInfo.players
          console.log(userIdNumber, ' join room ', roomIdNumber);
          var room = getRoomInfo(roomInfo);
          socket.to(roomIdNumber).emit('room-info', room);
          socket.emit('room-info', room);
        }

        // var userInfo = roomInfo.player.find((player) => {
        //   return player.id == userId;
        // });
      }
    });

    socket.on('exit-room', function (roomId, userId) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.dealer.id == userIdNumber) {
          socket.to(roomIdNumber).emit('dealer-leave-room');
          gameStore.delete(roomIdNumber);
          socket.leave(roomIdNumber);
          // console.log(gameStore)
        } else {
          if (roomInfo.players.has(userIdNumber)) {
            roomInfo.players.delete(userIdNumber);
            var room = getRoomInfo(roomInfo);
            socket.to(roomIdNumber).emit('room-info', room);
            socket.leave(roomIdNumber);
            console.log(userIdNumber, 'left', roomInfo);
          }
        }
      }
    });

    socket.on('player-bet', function (roomId, userId, betVal) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      const betValNumber = +betVal;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.players.has(userIdNumber)) {
          const player = roomInfo.players.get(userIdNumber);
          player.bet = betVal;
          socket.to(roomIdNumber).emit('player-betted', userId, betVal);
          console.log('player bet', roomInfo);
          var allBetted = checkAllBetted(roomInfo.players);
          if (allBetted) {
            socket.to(roomIdNumber).emit('all-player-betted');
          }
          console.log('check all betted', allBetted);
        }
      }
    });

    socket.on('deal-card', function (roomId, dealerId) {
      const roomIdNumber = +roomId;
      const dealerIdNumber = +dealerId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.dealer.id == dealerIdNumber) {
          var allBetted = checkAllBetted(roomInfo.players);
          if (allBetted && roomInfo.isPlaying < 0) {
            setCardTable(roomInfo);
            dealCards(roomInfo);
            var room = getRoomInfo(roomInfo);
            console.log('render', room);
            socket.to(roomIdNumber).emit('room-info', room);
            socket.emit('room-info', room);
            socket.to(roomIdNumber).emit('card-dealt');
            socket.emit('card-dealt');
            var res = checkResultAfterDeal(roomInfo);
            console.log('check bj', res);
            if (res) {
              dealerBlackJack(roomInfo);
              const result = getResult(roomInfo);
              const dealerCard = roomInfo.playersCard.get(dealerIdNumber);
              console.log(result);
              socket.to(roomIdNumber).emit('show-card-all', result, dealerCard);
              socket.emit('show-card-all', result);
            } else {
              if (roomInfo.result.size > 0) {
                const result = getResult(roomInfo);
                const dealerCard = roomInfo.playersCard.get(dealerIdNumber);

                socket
                  .to(roomIdNumber)
                  .emit('winner-winner-chicken-dinner', result, dealerCard);
                socket.emit('winner-winner-chicken-dinner', result);
              }
              var turnId = +nextTurnId(roomInfo);
              console.log('card dealt', gameStore);
              if (turnId) {
                socket.emit('player-turn', turnId);
                socket.to(roomIdNumber).emit('player-turn', turnId);
              }
            }
          }
        }
      }
    });

    socket.on('request-card', function (roomId, userId) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.playersCard.has(userIdNumber)) {
          const playerCard = roomInfo.playersCard.get(userIdNumber);
          socket.emit('receive-card', userIdNumber, playerCard);
        }
      }
    });

    socket.on('hit-card', function (roomId, userId) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (isUserTurn(roomInfo, userIdNumber)) {
          var hitRes = hitCard(roomInfo, userIdNumber);
          const playerCard = roomInfo.playersCard.get(userIdNumber);
          if (hitRes) {
            socket.emit('card-hit', playerCard);

            if (userIdNumber == roomInfo.dealer.id) {
              socket
                .to(roomIdNumber)
                .emit(
                  'dealer-card-change',
                  roomInfo.dealer.card,
                  roomInfo.playersCard.get(userIdNumber)
                );
            } else {
              socket
                .to(roomIdNumber)
                .emit(
                  'player-card-change',
                  userIdNumber,
                  roomInfo.players.get(userIdNumber).card
                );
            }
          }
          if (
            hitRes == false ||
            roomInfo.playersCard.get(userIdNumber).length == 5
          ) {
            socket.emit('turn-ended');
          }
          console.log('hit-card', roomIdNumber, userIdNumber, playerCard);
        }
      }
    });

    socket.on('next-turn', function (roomId, userId) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (isUserTurn(roomInfo, userIdNumber)) {
          var turnId = +nextTurnId(roomInfo);
          console.log('next-turn', turnId);
          if (userIdNumber != roomInfo.dealer.id) {
            socket.to(roomIdNumber).emit('player-finish', userId);
          }
          if (turnId == roomInfo.dealer.id) {
            socket.emit('dealer-turn');
            socket.to(roomIdNumber).emit('dealer-turn');
          } else {
            socket.emit('player-turn', turnId);
            socket.to(roomIdNumber).emit('player-turn', turnId);
          }
        }
      }
    });

    socket.on('show-card', function (roomId, dealerId, userId) {
      const roomIdNumber = +roomId;
      const dealerIdNumber = +dealerId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (
          roomInfo.dealer.id == dealerIdNumber &&
          canShowCard(roomInfo, userIdNumber)
        ) {
          const playerCard = roomInfo.playersCard.get(userIdNumber);
          const dealerCard = roomInfo.playersCard.get(dealerIdNumber);
          result = compareCardVal(dealerCard, playerCard);
          roomInfo.result.set(userIdNumber, result);
          socket.emit('show-card-result', userIdNumber, playerCard, result);
          socket
            .to(roomIdNumber)
            .emit('show-card-result', userIdNumber, result, dealerCard);
        }
      }
    });

    socket.on('show-all', function (roomId, userId) {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (
          isUserTurn(roomInfo, userIdNumber) &&
          roomInfo.dealer.id == userIdNumber
        ) {
          const dealerCard = roomInfo.playersCard.get(userIdNumber);
          compareAllCard(roomInfo);
          const result = getResult(roomInfo);
          console.log(result);
          socket.to(roomIdNumber).emit('show-card-all', result, dealerCard);
          socket.emit('show-card-all', result);
        }
      }
    });

    socket.on('reset-game', function (roomId, dealerId) {
      const roomIdNumber = +roomId;
      const dealerIdNumber = +dealerId;

      if (gameStore.has(roomIdNumber)) {
        const roomInfo = gameStore.get(roomIdNumber);
        if (roomInfo.dealer.id == dealerIdNumber) {
          resetRoom(roomInfo);
          const room = getRoomInfo(roomInfo);
          socket.to(roomIdNumber).emit('room-info', room);
          socket.to(roomIdNumber).emit('game-reset');
          socket.emit('room-info', room);
          socket.emit('game-reset');
        }
      }
    });
  });
};
