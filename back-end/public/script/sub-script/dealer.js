const roomId = localStorage.getItem('roomId');
const dealerId = localStorage.getItem('dealerId');

const socket = io('/');

socket.emit('join-room', roomId, dealerId);
data.dealer.joinRoomIo = true;

socket.on('player-connection', (player) => {
  const { playerId, playerName, curCards, bet } = player;

  const existPlayer = data.players.find((element) => {
    return element.playerId === +playerId;
  });

  if (existPlayer === undefined) {
    data.players.push(player);
    const playerItem = `
        <li class="list-group-item col-md-2 col-xl-3 list-player-item">
            <div class="every-teammate">
                <div class="header-item d-flex justify-content-center">
                <div class="w-75 clearfix">
                    <p class="float-start">${playerName}</p>
                    <p class="float-end">Cược : ${bet}</p>
                </div>
                </div>
                <div class="body-item" id="${playerId}-list-card">
                </div>
            </div>
        </li>
      `;

    const playerList = document.getElementById('player-list');
    playerList.innerHTML += playerItem;
  }
});

const openBetButton = document.getElementById('openBet');
openBetButton.addEventListener('click', () => {
  socket.emit('open-bet', roomId);
  const liveToast = document.getElementById('liveToast');
  liveToast.className += ' show';
  setTimeout(() => {
    liveToast.className = 'toast';
  }, 1300);
});

socket.on('player-bet', (playerId, bet) => {
  const player = data.players.find((element) => {
    return +element.playerId === +playerId;
  });
  player.bet = +bet;
  document.getElementById(`${playerId}-bet`).innerHTML = 'Cược : ' + bet;
});

const distributeCardButton = document.getElementById('distributeCard');
distributeCardButton.addEventListener('click', () => {
  socket.emit('distribute-card', roomId);
});

socket.on('receive-card-first', (dealer, players) => {
  data.dealer = dealer;
  data.players = players;
  // <img src="/assets/img/0.png" alt="" class="player-item__img" />

  const listDealerCard = document.getElementById('list-dealer-card-item');

  let listDealerCardItem = '';

  dealer.curCards.forEach((element) => {
    listDealerCardItem = `
      <li class="list-group-item col-2 list-dealer-card-item">
        <div class="item">
          <img src="/assets/img/${element}.png" alt="" class="card-item-img" />
        </div>
      </li>`;
    listDealerCard.innerHTML += listDealerCardItem;
  });

  let listPlayerCard = null;
  let listPlayerCardItem = '';
  players.forEach((element) => {
    listPlayerCard = document.getElementById(`${element.playerId}-list-card`);
    element.curCards.forEach((element) => {
      listPlayerCardItem = `<img src="/assets/img/0.png" alt="" class="player-card-item" />`;
      listPlayerCard.innerHTML += listPlayerCardItem;
    });
  });
});
