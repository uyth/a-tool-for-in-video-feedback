const { Event, Session } = require('../models/session-model')
const Lecture = require('../models/lecture-model')

const { extractKeywordsFromVtt } = require('../utils/keyword-extraction');

const MILLIS_IN_SECONDS = 1000;

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

        if (event.eventType == "PAUSE") handlePauseEvent(socket, data);
        else if (event.eventType == "RATECHANGE") handleRatechange(socket, data)
        else if (event.eventType == "SKIP_BACK") handleSkipBack(socket, data);
        else if (event.eventType == "SKIP_FORWARD") handleSkipForward(socket, data);

    } catch (error) {
        console.log("Could not update session");
    }
}

handlePauseEvent = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastEvent = session.events[session.events.length-1];
        if (lastEvent.eventType == "PAUSE") sendFeedback(socket, data);
    }, 5000);
}

handleRatechange = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastEvents = filterLastEvents(session, 5);

        let firstRatechange = lastEvents.find(e => e.eventType=="RATECHANGE");

        let ratechangeIndex;
        for (var i = 0; i < session.events.length; i++) {
            ratechangeIndex = i;
            if (firstRatechange == session.events[i]) break;
        }

        let prevSnapshot = session.events[ratechangeIndex-1].videoSnapshot;
        let currentSnapshot = session.events[session.events.length-1].videoSnapshot;

        let isStruggling = currentSnapshot.playbackRate < prevSnapshot.playbackRate;

        if (isStruggling) sendFeedback(socket, data);
    }, 5000);
}

filterLastEvents = (session, seconds) => {
    let lastEvent = session.events[session.events.length-1];
    return session.events.filter(e => e.timestamp.getTime() + MILLIS_IN_SECONDS*seconds >= lastEvent.timestamp.getTime());
}

handleSkipBack = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastEvents = filterLastEvents(session, 10);
        
        let lastSkipBack = lastEvents.reverse().find(e => e.eventType == "SKIP_BACK");

        let snapshot = lastSkipBack.videoSnapshot;
        if (snapshot.played.some(seg => hasWatchedSegment(snapshot.currentTime, seg[0], seg[1]))) {
            sendFeedback(socket, data);
        }
    }, 3000);
}

hasWatchedSegment = (currentTime, start, end) => {
    return start <= currentTime && currentTime <= end;
} 

handleSkipForward = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastMinuteEvents = filterLastEvents(session, 60)
    
        let skipCount = lastMinuteEvents.reduce(((count, event) => count + (event.eventType=="SKIP_FORWARD" ? 1 : 0)), 0);

        if (skipCount < 3) sendFeedback(socket, data);
    }, 5000);
}

async function sendFeedback(socket, data) {
    let times = []
    times.push(Date.now()) // TIME LOGGING
    let session = await Session.findById(data.session);
    let lastEvent = session.events[session.events.length-1];
    let timestamp = lastEvent.videoSnapshot.currentTime;
    
    let stackOverflow = await searchStackOverflow(session.lecture, timestamp);
    times.push(Date.now()) // TIME LOGGING
    console.log("search time: "+ Number(times[1]-times[0]))
    socket.send(JSON.stringify({"type": "SET_FEEDBACK", "feedback": stackOverflow}))
}

const axios = require('axios');

searchStackOverflow = async function (lectureId, timestamp, tagged) {
    let keywords = await extractKeywords(lectureId, timestamp);
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

extractKeywords = async (lectureId, timestamp) => {
    try {
        let lecture = await Lecture.findById({_id: lectureId})

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
    processEvent,
}