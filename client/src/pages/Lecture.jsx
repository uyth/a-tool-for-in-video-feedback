import React, { useState } from 'react';
import { VideoPlayer } from '../components';
import { Feedback } from '../components';

import { Container, Button } from 'react-bootstrap';
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
  const [videoData, setVideoData] = useState(null);

  function addFeedback(feedback) {
    setFeedbacks([...feedbacks, feedback]);
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
    fetchVideo()
  }, []);

  async function fetchVideo() {
    const res = await api.getLectureById(props.match.params.id);
    setVideoData(res.data.data.video)
  }

  return (
    <Container>
      <h1>{videoData ? videoData.title : "loading"}</h1>
      <VideoPlayer videoData={videoData} actions={{pauseVideo:pauseVideo, rewind10: rewind10}}/>
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