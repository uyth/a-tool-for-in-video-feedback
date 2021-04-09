const mongoose = require('mongoose')
const { Schema } = mongoose;

const Lecture = new Schema({
	title: String,
	courseId: { type: Schema.Types.ObjectId, ref: 'Course'},
	video: {
		sources: [{
			src: String,
			srctype: String,
		}],
		tracks: [{
			kind: String,
			src: String,
			srclang: String,
			label: String
		}],
		thumbnail: String
	},
	tags: [String],
	sessions: [{ type: Schema.Types.ObjectId, ref: 'Session'}]
})

module.exports = mongoose.model('Lecture', Lecture)