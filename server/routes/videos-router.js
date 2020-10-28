const express = require('express')

const VideoController = require('../controllers/video-controller')

const router = express.Router()

router.post('/videos', VideoController.createVideo)
router.put('/videos/:id', VideoController.updateVideo)
router.delete('/videos/:id', VideoController.deleteVideo)
router.get('/videos/:id', VideoController.getVideoById)
router.get('/videos', VideoController.getVideos)

module.exports = router