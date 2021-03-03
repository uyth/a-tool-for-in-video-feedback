import React, { useState, useRef } from 'react';
import { VideoPlayer } from '../components';
import { Feedback } from '../components';

import { Container, Button, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import api from '../api'

const wsURL = "ws://localhost:3000";

export default function Lecture(props) {

  const ws = useRef(null);
  const [lecture, setLecture] = useState(null);
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState([]);
  

  useEffect(() => {
    async function fetchVideo() {
      const res = await api.getLectureById(props.match.params.id);
      setLecture(res.data.data)
      console.log(res.data.data)
    }
    
    fetchVideo();
  }, []);

  function addFeedback(newFeedback) {
    setFeedback([...feedback, ...newFeedback]);
  }

  async function logEvent(event) {
    ws.current.send(JSON.stringify(
      {
          "type": "EVENT",
          "session": session,
          "event": event        
      }
    ))
  }

  useEffect(() => {
    ws.current = new WebSocket(wsURL);
    ws.current.onopen = () => initSession();
    ws.current.onclose = () => console.log("ws closed");

    return () => {
        ws.current.close();
    };
    
    function initSession() {
      console.log("Init Session")
      ws.current.send(JSON.stringify(
          {
              "type": "INIT_SESSION",
              "data": {
                  "lecture": props.match.params.id
              }
          }
      ))
    }
  }, [lecture]);


  useEffect(() => {
    ws.current.onmessage = e => {
        let message = JSON.parse(e.data);
        if (message.type == "SET_SESSION_ID") {
            setSession(message.session)
        }
        if (message.type == "SET_FEEDBACK") {
            setFeedback(message.feedback)
        }
    }
  })

  return (
    <Container>
      {lecture && session ?
        <>
          <h1>{lecture.title}</h1>
          <VideoPlayer videoData={lecture.video} actions={{logEvent: logEvent}}/>
        </> : <Spinner animation="border" />
      }
      <DebugTool lectureData={lecture} callback={addFeedback}/>
      <Feedback feedbacks={feedback}/>
    </Container>
  )
}

function DebugTool({lectureData, callback}) {
  return (
    <>
      <h2>Debugging</h2>
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
          
          console.log(JSON.stringify(structuredStackOverflow))

          callback(structuredStackOverflow)
        }
        }>Add new feedback!</Button>
      </p>
    </>
  )
}