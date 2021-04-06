const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./db')
const lecturesRouter = require('./routes/lectures-router')
const coursesRouter = require('./routes/courses-router')
const sessionsRouter = require('./routes/sessions-router')
const feedbackRouter = require('./routes/feedback-router')

const app = express()
const apiPort = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/api', lecturesRouter)
app.use('/api', coursesRouter)
app.use('/api', sessionsRouter)
app.use('/api', feedbackRouter)

app.use(express.static('public')) // serve static files

const server = app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

const ws = require('ws');
const wsController = require('./controllers/ws-controller')

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    })}
)

function generateID() {
  return '_' + Math.random().toString(36).substr(2, 9);
};

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  let ID = generateID();
  console.log("connected to user:" + ID);
  socket.on('message', payload => receiveMessage(ID, payload, socket));
  socket.on('close', () => console.log('connection closed'))
})

async function receiveMessage(ID, payload, socket) {
    let data = JSON.parse(payload);
    console.log("receiving message")
    console.log("Type of data: " + data.type)
    if (data.type == "INIT_SESSION") {
        await wsController.createSession(socket, data.data);
    } else if (data.type == "EVENT") {
        await wsController.processEvent(socket, data);
    }
    console.log("");
}

wsServer.on('close', () => {
  console.log("disconnected");
})
