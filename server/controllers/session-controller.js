const { Event, Session } = require('../models/session-model')
const Lecture = require('../models/lecture-model')

createSession = async (req, res) => {
    const body = req.body

    if (!body) return res.status(400).json({ success: false, error: 'You must provide a session' })

    try {
        const session = await new Session(body).save()
        await Lecture.findByIdAndUpdate({_id: body.lecture}, {$push: {sessions: session._id}}).exec()

        return res.status(201).json({ success: true, id: session._id, message: 'Session created!' })
    } catch (error) {
        return res.status(400).json({ success: false, error: error })
    }
}

updateSession = async (req, res) => {
    const body = req.body

    if (!body) return res.status(400).json({ success: false, error: 'You must provide a body to update' })

    try {
        const event = await new Event(body).save();
        const session = await Session.findByIdAndUpdate({ _id: req.params.id }, {$push: {events: event}});
        await session.save();

        return res.status(200).json({ success: true, id: session._id, message: 'Session updated!' })
    } catch (error) {
        return res.status(404).json({error: error, message: "Session not updated"})
    }
}

deleteSession = async (req, res) => {
    try {
        await Session.findOneAndDelete({ _id: req.params.id }, async (err, session) => {
            if (!session) throw new Error("Could not find session")
            const lecture = await Lecture.findByIdAndUpdate({_id: session.lecture}, {$pull: {sessions: session._id}});
            if (!lecture) throw new Error("Could not remove session from lecture");
        });
        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(400).json({ success: false, error: error })
    }

}

getSessionById = async (req, res) => {
    try {
        const session = await Session.findById({_id: req.params.id })
        if (!session) {
            return res.status(404).json({ success: false, error: `Session not found` })
        }
        return res.status(200).json({sucess: true, data: session})
    } catch (error) {
        return res.status(400).json({ success: false, error: error })
    }
}

getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({}).exec();
        if (!sessions.length) {
            return res
                .status(404)
                .json({ success: false, error: `Sessions not found` })
        }
        return res.status(200).json({sucess: true, data: sessions})
    } catch (error) {
        return res.status(400).json({ success: false, error: error })
    }
}


module.exports = {
    createSession,
    updateSession,
    deleteSession,
    getSessionById,
    getSessions
}