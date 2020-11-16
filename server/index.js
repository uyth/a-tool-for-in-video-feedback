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

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

// serve static files
app.use(express.static('public'))