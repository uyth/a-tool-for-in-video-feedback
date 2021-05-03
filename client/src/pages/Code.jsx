import React from 'react';

import { Container } from 'react-bootstrap';


export default function Code() {
    function generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    return (
        <Container style={{maxWidth: "80%", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
            <h1 style={{textAlign: "center"}}>Code: {generateID()}</h1>
        </Container>
    )
}