const roomId = localStorage.getItem('roomId');
const playerId = localStorage.getItem('playerId');

const socket = io('/');

socket.emit('join-room', roomId, playerId);
const currentPlayer = data.players.find((element) => {
  return element.playerId === +playerId;
});
currentPlayer.joinRoomIo = true;

socket.on('player-connection', (player) => {
  const { playerId, playerName, curCards, bet } = player;
  const existPlayer = data.players.find((element) => {
    return element.playerId === playerId;
  });

  if (existPlayer === undefined) {
    data.players.push(player);
    const playerList = document.getElementById('player-list');
    const playerItem = `
      <li class="player-item grid__col--2">
      <span class="player-item__name">${playerName}</span>
      <img src="/assets/img/0.png" alt="" class="player-item__img" />
      <span class="player-item__card-number"
        >${curCards.length}</span
      >
        </li>`;
    playerList.innerHTML += playerItem;
  }
});
