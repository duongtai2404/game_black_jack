// const distributeCard = (infoRoom) => {
//   const { dealer, player, cards } = infoRoom;
//   let cardForDealer = randomTwoCard(cards);
//   dealer.curCards = cardForDealer.slice();
//   player.forEach((element) => {
//     let cardForPlayer = randomTwoCard(cards);
//     element.curCards = cardForPlayer.slice();
//   });
// };

// //card = [1,2,3,..,52]
// const randomTwoCard = (cards) => {
//   const arrayCard = [];
//   for (let index = 0; index < 2; index++) {
//     let index = randomNumber(cards.length);
//     arrayCard.push(cards[index]);
//     cards.splice(index, 1);
//   }
//   return arrayCard;
// };

// const randomNumber = (length) => {
//   return Math.floor(Math.random() * length);
// };

// const plugOutAndAddCardInCurCard = (curCardUser, cards) => {
//   const index = randomNumber(cards.length);
//   curCardUser.push(cards[index]);
//   cards.splice(index, 1);
//   return curCardUser;
// };

// { dealer: { id: dealerId, name: name }, players: new Map(){name: name, bet: 0, card: 0} , cards: [], playersCard: new Map()[], isPlaying: false}



const getRoomInfo = function(room){
    var players = []
    room.players.forEach(function(val, idx){
      players.push({id: idx, name: val.name, bet: val.bet, card: val.card})
    })
    const dealer = room.dealer.name
    
    var roomInfo = {dealer: {name: dealer, card: room.dealer.card}, players: players}
    // console.log(roomInfo);

    return roomInfo;
}


const checkAllBetted = function(players){
  var result = true;
  players.forEach(function(val){
    if (val.bet <= 0){
      result = false;
    }
  })
  
  return result;
}
const suffleCard = function(){
  var cards = []
  for (var i = 1; i <= 52; i++){
    cards.push(i);
  }
  var l = cards.length
  for (let i = l - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const setCardTable = function(roomInfo){
  var cards = suffleCard();
  roomInfo.cards = cards;
}

const dealCards = function(roomInfo){
  const players = roomInfo.players;
  const playersCard = roomInfo.playersCard;
  const cards = roomInfo.cards;

  playersCard.clear();
  players.forEach(function(val, idx){
    var playerCard = cards.splice(0, 2);
    val.card = playerCard.length;
    playersCard.set(idx, playerCard);
  })

  var dealerCard = cards.splice(0, 2);
  roomInfo.dealer.card = dealerCard.length;
  playersCard.set(roomInfo.dealer.id, dealerCard);

}

const nextTurnId = function(roomInfo){
  roomInfo.isPlaying += 1
  var playersId = Array.from(roomInfo.playersCard.keys())
  var turn = roomInfo.isPlaying
  if (turn < playersId.length){

    return Number(playersId[turn])
  }
  else{
    return null;
  }
}

const isUserTurn = function(roomInfo, userId){
  const turn = roomInfo.isPlaying
  const turnId = Array.from(roomInfo.playersCard.keys())[turn]
  return turnId == userId;
}

const hitCard = function(roomInfo, userId){
  const playersCard =  roomInfo.playersCard
  if (playersCard.has(userId)){
    const playerCard = playersCard.get(userId)
    if (playerCard.length < 5){
      const card = roomInfo.cards.splice(0,1)
      console.log("cards", roomInfo.cards.length)
      console.log('new card', card)
      const newPlayerCard = playerCard.concat(card);
      console.log('new player card', newPlayerCard)
      playersCard.set(userId, newPlayerCard);
      console.log(roomInfo.playersCard)
      if (userId != roomInfo.dealer.id){
        roomInfo.players.get(userId).card = newPlayerCard.length;

      }
      else{
        roomInfo.dealer.card = newPlayerCard.length;
      }

      return true;
    }
  }

  return false;
}

module.exports = (io, gameStore) => {
  io.on('connect', (socket) => {
    console.log('connect', socket);

    socket.on('join-room', (roomId, userId) => {
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      if (gameStore.has(roomIdNumber)) {
        socket.join(roomIdNumber);
        const roomInfo = gameStore.get(roomIdNumber);
        console.log(roomInfo)
        if (roomInfo.players.has(userIdNumber) && roomInfo.isPlaying < 0){
          // var userInfo = roomInfo.players
          console.log(userIdNumber, ' join room ', roomIdNumber)
          var room = getRoomInfo(roomInfo);
          socket.to(roomIdNumber).emit('room-info', room);
          socket.emit('room-info', room);
        }
        
        // var userInfo = roomInfo.player.find((player) => {
        //   return player.id == userId;
        // });
      }
    });

    socket.on('exit-room', function(roomId, userId){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (roomInfo.dealer.id == userIdNumber){
          socket.to(roomIdNumber).emit('dealer-leave-room');
          gameStore.delete(roomIdNumber);
          socket.leave(roomIdNumber);
          // console.log(gameStore)
        }
        else{
          if (roomInfo.players.has(userIdNumber)){
            roomInfo.players.delete(userIdNumber);
            var room = getRoomInfo(roomInfo);
            socket.to(roomIdNumber).emit('room-info', room);
            socket.leave(roomIdNumber);
            console.log(userIdNumber, 'left', roomInfo)

          }
        }
      }
    })

    socket.on('player-bet', function(roomId, userId, betVal){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;
      const betValNumber = +betVal;

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (roomInfo.players.has(userIdNumber)){
          const player = roomInfo.players.get(userIdNumber)
          player.bet = betVal;
          socket.to(roomIdNumber).emit('player-betted', userId, betVal);
          console.log('player bet', roomInfo)
          var allBetted = checkAllBetted(roomInfo.players)
          if (allBetted){
            socket.to(roomIdNumber).emit('all-player-betted');
          }
          console.log('check all betted', allBetted);
        }
      }
    })

    socket.on('deal-card', function(roomId, dealerId){
      const roomIdNumber = +roomId;
      const dealerIdNumber = +dealerId;

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (roomInfo.dealer.id == dealerIdNumber){
          var allBetted = checkAllBetted(roomInfo.players)
          if (allBetted && roomInfo.isPlaying < 0){
            setCardTable(roomInfo);
            dealCards(roomInfo);
            var room = getRoomInfo(roomInfo);
            console.log('render', room)
            socket.to(roomIdNumber).emit('room-info', room);
            socket.emit('room-info', room)
            socket.to(roomIdNumber).emit('card-dealt')
            socket.emit('card-dealt')
            var turnId = +nextTurnId(roomInfo)
            console.log('card dealt', gameStore)
            if (turnId){
              socket.emit('player-turn', turnId);
              socket.to(roomIdNumber).emit('player-turn', turnId);
            }
          }
        }
      }
    })

    socket.on('request-card', function(roomId, userId){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (roomInfo.playersCard.has(userIdNumber)){
          const playerCard = roomInfo.playersCard.get(userIdNumber)
          socket.emit('receive-card', userIdNumber, playerCard)
        }
      }
    })

    socket.on('hit-card', function(roomId, userId){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId;

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (isUserTurn(roomInfo, userIdNumber)){
          var hitRes = hitCard(roomInfo, userIdNumber)
          const playerCard = roomInfo.playersCard.get(userIdNumber)
          if (hitRes){
            socket.emit('card-hit', playerCard)

            if (userIdNumber == roomInfo.dealer.id){
              socket.to(roomIdNumber).emit('dealer-card-change', roomInfo.dealer.card)
            }
            else{
              socket.to(roomIdNumber).emit('player-card-change', userIdNumber, roomInfo.players.get(userIdNumber).card);
            }
          }
          else{
            socket.emit('turn-ended');
          }
          console.log('hit-card', roomIdNumber, userIdNumber, playerCard)
        }
      }
    })


    socket.on('next-turn', function(roomId, userId){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (isUserTurn(roomInfo, userIdNumber)){
          var turnId = +nextTurnId(roomInfo)
          console.log('next-turn', turnId);
          if (userIdNumber != roomInfo.dealer.id){
            socket.to(roomIdNumber).emit('player-finish', userId);

          }
          if (turnId == roomInfo.dealer.id){
            socket.emit('dealer-turn');
            socket.to(roomIdNumber).emit('dealer-turn');
          }
          else{
            socket.emit('player-turn', turnId);
            socket.to(roomIdNumber).emit('player-turn', turnId);

          }
        }
      }
    })

    socket.on('show-all', function(roomId, userId){
      const roomIdNumber = +roomId;
      const userIdNumber = +userId

      if (gameStore.has(roomIdNumber)){
        const roomInfo = gameStore.get(roomIdNumber)
        if (isUserTurn(roomInfo, userIdNumber) && roomInfo.dealer.id == userIdNumber){
          const dealerCard = roomInfo.playersCard.get(userIdNumber)
          socket.to(roomIdNumber).emit('dealer-show-all', dealerCard);
        }
      }
    })
  });
  


};
