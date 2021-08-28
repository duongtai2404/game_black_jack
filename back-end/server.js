const express = require('express')
const app = express()
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})