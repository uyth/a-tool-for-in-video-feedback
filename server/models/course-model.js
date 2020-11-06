const mongoose = require('mongoose')
const { Schema } = mongoose;

const Course = new Schema({
	title: String,
	courseCode: String,
	lectures: [{ type: Schema.Types.ObjectId, ref: 'Lecture'}]
})

module.exports = mongoose.model('Course', Course)