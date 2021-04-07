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
  }, [lecture]);


  useEffect(() => {
    ws.current.onmessage = e => {
        let message = JSON.parse(e.data);
        if (message.type == "SET_SESSION_ID") {
            setSession(message.session);
        }
        if (message.type == "SET_FEEDBACK") {
            setFeedback([message.data, ...feedback]);
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
    <Container style={{maxWidth: "70%"}}>
      {lecture && session ?
        <>
          <h1>{lecture.title}</h1>
          <VideoPlayer videoData={lecture.video} actions={{logEvent: logEvent}} childComponents={{FeedbackAlert: FeedbackAlert}} feedback={feedback}/>
        </> : <Spinner animation="border" />
      }
    </Container>
  )
}