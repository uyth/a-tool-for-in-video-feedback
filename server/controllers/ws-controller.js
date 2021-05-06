const { Event, Session, Feedback } = require('../models/session-model')
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

        let needFeedback = !hasFeedbackNearTimestamp(session, data);
        
        if (!needFeedback && event.eventType == "MANUAL_FEEDBACK_REQUEST") {
            socket.send(JSON.stringify({
                type: "NO_FEEDBACK_NEED",
            }));
        } else if (needFeedback) {
            if (event.eventType == "PAUSE") handlePauseEvent(socket, data);
            else if (event.eventType == "RATECHANGE") handleRatechange(socket, data);
            else if (event.eventType == "SKIP_BACK") handleSkipBack(socket, data);
            else if (event.eventType == "SKIP_FORWARD") handleSkipForward(socket, data);
            else if (event.eventType == "SEEK_BACK") handleSeekBack(socket, data);
            else if (event.eventType == "MANUAL_FEEDBACK_REQUEST") sendFeedback(socket, data);
        }

    } catch (error) {
        console.log("Could not update session");
    }
}

hasFeedbackNearTimestamp = (session, data) => {
    return session.feedbacks.some((f) => {
        let timerange = f.meta.timerange;
        let currentTime = data.event.videoSnapshot.currentTime;
        return timerange[0] <= currentTime && currentTime <= timerange[1];
    })
}

handlePauseEvent = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastMinuteEvents = filterLastEvents(session, 60);
        let pauseCount = lastMinuteEvents.reduce(((count, event) => count + (event.eventType=="PAUSE" ? 1 : 0)), 0);
        if (pauseCount > 8) sendFeedback(socket, data);
    }, 2000)

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
        let last10SecondEvents = filterLastEvents(session, 10);
        
        let firstSkipInit = last10SecondEvents.find(e => e.eventType == "SKIP_INIT");
        let lastSkipBack = last10SecondEvents.reverse().find(e => e.eventType == "SKIP_BACK");
        
        let skipBackDuration = firstSkipInit.videoSnapshot.currentTime - lastSkipBack.videoSnapshot.currentTime;
        
        if (isRewatching(lastSkipBack.videoSnapshot)) {
            sendFeedback(socket, data);
        } else if (skipBackDuration > 30) {
            sendFeedback(socket, data);
        }
    }, 3000);
}

isRewatching = (snapshot) => {
    return snapshot.played.some(time => time[0] <= snapshot.currentTime && snapshot.currentTime <= time[1]);
}

handleSkipForward = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let lastMinuteEvents = filterLastEvents(session, 60);
    
        let skipCount = lastMinuteEvents.reduce(((count, event) => count + (event.eventType=="SKIP_FORWARD" ? 1 : 0)), 0);

        if (skipCount < 3) sendFeedback(socket, data);
    }, 5000);
}

handleSeekBack = (socket, data) => {
    setTimeout(async () => {
        let session = await Session.findById(data.session);
        let last10Seconds = filterLastEvents(session, 10);
        
        let seekInit = last10Seconds.find(e => e.eventType == "SEEK_INIT");
        let seekBack = last10Seconds.reverse().find(e => e.eventType == "SEEK_BACK");
        
        let seekCount = last10Seconds.reduce((count, event) => count + (event.eventType=="SEEK_BACK" ? 1 : 0),0);

        let replayLength = seekInit.videoSnapshot.currentTime - seekBack.videoSnapshot.currentTime;

        if (replayLength > 30 && seekCount < 3) {
            sendFeedback(socket, data);
        }
    }, 3000);
}


async function sendFeedback(socket, data) {
    let times = []
    times.push(Date.now()) // TIME LOGGING
    let session = await Session.findById(data.session);
    
    // restrict throughput of feedback
    if (session.lastFeedback == null || session.lastFeedback.getTime() + MILLIS_IN_SECONDS*3 < Date.now()) {
        await Session.findByIdAndUpdate({_id: data.session}, {lastFeedback: Date.now()}).exec();
        let lastEvent = session.events[session.events.length-1];
        let timestamp = lastEvent.videoSnapshot.currentTime;
        
        let stackOverflow = await searchStackOverflow(session.lecture, timestamp);
        times.push(Date.now()) // TIME LOGGING
        console.log("search time: "+ Number(times[1]-times[0]))
        let feedback = await Feedback.create(stackOverflow);
        await Session.findByIdAndUpdate({_id: data.session}, {$push: {feedbacks: feedback}}).exec();
        socket.send(JSON.stringify({
            type: "SET_FEEDBACK",
            data: {
                id: feedback._id,
                meta: feedback.meta,
                feedback: feedback.feedback
            }
        }));
    }
}

const axios = require('axios');

searchStackOverflow = async function (lectureId, timestamp) {
    let keywords = await extractKeywords(lectureId, timestamp);
    let response = await axios.get("https://api.stackexchange.com/2.2/search/advanced", {
        params: {
            site: "stackoverflow",
            sort: "relevance",
            order: "desc",
            pagesize: 10,
            accepted: true,
            q: keywords.keywords.join(" "),
            tagged: keywords.tags.join(";"),
        }
    });


    let questions = response.data["items"];

    questions = questions.map(q => {
        return {
            id: q.question_id,
            title: q.title,
            link: q.link,
        }
    });

    return {
        feedback: questions,
        meta: {
            tags: keywords.tags,
            keywords: keywords.keywords,
            timestamp: timestamp,
            timerange: keywords.meta.timerange,
            text: keywords.meta.text
        }
    };
}

extractKeywords = async (lectureId, timestamp) => {
    try {
        let lecture = await Lecture.findById({_id: lectureId});

        let vttPath = lecture.video.tracks[0].src;
        let timerange = [Math.max(timestamp-10, 0), timestamp+10];
        let keywords = extractKeywordsFromVtt(vttPath, [timerange]);

        return {
            keywords: keywords.keywords,
            tags: lecture.tags,
            meta: {
                timerange: timerange,
                lecture: lectureId,
                text: keywords.meta.text
            }
        };
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