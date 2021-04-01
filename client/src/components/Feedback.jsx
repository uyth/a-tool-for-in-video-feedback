import React from 'react'

import { Card, Button, OverlayTrigger, Popover, Accordion, Badge } from 'react-bootstrap'
import ListGroup from 'react-bootstrap/ListGroup';
import { formatTime } from '../utils';
import HelpIcon from '@material-ui/icons/Help';

const reactStringReplace = require('react-string-replace');

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

function highlightKeywords(text, keywords) {
    let re = new RegExp(keywords.map(k => "(" + k + ")").join("|"), 'ig');
    return reactStringReplace(text, re, (match, i) => (
        <span key={i} style={{ background: 'yellow' }}>{match}</span>
    ));
}

export default function Feedback({stackoverflow}) {

    return (
        <Card style={{width: "40vw"}}>
            <Card.Body>
                <Accordion>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <h3 style={{fontSize: "1.25rem"}}>Feedback details</h3>
                        <OverlayTrigger
                           overlay={
                                <Popover style={{zIndex:2147483647, maxWidth: "20vw"}}>
                                    <Popover.Title>How does feedback work?</Popover.Title>
                                    <Popover.Content>
                                        <h4 style={{fontSize: "1rem", fontWeight:600}}>When are feedbacks triggered?</h4>
                                        <p>
                                            Feedbacks are triggered when the system has detected that you struggle based on your video navigation patterns 
                                            or when you manually asks for feedback.
                                        </p>
                                        <h4 style={{fontSize: "1rem", fontWeight:600}}>How does the system find the feedback?</h4>
                                        <p>The feedbacks uses Stack Overflow, the content from the lecture and your video navigation patterns to
                                            personalize your feedback.
                                        </p>
                                    </Popover.Content>
                                </Popover>
                            }
                        >
                            <HelpIcon/>
                        </OverlayTrigger>
                    </div>
                    <p><strong>Struggle detected</strong> at <Badge variant="primary" pill>{formatTime(stackoverflow.meta.timestamp)}</Badge></p>
                    <p><strong>Relevant keywords:</strong> {stackoverflow.meta.keywords.map(k => <><Badge pill variant="info">{k}</Badge>&nbsp;</>)}</p>
                    <Accordion.Collapse eventKey="0">
                        <>
                            <p>
                                <strong>Content extracted</strong> from &nbsp;
                                <Badge pill variant="primary">{formatTime(stackoverflow.meta.timerange[0])}</Badge>
                                &nbsp;to&nbsp;
                                <Badge pill variant="primary">{formatTime(stackoverflow.meta.timerange[1])}</Badge>
                            </p>
                            <p>
                                <strong>Content analyzed:</strong>&nbsp;
                                <q>
                                { highlightKeywords(stackoverflow.meta.text, stackoverflow.meta.keywords) }
                                </q>
                            </p>
                        </>
                    </Accordion.Collapse>
                    <Accordion.Toggle
                        as={Button}
                        variant="link"
                        eventKey="0"
                        style={{padding: 0, outline: 0, boxShadow: "none"}}
                    >
                        Show more details
                    </Accordion.Toggle>    
                </Accordion>
            </Card.Body>
            <ListGroup>
                { stackoverflow.feedback.map((f, key) => (
                <ListGroup.Item key={key}>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div>{decodeHtml(f.title)}</div>
                        <div><Button href={f.link} target="_blank">Go to source</Button></div>
                    </div>
                </ListGroup.Item>)
                )}
            </ListGroup>
        </Card>
    )
}