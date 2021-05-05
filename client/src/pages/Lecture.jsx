import React, { useState, useRef } from 'react';
import { VideoPlayer } from '../components';

import { Container, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import api from '../api'

import { useParams } from 'react-router-dom';

export default function Lecture(props) {
  
  const [lecture, setLecture] = useState(null);
  const { lectureId, code } = useParams();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    async function fetchVideo() {
      const res = await api.getLectureById(lectureId);
      setLecture(res.data.data);
      console.log(res.data.data);
    }
    
    fetchVideo();
  }, []);

  useEffect(() => {
    var timer = setInterval(() => setTime(new Date(), 1000));

    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <div style={{background: "#f8f8f8", height: "100vh"}}>
      <span style={{color: "grey", height: "5vh"}}>{`${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`}</span>
      <Container style={{maxWidth: "80%", height: "95vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
        {lecture ?
          <>
            <VideoPlayer videoData={lecture.video} title={lecture.title}/>
          </> : <Spinner animation="border" />
        }
      </Container>
    </div>
  )
}