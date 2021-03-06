const { Event, Session } = require('../models/session-model')
const Lecture = require('../models/lecture-model')

const { extractKeywordsFromVtt } = require('../utils/keyword-extraction');

createSession = async (socket, body) => {
    let response;
    try {
        const session = await new Session(body).save()
        await Lecture.findByIdAndUpdate({_id: body.lecture}, {$push: {sessions: session._id}}).exec()
        response = { type: "SET_SESSION_ID", session: session._id, message: 'Session created' };
    } catch (error) {
        console.log(error)
        response = {error: error, message: "Session not created"}
    }
    socket.send(JSON.stringify(response));
}

processEvent = async (socket, data) => {
    console.log("event: " + data.event.eventType + " at time " + data.event.videoSnapshot.currentTime);
    try {
        let event = await new Event(data.event).save();
        let session = await Session.findByIdAndUpdate({ _id: data.session }, {$push: {events: event}});
        await session.save();

        let struggling = false;
        if (event.eventType == "PAUSE") struggling = true;
        else if (event.eventType == "RATECHANGE") {
            let currentSnapshot = event.videoSnapshot;
            let prevSnapshot = session.events[session.events.length-1].videoSnapshot;
            struggling = currentSnapshot.playbackRate < prevSnapshot.playbackRate;
        } else if (event.eventType == "SKIP_BACK") {
            struggling = true;
        }
        if (struggling) sendFeedback(socket, data);
    } catch (error) {
        console.log("Could not update session");
        return {error: error, message: "Session not updated"}
    }
}

async function sendFeedback(socket, data) {
    let times = []
    times.push(Date.now()) // TIME LOGGING
    let timestamp = data.event.videoSnapshot.currentTime;
    let stackOverflow = await searchStackOverflow(data.session, timestamp);
    times.push(Date.now()) // TIME LOGGING
    console.log("search time: "+ Number(times[1]-times[0]))
    socket.send(JSON.stringify({"type": "SET_FEEDBACK", "feedback": stackOverflow}))
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