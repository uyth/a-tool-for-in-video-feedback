const express = require('express')

const CourseController = require('../controllers/course-controller')

const router = express.Router()

router.post('/courses', CourseController.createCourse)
router.put('/courses/:id', CourseController.updateCourse)
router.delete('/courses/:id', CourseController.deleteCourse)
router.get('/courses/:id', CourseController.getCourseById)
router.get('/courses', CourseController.getCourses)

module.exports = router