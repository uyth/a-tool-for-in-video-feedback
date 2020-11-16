const express = require('express')

const FeedbackController = require('../controllers/feedback-controller')

const router = express.Router()

router.post('/feedback', FeedbackController.getFeedback)

module.exports = router