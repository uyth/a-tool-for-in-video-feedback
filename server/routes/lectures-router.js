const express = require('express')

const LectureController = require('../controllers/lecture-controller')

const router = express.Router()

router.post('/lectures', LectureController.createLecture)
router.put('/lectures/:id', LectureController.updateLecture)
router.delete('/lectures/:id', LectureController.deleteLecture)
router.get('/lectures/:id', LectureController.getLectureById)
router.get('/lectures', LectureController.getLectures)

module.exports = router