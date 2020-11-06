const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);

mongoose
    .connect('mongodb://127.0.0.1:27017/lectures', { useNewUrlParser: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db
