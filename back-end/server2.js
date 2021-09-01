const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const ioController = require('./controllers/io.controller');

const createCards = () => {
  let cards = [];
  for (let index = 1; index < 53; index++) {
    cards.push(index);
  }
  return cards;
};

const CARDS = createCards();

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

app.get('/login', (req, res) => {
  return res.render('view-test/login');
});

app.get('/home', (req, res) => {
  return res.render('view-test/home');
});

app.post('/room', (req, res) => {
  const { dealerId, name } = req.body;
  const roomId = Math.floor(100000 + Math.random() * 900000);
  if (!gameStore.has(roomId)) {
    gameStore.set(roomId, {
      dealer: { dealerId, dealerName: name, curCards: [] },
      players: [],
      cards: CARDS.slice(),
    });
    return res.status(200).json({ roomId });
  }
  return res.status(403).json({ message: 'Room is exist, cannot create' });
});

const canGoRoom = (req, res, next) => {
  //   const authorization = req.get('Authorization');
  //   if (!authorization) {
  //     return res.render('view-test/home');
  //   } else {
  //     const arr = authorization.split(' ');
  //     console.log(arr);
  //     req.userId = arr[1];
  //     if (arr[2]) {
  //       req.userName = arr[2];
  //     }
  //     return next();
  //   }
  const userId = req.query.id;
  if (!userId) {
    return res.render('view-test/home');
  } else {
    req.userId = userId;
    if (req.query.name) {
      req.userName = req.query.name;
    }
    return next();
  }
};

app.get('/room/:roomId', canGoRoom, (req, res) => {
  const userId = +req.userId;
  const roomId = +req.params.roomId;
  console.log(gameStore);
  if (!gameStore.has(roomId)) {
    return res.render('view-test/home', {
      message: 'Room is not exist, cannot enter',
    });
  } else {
    const { dealer, players } = gameStore.get(roomId);
    if (dealer.dealerId === userId) {
      return res.render('view-test/dealer', { roomId });
    } else {
      const player = players.find((element) => {
        return (element.playerId = userId);
      });
      if (!player) {
        players.push({
          playerId: userId,
          playerName: req.userName,
          curCards: [],
        });
      }
      return res.render('view-test/player', { dealer, players });
    }
  }
});

// app.post('/home', (req, res) => {
//   var roomId = Number(req.body.roomId);
//   var playerId = Number(req.body.playerId);
//   var room = gameStore.get(roomId);
//   if (room) {
//     var player = room.player.find(function (player) {
//       return player.id == playerId;
//     });
//     if (player) {
//       var idxOfPlayer = room.player.indexOf(player);
//       if (idxOfPlayer > -1) {
//         room.player.splice(idxOfPlayer, 1);
//       }
//       var destination = '/home';
//       res.status(200).json(destination);
//     } else {
//       res.status(404).json('loi khong tim thay nguoi choi');
//     }
//   } else {
//     res.status(404).json('loi khong tim thay phong');
//   }
// });

// app.get('/dealer', (req, res) => {
//   res.render('dealer', { roomId: roomId, dealerId: dealerId });
// });

// app.get('/player/:roomId', (req, res) => {
//   var roomId = Number(req.params.roomId);
//   var room = gameStore.get(roomId);
//   if (room) {
//     var playerId = room.player.length;
//     var dealerName = room.dealer.name;
//     room.player.push({ id: playerId, bet: 0, card: [] });
//     res.render('player', {
//       roomId: roomId,
//       playerId: playerId,
//       dealerName: dealerName,
//     });
//   } else {
//     res.render('home');
//   }
//   console.log(room);
// });

ioController(io, gameStore);

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
