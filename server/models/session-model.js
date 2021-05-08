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
	},
	openedFeedback: {
		feedback: { type: Schema.Types.ObjectId, ref: 'Feedback' },
		feedbackEntry: {
			id: Number,
			title: String,
			link: String
		}
	},
	refineFeedback: {
		keyword: String,
		meta: {
			tags: [String],
			keywords: [String],
			otherKeywords: [String],
			timestamp: Number,
			timerange: [Number],
			text: String			
		}
	}
},
{timestamps: true})


const Feedback = new Schema({
	feedback: [{
		id: Number,
		title: String,
		link: String
	}],
	meta: {
		tags: [String],
		keywords: [String],
		otherKeywords: [String],
		timestamp: Number,
		timerange: [Number],
		text: String
	}
},
{timestamps: true});

const Session = new Schema({
	lecture: { type: Schema.Types.ObjectId, ref: 'Lecture'},
	events: [Event],
	feedbacks: [Feedback],
	lastFeedback: {type: Date, default: null},
	code: {type: String, default: null}
},
{timestamps: true})


module.exports = {
	Event: mongoose.model('Event', Event),
	Session: mongoose.model('Session', Session),
	Feedback: mongoose.model('Feedback', Feedback)
} 
