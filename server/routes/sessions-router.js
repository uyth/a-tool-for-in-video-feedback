const express = require('express')

const SessionController = require('../controllers/session-controller')

const router = express.Router()

router.post('/sessions', SessionController.createSession)
router.patch('/sessions/:id', SessionController.updateSession)
router.delete('/sessions/:id', SessionController.deleteSession)
router.get('/sessions/:id', SessionController.getSessionById)
router.get('/sessions', SessionController.getSessions)

module.exports = router