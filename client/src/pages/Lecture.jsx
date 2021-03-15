import React, { useState, useRef } from 'react';
import { VideoPlayer } from '../components';
import { Feedback } from '../components';

import { Container, Button, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import api from '../api'

import Alert from 'react-bootstrap/Alert';

const wsURL = "ws://localhost:3000";

export default function Lecture(props) {

  const ws = useRef(null);
  const [lecture, setLecture] = useState(null);
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState([]);
  
  let [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      const res = await api.getLectureById(props.match.params.id);
      setLecture(res.data.data);
      console.log(res.data.data);
    }
    
    fetchVideo();
  }, []);


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
            setSession(message.session);
        }
        if (message.type == "SET_FEEDBACK") {
            setFeedback(message.feedback);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 10000);
        }
    }
  })

  function FeedbackAlert() {
    if (showAlert) {
      return (
        <div style={{
          position: "absolute",
          right: "1em",
          top: "1em"
        }}>
          <Alert variant="info" dismissible onClose={() => setShowAlert(false)}>
            Struggling with the lecture? Here is some feedback from StackOverflow!
          </Alert>
        </div>)
    } else {
      return null;
    }
  }

  return (
    <Container>
      {lecture && session ?
        <>
          <h1>{lecture.title}</h1>
          <VideoPlayer videoData={lecture.video} actions={{logEvent: logEvent}} childComponents={{FeedbackAlert: FeedbackAlert}}/>
        </> : <Spinner animation="border" />
      }
      <Button onClick={() => logEvent({eventType: "MANUAL_FEEDBACK_REQUEST", videoSnapshot: {currentTime: 100}})}>Request Feedback</Button>
      <Feedback feedbacks={feedback}/>
    </Container>
  )
}