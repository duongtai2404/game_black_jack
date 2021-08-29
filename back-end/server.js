const express = require('express')
const app = express()
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index', { text: 'hello world'});
})

app.get('/player', (req,res) => {
    res.render('player');
})

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})