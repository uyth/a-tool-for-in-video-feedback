import React from 'react'

import { Card } from 'react-bootstrap'

function FeedbackCard({props}) {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Text>{props.timestamp} {props.content}</Card.Text>
                <Card.Text>Based on keywords: {props.keywords.join(", ")}</Card.Text>
            </Card.Body>
        </Card>
    )
}

export default function Feedback({feedbacks}) {

    return (
        <>
            <h2>Feedback</h2>
            { feedbacks.map((f, key) => <FeedbackCard key={key} props={f}/>) }
        </>
    )
}