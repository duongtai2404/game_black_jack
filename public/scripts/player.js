const host = 'https://xidzach-ltd.herokuapp.com';

const socket = io('/');

// socket.emit('join-room', roomId, playerId);

// socket.on('player-connection', function(userId, userName) {
//     console.log(userId, userName);
// })
const playerInfo = {
  id: playerId,
  name: localStorage.getItem('name'),
  card: 0,
  bet: 0,
  status: 0,
};

function handleJoinRoom() {
  socket.emit('join-room', roomId, playerId);
  socket.on('room-info', function (roomInfo) {
    // getRoomInfo(renderPlayerList);
    handleRender(roomInfo);
  });
}

function handleLeaveRoom() {
  socket.on('dealer-leave-room', function () {
    var msg = 'Chủ phòng đã rời đi';
    window.location.replace(`${host}/home/${msg}`);
  });
  const exitBtn = document.querySelector('.exit__btn');
  exitBtn.addEventListener('click', function () {
    console.log('exit clicked');
    socket.emit('exit-room', roomId, playerId);
    window.location.replace(`${host}/home`);
  });
}

function handleRender(roomInfo) {
  renderDealerName(roomInfo.dealer.name);
  renderDealerCard(roomInfo.dealer.card);
  renderPlayerList(roomInfo.players);
}

function renderDealerName(dealerName) {
  document.querySelector('.dealer__name').textContent = dealerName;
}

function renderPlayerList(players) {
  var htmls = players.map(function (val) {
    if (val.id == playerId) {
      return '';
    } else {
      var bettedClass = '';
      var imgSrc = '';
      if (val.bet > 0) {
        bettedClass = 'player--betted';
      }
      if (val.card > 0) {
        imgSrc = '/assets/img/0.png';
      }
      var html = `
                <li class="player-item grid__col--2 ${bettedClass}" id="player-${val.id}">
                    <span class="player-item__name">${val.name}</span>
                    <img src="${imgSrc}" alt="" class="player-item__img">
                    <div class="player-item__info">
                    <div>
                        <span>Bài: </span>
                        <span class="player-item__card-number">${val.card}</span>
                    </div>
                    <div>
                        <span>Cược: </span>
                        <span class="player-item__bet">${val.bet}</span>
                    </div>
    
                    </div>
    
                  
                </li>
              
                `;
    }
    return html;
  });
  console.log(htmls);
  document.querySelector('ul.player-list').innerHTML = htmls.join(' ');

  players.forEach(function(val){
    var playerItem = document.querySelector(`#player-${val.id}`);
    if (playerItem && val.id != playerId){
      playerItem.addEventListener('click', function(){
        showCard(+val.id);
      })
    }
  })
}

function renderDealerCard(cardNum) {
  var htmls = [];
  for (var i = 0; i < cardNum; i++) {
    htmls.push(
      `
            <li class="card-list__item">
                        <img src="/assets/img/0.png" alt="" class="card-list__item-img">

            </li>
            `
    );
  }
  document.querySelector('.dealer .card-list').innerHTML = htmls.join(' ');
}

function renderDealerCardList(cardList) {
  var htmls = cardList.map(function (val) {
    return `
        <li class="card-list__item">
                    <img src="/assets/img/${val}.png" alt="" class="card-list__item-img">

        </li>
        `;
  });
  document.querySelector('.dealer .card-list').innerHTML = htmls.join(' ');
}

function handleBet() {
  const betBtn = document.querySelector('.player-bet__btn');
  betBtn.addEventListener('click', function () {
    console.log('bet clicked');
    var betInput = document.querySelector('.player-bet__input');
    const betNum = Number(betInput.value);
    if (betNum && betNum > 0 && Number.isInteger(betNum)) {
      betInput.disabled = true;
      betBtn.disabled = true;
      socket.emit('player-bet', roomId, playerId, betNum);
      document.querySelector('.player').classList.add('player--betted');
      playerInfo.bet = betNum;
      playerInfo.status = 1;
    } else {
      alert('mức cược cần lớn hơn 0 và số nguyên');
    }
  });

  socket.on('player-betted', function (userId, betVal) {
    var playerItem = document.querySelector(`#player-${userId}`);
    if (playerItem) {
      playerItem.querySelector('.player-item__bet').textContent = betVal;
      playerItem.classList.add('player--betted');
    }
  });
}

function handleReceiveCard() {
  socket.on('card-dealt', function () {
    socket.emit('request-card', roomId, playerId);
  });

  socket.on('receive-card', function (userId, playerCard) {
    if (userId == playerId) {
      renderCardList(playerCard);
    } else {
      document.querySelector('.modal').style.display = 'flex';

      renderCardList(playerCard, '.other-player__card');
    }
  });

  socket.on('winner-winner-chicken-dinner', function (result, dealerCard) {
    renderResult(result);
    if (result[playerId]) {
      playerInfo.status = 4;
      renderDealerCardList(dealerCard);
      console.log(dealerCard);
    }
  });
}

function renderCardList(cardlist, otherPlayer = '') {
  playerInfo.card = cardlist.length;
  var playerCardList = document.querySelector(
    `.player${otherPlayer} .card-list.player__card`
  );
  var htmls = cardlist.map(function (card) {
    var html = `
        <li class="card-list__item">
        <img src="/assets/img/${card}.png" alt="" class="card-list__item-img">
        </li>
        `;

    return html;
  });
  htmls.join(' ');
  playerCardList.innerHTML = htmls;
  // console.log(htmls)
}

function handlePlayerTurn() {
  socket.on('player-turn', function (userId) {
    if (userId == playerId) {
      if (playerInfo.status != 4) {
        var player = document.querySelector('.player');
        if (player.classList.contains('player--betted')) {
          player.classList.remove('player--betted');
        }
        player.classList.add('player--turn');
        playerInfo.status = 2;
        activateControl();
      } else {
        socket.emit('next-turn', roomId, playerId);
      }
    } else {
      var otherPlayer = document.querySelector(`#player-${userId}`);
      if (otherPlayer) {
        if (otherPlayer.classList.contains('player--betted')) {
          otherPlayer.classList.remove('player--betted');
        }
        otherPlayer.classList.add('player--turn');
        console.log('turn', otherPlayer);
      }
    }
  });

  socket.on('dealer-turn', function () {
    var dealer = document.querySelector('.dealer');
    dealer.classList.add('player--turn');
  });

  socket.on('card-hit', function (cardList) {
    renderCardList(cardList);
  });

  socket.on('turn-ended', function () {
    endTurn();
    disableControl();
    socket.emit('next-turn', roomId, playerId);
  });

  socket.on('player-card-change', function (userId, card) {
    var playerItem = document.querySelector(`#player-${userId}`);
    playerItem.querySelector('.player-item__card-number').textContent = card;
  });

  socket.on('dealer-card-change', function (card, cardList) {
    if (playerInfo.status != 4) {
      renderDealerCard(card);
    } else {
      renderDealerCardList(cardList);
    }
  });

  socket.on('player-finish', function (userId) {
    if (userId != playerId) {
      var otherPlayer = document.querySelector(`#player-${userId}`);
      if (otherPlayer) {
        if (otherPlayer.classList.contains('player--turn')) {
          otherPlayer.classList.remove('player--turn');
        }
        otherPlayer.classList.add('player--end-turn');
        console.log('turn', otherPlayer);
      }
    }
  });

  const hitBtn = document.querySelector('.hit-btn');
  const doneBtn = document.querySelector('.done-btn');
  hitBtn.addEventListener('click', function () {
    socket.emit('hit-card', roomId, playerId);
    console.log('hit clicked');
  });

  doneBtn.addEventListener('click', function () {
    console.log('done clicked');
    endTurn();
    disableControl();
    socket.emit('next-turn', roomId, playerId);
  });
}

function endTurn() {
  var player = document.querySelector('.player');
  if (player.classList.contains('player--turn')) {
    player.classList.remove('player--turn');
  }
  player.classList.add('player--end-turn');
  playerInfo.status = 3;
}

function activateControl() {
  const hitBtn = document.querySelector('.hit-btn');
  const doneBtn = document.querySelector('.done-btn');
  hitBtn.disabled = false;
  doneBtn.disabled = false;
}

function disableControl() {
  document.querySelector('.hit-btn').disabled = true;
  document.querySelector('.done-btn').disabled = true;
}

function handleShowCard() {
  socket.on('show-card-result', function (userId, result, dealerCard) {
    if (userId == playerId) {
      renderDealerCardList(dealerCard);
      var player = document.querySelector('.player');
      playerInfo.status = 4;
      switch (result) {
        case -1:
          player.classList.add('player--lose');
          break;
        case 0:
          player.classList.add('player--draw');
          break;
        case 1:
          player.classList.add('player--win');
          break;
      }
    } else {
      var playerItem = document.querySelector(`#player-${userId}`);
      if (playerItem) {
        playerItem.classList.remove('player--end-turn');
        switch (result) {
          case -1:
            playerItem.classList.add('player--lose');
            break;
          case 0:
            playerItem.classList.add('player--draw');
            break;
          case 1:
            playerItem.classList.add('player--win');
            break;
        }
      }
    }
  });
  socket.on('show-card-all', function (result, cardList) {
    renderDealerCardList(cardList);
    var dealer = document.querySelector('.dealer');
    dealer.classList.add('player--end-turn');
    console.log(result);
    renderResult(result);
  });
}

function renderResult(result) {
  result.forEach(function (val) {
    var id = +val.id;
    var res = val.res;
    if (id == playerId) {
      var player = document.querySelector('.player');
      console.log('lose');
      playerInfo.status = 4;
      switch (res) {
        case -1:
          player.classList.add('player--lose');
          break;
        case 0:
          player.classList.add('player--draw');
          break;
        case 1:
          player.classList.add('player--win');
          break;
      }
    } else {
      var playerItem = document.querySelector(`#player-${id}`);
      if (playerItem) {
        playerItem.classList.remove('player--end-turn');
        switch (res) {
          case -1:
            playerItem.classList.add('player--lose');
            break;
          case 0:
            playerItem.classList.add('player--draw');
            break;
          case 1:
            playerItem.classList.add('player--win');
            break;
        }
      }
    }
  });
}

function showCard(userId) {
  var playerItem = document.querySelector(`#player-${userId}`);
  var cardNum = Number(
    playerItem.querySelector('.player-item__card-number').textContent
  );
  console.log('player item', playerItem, cardNum);
  if (cardNum > 0) {
    var playerName = playerItem.querySelector('.player-item__name').textContent;
    document.querySelector('.modal .player__name').textContent = playerName;
    socket.emit('request-card', roomId, userId);
  }
}

function hideCard() {
  var closeBtn = document.querySelector('.close-player-btn');
  closeBtn.addEventListener('click', function () {
    document.querySelector('.modal').style.display = 'none';
  });
}

function handleResetGame() {
  socket.on('game-reset', function () {
    document.querySelector('.player').className = 'grid__col--6 player';
    document.querySelector('.dealer').className = 'grid__col--6 dealer';
    document.querySelector('.player .card-list.player__card').innerHTML = '';
    disableControl();
    document.querySelector('.player-bet__btn').disabled = false;
    document.querySelector('.player-bet__input').disabled = false;
    playerInfo.card = 0;
    playerInfo.bet = 0;
    playerInfo.status = 0;
  });
}

function start() {
  document.querySelector('.player-area .player__name').textContent =
    localStorage.getItem('name');
  handleJoinRoom();
  handleBet();
  handleLeaveRoom();
  handleReceiveCard();
  handlePlayerTurn();
  handleShowCard();
  hideCard();
  handleResetGame();
}

start();
