const mongoose = require('mongoose')
const { Schema } = mongoose;

const Video = new Schema({
	title: String,
})

module.exports = mongoose.model('videos', Video)
