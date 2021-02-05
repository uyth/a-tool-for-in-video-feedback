import React, { useState } from 'react';
import { VideoPlayer } from '../components';
import { Feedback } from '../components';

import { Container, Button, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import api from '../api'

const initVideoState = {
  hasLoaded: false,
  learningScore: 1.0
}

const ALPHA = 0.5;
const BASELINE = 1.0;

export default function Lecture(props) {

  const [videoState, setVideoState] = useState(initVideoState);
  const [feedbacks, setFeedbacks] = useState([]);
  const [lectureData, setLectureData] = useState(null);
  const [session, setSession] = useState(null);
  
  function addFeedback(feedback) {
    setFeedbacks([...feedbacks, ...feedback]);
  }

  async function logEvent(event) {
    await api.logVideoEvent(session, event)
    console.log(event)
  }

  function pauseVideo() {
    setVideoState({...videoState, learningScore: Math.max(videoState.learningScore-0.2, 0)});
  }
  function rewind10() {
    setVideoState({...videoState, learningScore: Math.max(videoState.learningScore-0.2, 0)});
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoState({...videoState, learningScore: Number(videoState.learningScore*(1-ALPHA)) + Number(BASELINE*ALPHA)})
    }, 1000)
    return () => clearInterval(interval);
  })


  useEffect(() => {
    async function fetchVideo() {
      const res = await api.getLectureById(props.match.params.id);
      setLectureData(res.data.data)
    }
  
    async function createSession() {
      let session = {
        lecture: props.match.params.id,
        events: [],
      }
      const res = await api.createSession(session);
      setSession(res.data.id)
    }
    
    fetchVideo();
    createSession();
  }, []);

  return (
    <Container>
      {lectureData && session ?
        <>
          <h1>{lectureData.title}</h1>
          <VideoPlayer videoData={lectureData.video} actions={{pauseVideo:pauseVideo, rewind10: rewind10, logEvent: logEvent}}/>
        </> : <Spinner animation="border" />
      }
      <DebugTool videoState={videoState} lectureData={lectureData} callback={addFeedback}/>
      <Feedback feedbacks={feedbacks}/>
    </Container>
  )
}

function DebugTool({videoState, lectureData, callback}) {
  return (
    <>
      <h2>Debugging</h2>
      <p>Score: {videoState.learningScore}</p>
      <p>Score: {lectureData ? lectureData.video.currentTime: null}</p>
      <p>
        <Button onClick={async () => {
          let payload = {
            title: lectureData.title,
            transcript: lectureData.video.tracks[0].src,
            timeRanges: [[150, 200]],
          }

          let response = await api.getFeedback(payload);
          
          console.log(response)

          let data = response.data.data;

          const { stackOverflow, keywords } = data;

          console.log(stackOverflow);
          console.log(keywords);

          let structuredStackOverflow = stackOverflow.map(s => {
            return {            
              timestamp: "2:10",
              title: s.title,
              link: s.link,
              keywords: keywords,
              timerange: ["1:20", "1:40"]
            }
          })

          callback(structuredStackOverflow)
        }
        }>Add new feedback!</Button>
      </p>
    </>
  )
}