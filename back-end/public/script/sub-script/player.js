const roomId = localStorage.getItem('roomId');
const playerId = localStorage.getItem('playerId');
const currentPlayer = data.players.find((element) => {
  return element.playerId === +playerId;
});

const socket = io('/');

socket.emit('join-room', roomId, playerId);
currentPlayer.joinRoomIo = true;

socket.on('player-connection', (player) => {
  const { playerId, playerName, curCards, bet } = player;
  const existPlayer = data.players.find((element) => {
    return element.playerId === +playerId;
  });

  if (existPlayer === undefined) {
    data.players.push(player);
    const playerList = document.getElementById('player-list');
    const playerItem = `
      <li class="player-item grid__col--2">
      <span class="player-item__name">${playerName}</span>
      <span id="${playerId}-bet">
        &nbsp; cược : ${bet}
        </span>
      <img src="/assets/img/0.png" alt="" class="player-item__img" />
      <span class="player-item__card-number"
        >${curCards.length}</span
      >
        </li>`;
    playerList.innerHTML += playerItem;
  }
});

const betButton = document.getElementById('bet');
socket.on('allow-bet', () => {
  betButton.disabled = false;
});

//handle-bet
betButton.addEventListener('click', () => {
  const betInput = document.getElementById('betInput');
  console.log(betInput.value);
  const bet = +betInput.value;
  socket.emit('bet', roomId, playerId, bet);
  document.getElementById('infoBet').innerHTML = 'Bạn đã cược : ' + bet;
  currentPlayer.bet = bet;
});

socket.on('player-bet', (playerId, bet) => {
  const player = data.players.find((element) => {
    return +element.playerId === +playerId;
  });
  player.bet = +bet;
  document.getElementById(`${playerId}-bet`).innerHTML = '&nbsp; cược : ' + bet;
});
