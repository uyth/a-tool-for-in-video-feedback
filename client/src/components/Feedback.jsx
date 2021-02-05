import React from 'react'

import { Card, Button, OverlayTrigger, Popover } from 'react-bootstrap'

function FeedbackCard({props}) {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Text>Keywords: {props.keywords.join(", ")}</Card.Text>
                <div>
                    <Button variant="primary" href={props.link}>Go to source</Button>
                    <OverlayTrigger trigger="focus" placement="top" overlay={
                        <Popover>
                            <Popover.Title as="h3">Why this feedback?</Popover.Title>
                            <Popover.Content>
                                <p>Based on the timerange: {props.timerange.join(" - ")}</p>
                                <p>Based on keywords: {props.keywords.join(", ")}</p>
                                <p>Triggered @{props.timestamp}</p>
                            </Popover.Content>
                        </Popover>                    
                    }>
                        <Button variant="secondary">Why this feedback?</Button>
                    </OverlayTrigger>
                </div>
            </Card.Body>
        </Card>
    )
}

export default function Feedback({feedbacks}) {
    return (
        <>
            { feedbacks.map((f, key) => <FeedbackCard key={key} props={f}/>) }
        </>
    )
}