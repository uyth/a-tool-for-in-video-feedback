import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import api from '../api'
import { Feedback } from '../components';

export default function Session() {
    const { code } = useParams();

    const [session, setSession] = useState(null);

    useEffect(() => {
        async function fetchSession() {
          const res = await api.findSession(code);
          setSession(res.data.data);
          console.log(res.data.data);
        }
        
        fetchSession();
    }, []);

    return (
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f0f0"
        }}
        >
                <h1>Analyze session: {code}!</h1>
                {session && <h2>Session loaded</h2>}
                {session && session.events.filter(e => e.eventType=="OPEN_FEEDBACK").map(e => (
                    <div>{JSON.stringify(e)}</div>
                ))}
                {session && session.feedbacks.map(f => (
                    <Feedback stackoverflow={f}/>
                ))}
        </div>
    );
}
