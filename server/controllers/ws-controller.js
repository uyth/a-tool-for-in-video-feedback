const { Event, Session } = require('../models/session-model')
const Lecture = require('../models/lecture-model')

const { extractKeywordsFromVtt } = require('../utils/keyword-extraction');

createSession = async (body) => {

    try {
        const session = await new Session(body).save()
        await Lecture.findByIdAndUpdate({_id: body.lecture}, {$push: {sessions: session._id}}).exec()
        return { type: "SET_SESSION_ID", session: session._id, message: 'Session created' }
    } catch (error) {
        console.log(error)
        return {error: error, message: "Session not created"}
    }
}

updateSession = async (sessionId, body) => {

    try {
        const event = await new Event(body).save();
        const session = await Session.findByIdAndUpdate({ _id: sessionId }, {$push: {events: event}});
        await session.save();
        return { success: true, id: session._id, message: 'Session updated!' }
    } catch (error) {
        return {error: error, message: "Session not updated"}
    }
}

const axios = require('axios');

searchStackOverflow = async function (sessionId, timestamp, tagged) {
    let keywords = await extractKeywords(sessionId, timestamp);
    let response = await axios.get("https://api.stackexchange.com/2.2/search/advanced", {
            params: {
                site: "stackoverflow",
                sort: "relevance",
                order: "desc",
                pagesize: 10,
                accepted: true,
                q: keywords.join(" "),
                tagged: tagged,
            }
        });


    let questions = response.data["items"];

    questions = questions.map(q => {
        return {
            timestamp: timestamp,
            timerange: ["1:20", "1:40"],
            id: q.question_id,
            title: q.title,
            link: q.link,
            keywords: keywords
        }
    });

    return questions;
}

extractKeywords = async (sessionId, timestamp) => {
    try {
        let session = await Session.findById({_id: sessionId})
        let lecture = await Lecture.findById({_id: session.lecture})

        let vttPath = lecture.video.tracks[0].src
        let keywords = extractKeywordsFromVtt(vttPath, [[timestamp-10, timestamp+10]])

        return keywords;
    } catch (error) {
        console.log("ERROR extracting")
        console.log(error)
        return []
    }
}

module.exports = {
    createSession,
    updateSession,
    searchStackOverflow
}