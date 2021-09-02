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
                <div class="body-item">
                <div class="number-card">${curCards.length}</div>
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
  }, 2000);
});

socket.on('player-bet', (playerId, bet) => {
  const player = data.players.find((element) => {
    return +element.playerId === +playerId;
  });
  player.bet = +bet;
  document.getElementById(`${playerId}-bet`).innerHTML = 'Cược : ' + bet;
});
