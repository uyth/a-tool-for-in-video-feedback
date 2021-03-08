const mongoose = require('mongoose')
const { Schema } = mongoose;

const Event = new Schema({
	eventType: String,
	timestamp: Date,
	videoSnapshot: {
		currentTime: Number,
		duration: Number,
		paused: Boolean,
		playbackRate: Number,
		played: [[Number]]
	}
},
{timestamps: true})

const Session = new Schema({
	lecture: { type: Schema.Types.ObjectId, ref: 'Lecture'},
	events: [Event]
},
{timestamps: true})


module.exports = {
	Event: mongoose.model('Event', Event),
	Session: mongoose.model('Session', Session)
} 
