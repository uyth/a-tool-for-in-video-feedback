import React, { useState, useRef } from 'react';
import { VideoPlayer } from '../components';

import { Container, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import api from '../api'

import Alert from 'react-bootstrap/Alert';

import { useParams } from 'react-router-dom';

import { config } from '../config';

const wsURL = config.url.WEBSOCKET_URL;

export default function Lecture(props) {

  const { lectureId, code } = useParams();

  const ws = useRef(null);
  const [lecture, setLecture] = useState(null);
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState([]);

  let [alertText, setAlertText] = useState(null);
  let [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      const res = await api.getLectureById(lectureId);
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
                  "lecture": lectureId,
                  "code": code
              }
          }
      ))
    }
  }, []);


  useEffect(() => {
    ws.current.onmessage = e => {
        let message = JSON.parse(e.data);
        if (message.type == "SET_SESSION_ID") {
            setSession(message.session);
        }
        if (message.type == "SET_FEEDBACK") {
            setFeedback([message.data, ...feedback]);
            setAlertText("Struggling with the lecture? Here is some feedback from StackOverflow!");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 10000);
          }
          if (message.type == "NO_FEEDBACK_NEED") {
            setShowAlert(true);
            setAlertText("You have already received feedback about this!");
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
          top: "1em",
          zIndex: 1000
        }}>
          <Alert variant="info" dismissible onClose={() => setShowAlert(false)}>{alertText}</Alert>
        </div>)
    } else {
      return null;
    }
  }

  return (
    <Container style={{maxWidth: "80%", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
      {lecture && session ?
        <>
          <VideoPlayer videoData={lecture.video} title={lecture.title} actions={{logEvent: logEvent}} childComponents={{FeedbackAlert: FeedbackAlert}} feedback={feedback}/>
        </> : <Spinner animation="border" />
      }
    </Container>
  )
}