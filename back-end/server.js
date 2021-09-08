const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const ioController = require('./controllers/io.controller');
const { RSA_NO_PADDING } = require('constants');
const { render } = require('ejs');
const { json } = require('body-parser');

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

app.get('/home', (req, res) => {
  res.render('home', {msg: null});
});

app.get('/home/:msg', (req, res) => {
  var msg = req.params.msg;
  res.render('home', {msg: msg});
});

app.get('/login', (req, res) => {
  res.render('login');
});


// app.get('/dealer', (req, res)=>{
//   const roomId = Math.floor(100000 + Math.random() * 900000);
//   const dealerId = Math.floor(1000 + Math.random() * 9000);
//   if (!gameStore.has(roomId)) {
//     res.render('dealer', {roomId: roomId, dealerId: dealerId})
//   }
//   else{
//     res.render('home')
//   }
//   // res.render('dealer')
// })

app.post('/create_room', (req, res)=>{
  var roomId = Math.floor(100000 + Math.random() * 900000);
  var noRoom = setTimeout(function(){
    var msg = "Không tạo được phòng"
    console.log(msg)
    res.status(200).json({ roomId: null, msg: msg });
  }, 3000)
  // noRoom;
  while(gameStore.has(roomId)){
    roomId = Math.floor(100000 + Math.random() * 900000);
  }
  clearTimeout(noRoom)
  const dealerId = Math.floor(1000 + Math.random() * 9000);
  const name = req.body.name;
  if (!gameStore.has(roomId)) {
    gameStore.set(roomId, { dealer: { id: dealerId, name: name, card: 0 }, players: new Map() , isPlaying: -1});
    res.status(200).json({ roomId: roomId, dealerId: dealerId });
  }
});

app.post('/enter_room/:roomId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const name = req.body.name;
  if (gameStore.has(roomId)) {
    const room = gameStore.get(roomId);
    if (room.isPlaying < 0){
      var noRoom = setTimeout(function(){
        var msg = "Không vào được phòng"
        console.log(msg)
        res.status(200).json({ roomId: null, msg: msg });
      }, 3000)
      var playerId = Math.floor(1000 + Math.random() * 9000);
      while(room.players.has(playerId)){
        playerId = Math.floor(1000 + Math.random() * 9000);
      }
      clearTimeout(noRoom);
      room.players.set(playerId, {name: name, bet: 0, card: 0}) 
      console.log(gameStore.get(roomId))
      res.status(200).json({ roomId: roomId, playerId: playerId });

    }else{
        var msg = "Phòng đang chiến, vui lòng đợi xíu nha !"
        console.log(msg)
        res.status(200).json({ roomId: null, msg: msg });
    }
  }else{
      var msg = "Phòng không tồn tại"
      console.log(msg)
      res.status(200).json({ roomId: null, msg: msg });
  }
});

app.get('/dealer/:roomId/:dealerId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const dealerId = Number(req.params.dealerId)

  if (gameStore.has(roomId)){
    if (gameStore.get(roomId).dealer.id == dealerId){
      res.render('dealer', {roomId: roomId, dealerId: dealerId})
    }
    else{
      res.render('home', {msg: "Không tồn tại chủ phòng này"});
    }
  
  }
  else{
    res.render('home', {msg: "Không tồn tại phòng này"});


  }
})

app.get('/player/:roomId/:playerId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const playerId = Number(req.params.playerId)

  if (gameStore.has(roomId)){
    
    if (gameStore.get(roomId).players.has(playerId)){

      res.render('player', {roomId: roomId, playerId: playerId})
    }
    else{
      res.render('home', {msg: 'Không tồn tại người chơi này'});

    }
  }
  else{
    res.render('home', {msg: "Không tồn tại phòng này"});


  }
})

app.get('/:roomId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  if (gameStore.has(roomId)){
    const room = gameStore.get(roomId)
    // console.log(room.players)
    var players = []
    room.players.forEach(function(val, idx){
      players.push({id: idx, name: val.name, bet: val.bet, card: val.card})
    })
    const dealer = room.dealer.name
    
    var roomInfo = {dealer: dealer, players: players}
    // console.log(roomInfo);
    res.status(200).json(roomInfo)
  }
})

app.get('/:roomId/:userId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const userId = Number(req.params.userId)

  if (gameStore.has(roomId)){
    const room = gameStore.get(roomId)
    console.log('receive card room', room)
    if (room.playersCard.has(userId)){
      const playerCard = room.playersCard.get(userId);
      console.log('receive card', playerCard, userId)
      res.status(200).json(playerCard);
    }
  }
})



// app.delete('/home', (req, res)=> {
//   var roomId = Number(req.body.roomId)
//   var playerId = Number(req.body.playerId)
//   var room = gameStore.get(roomId)
//   if (room){
//     var player = room.player.find(function(player){
//       return player.id == playerId
//     })
//     if (player){
//       var idxOfPlayer = room.player.indexOf(player) 
//       if (idxOfPlayer > -1){
//         room.player.splice(idxOfPlayer, 1);
//       }
//       var destination = '/home';
//       res.status(200).json(destination);

//     }
//     else{
//       res.status(404).json('loi khong tim thay nguoi choi');

//     }
    
//   }
//   else{
//     res.status(404).json('loi khong tim thay phong');

//   }


 
// })


// app.get('/dealer', (req, res) => {
//   const roomId = Math.floor(100000 + Math.random() * 900000);
//   const dealerId = Math.floor(1000 + Math.random() * 9000);
//   if (!gameStore.has(roomId)) {
//     gameStore.set(roomId, { dealer: { id: dealerId }, player: [] });
//   }
//   res.render('dealer', { roomId: roomId, dealerId: dealerId });
// });

// app.get('/player/:roomId', (req, res) => {
//   var roomId = Number(req.params.roomId);
//   var room = gameStore.get(roomId);
//   if (room){
//     var playerId = room.player.length;
//     var dealerName = room.dealer.name;
//     room.player.push({id: playerId, bet: 0, card: []});
//     res.render('player', {roomId: roomId, playerId: playerId, dealerName: dealerName});
    
//   }
//   else{
//     res.render('home')
//   }
//   console.log(room)

// });

// app.get('/player/list', (req, res)=>{
//   var roomId = req.body.roomId
//   console.log(roomId)
//   res.status(200).json(gameStore.get(roomId).player)
// })

ioController(io, gameStore);

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
