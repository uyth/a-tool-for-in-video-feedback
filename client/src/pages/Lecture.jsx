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

const initFeedbacks = [
  {
      timestamp: "1:25",
      title: "Feedback 1",
      content: "This is a feedback",
      keywords: ["python", "inheritance"]
  },
]

export default function Lecture(props) {

  const [videoState, setVideoState] = useState(initVideoState);
  const [feedbacks, setFeedbacks] = useState(initFeedbacks);
  const [lectureData, setLectureData] = useState(null);
  const [session, setSession] = useState(null);

  function addFeedback(feedback) {
    setFeedbacks([...feedbacks, feedback]);
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
      <Metrics score={videoState.learningScore} callback={addFeedback}/>
      <Feedback feedbacks={feedbacks}/>
    </Container>
  )
}

function Metrics({score, callback}) {
  return (
    <>
      <h2>Learning metrics</h2>
      <p>Score: {score}</p>
      <p>
        <Button onClick={() => callback({
          timestamp: "2:10",
          title: "Feedback Title",
          content: "Hello, I was added by the button",
          keywords: ["python", "something"]
        })}>Add new feedback!</Button>
      </p>
    </>
  )
}