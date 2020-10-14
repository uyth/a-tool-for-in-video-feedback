const mongoose = require('mongoose')
const { Schema } = mongoose;

const Lecture = new Schema({
	title: String,
})

module.exports = mongoose.model('lecture', Lecture)
