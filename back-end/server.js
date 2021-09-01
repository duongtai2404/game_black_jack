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


app.post('/create_room', (req, res)=>{
  const roomId = Math.floor(100000 + Math.random() * 900000);
  const dealerId = Math.floor(1000 + Math.random() * 9000);
  const name = req.body.name;
  if (!gameStore.has(roomId)) {
    gameStore.set(roomId, { dealer: { id: dealerId, name: name }, players: [] });
  }
  res.status(200).json({ roomId: roomId, dealerId: dealerId });
});

app.post('/enter_room/:roomId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const playerId = Math.floor(1000 + Math.random() * 9000);
  const name = req.body.name;
  if (gameStore.has(roomId)) {
    const room = gameStore.get(roomId);
    room.players.push({id: playerId, name: name, bet: 0, card: 0})
  }
  res.status(200).json({ roomId: roomId, playerId: playerId });
});

app.get('/dealer/:roomId/:dealerId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const dealerId = Number(req.params.dealerId)

  if (gameStore.has(roomId)){
    if (gameStore.get(roomId).dealer.id == dealerId){
      res.render('dealer', {roomId: roomId, dealerId: dealerId})
    }
    else{
      res.render('home')
    }
  
  }
  else{
    res.render('home')

  }
})

app.get('/player/:roomId/:playerId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  const playerId = Number(req.params.playerId)

  if (gameStore.has(roomId)){
    // if (gameStore.get(roomId).dealer.id == dealerId){
    //   res.render('dealer', {roomId: roomId, dealerId: dealerId})
    // }
    // else{
    //   res.render('home')
    // }
    res.render('player', {roomId: roomId, playerId: playerId})
  }
  else{
    res.render('home')

  }
})

app.get('/:roomId', (req, res)=>{
  const roomId = Number(req.params.roomId)
  if (gameStore.has(roomId)){
    const room = gameStore.get(roomId)
    var playerNames = room.players.map(function(player){
      return {id: player.id, name: player.name}
    })
    names = {dealerName: room.dealer.name, playerNames: playerNames}
    res.status(200).json(names)
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

// app.get('/home/:roomId/:playerId', (req, res)=>{
//   var roomId = Number(req.params.roomId)
//   var playerId = Number(req.params.playerId)
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
//     }
//   }

//   console.log(room)

//   res.render('home');
// })

ioController(io, gameStore);

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
