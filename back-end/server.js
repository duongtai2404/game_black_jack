const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const ioController = require('./controllers/io.controller');

// const game = [
//   {
//     room_id : 1,
//     dealer: '123',
//     players: []
//   }
// ];

const gameStore = new Map();
//{roomId : {dealer: dealerId , players : []}}

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/dealer', (req, res) => {
  const roomId = Math.floor(100000 + Math.random() * 900000);
  const dealerId = Math.floor(1000 + Math.random() * 9000);
  if (!gameStore.has(roomId)) {
    gameStore.set(roomId, { dealer: { id: dealerId }, player: [] });
  }
  res.render('dealer', { roomId: roomId, dealerId: dealerId });
});

app.get('/player', (req, res) => {
  res.render('player');
});

ioController(io, gameStore);

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
