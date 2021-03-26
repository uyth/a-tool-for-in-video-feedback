import React from 'react'

import { Card, Button, OverlayTrigger, Popover, Accordion } from 'react-bootstrap'
import ListGroup from 'react-bootstrap/ListGroup';

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

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

export default function Feedback({stackoverflow}) {
    return (
        <Card style={{width: "40vw"}}>
            <Card.Body>
                <Accordion>
                    <Accordion.Toggle
                        as={Button}
                        variant="link"
                        eventKey="0"
                        defaultActiveKey="0"
                        style={{padding: 0, outline: 0, boxShadow: "none"}}
                    >
                        Why this feedback?
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <>
                            <p>Timerange: {stackoverflow.meta.timerange.join("-")}</p>
                            <p>Timestamp: {stackoverflow.meta.timestamp}</p>
                            <p>Content analyzed: {stackoverflow.meta.text}</p>
                            <p>Keywords: {stackoverflow.meta.keywords}</p>
                        </>
                    </Accordion.Collapse>
                </Accordion>
            </Card.Body>
            <ListGroup>
                { stackoverflow.feedback.map((f, key) => (
                <ListGroup.Item key={key}>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div>{decodeHtml(f.title)}</div>
                        <div><Button href={f.link}>Go to source</Button></div>
                    </div>
                </ListGroup.Item>)
                )}
            </ListGroup>
        </Card>
    )
}