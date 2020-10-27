const mongoose = require('mongoose')
const { Schema } = mongoose;

const Lecture = new Schema({
	title: String,
	courseId: { type: Schema.Types.ObjectId, ref: 'Course'},
	video: {
		videoUrl: String,
		captions: {
			captionsUrl: String,
			language: String,
			label: String
		}
	}
})

module.exports = mongoose.model('Lecture', Lecture)