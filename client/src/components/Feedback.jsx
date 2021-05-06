import React, {useState} from 'react';

import { Card, Button, OverlayTrigger, Popover, Accordion, Badge } from 'react-bootstrap'
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';

import { formatTime } from '../utils';
import HelpIcon from '@material-ui/icons/Help';

const reactStringReplace = require('react-string-replace');

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

function VitaExplanation() {
    return (
        <OverlayTrigger
            placement="bottom"
            overlay={
                <Popover style={{zIndex:2147483647, maxWidth: "20vw"}}>
                    <Popover.Title>How does ViTA work?</Popover.Title>
                    <Popover.Content>
                        <h4 style={{fontSize: "1rem", fontWeight:600}}>Why am I given aid?</h4>
                        <p>
                            ViTA detects when you struggle based on your video navigation patterns 
                            or when you manually asks for help and tries to aid you with best effort.
                        </p>
                        <h4 style={{fontSize: "1rem", fontWeight:600}}>Where does the aid come from?</h4>
                        <p>ViTA searches Stack Overflow and personalizes your aid based on the content you struggle with.</p>
                    </Popover.Content>
                </Popover>
            }
        >
            <HelpIcon/>
        </OverlayTrigger>
    )
}

export function FeedbackModal({show, stackoverflow, handleClose, callback}) {

    const [showMoreFeedback, setShowMoreFeedback] = useState(false);

    function closeModal() {
        handleClose();
        setShowMoreFeedback(false);
    }

    return (
        <Modal show={show} centered size="lg" onHide={closeModal}>
            <Modal.Header closeButton>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <h3 style={{fontSize: "1.25rem"}}>Aid from ViTA</h3>
                    <VitaExplanation/>
                </div>
            </Modal.Header>
            <Modal.Body style={{maxHeight: "70vh", overflow: "auto"}}>
                <Accordion>
                    <p><strong>Struggle detected</strong> at <Badge variant="primary" pill>{formatTime(stackoverflow.meta.timestamp)}</Badge></p>
                    <p><strong>Relevant keywords:</strong> {stackoverflow.meta.keywords.map(k => <Badge key={k} pill variant="info">{k}</Badge>)}</p>
                    <p><strong>Lecture tags:</strong> {stackoverflow.meta.tags.map(t => <Badge key={t} pill variant="info">{t}</Badge>)}</p>
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
                <h3 style={{fontSize: "1.3rem", fontWeight: 500}}>Stack Overflow Threads:</h3>
                <ListGroup>
                {stackoverflow.feedback.slice(0, 5).map((f) => (
                    <ListGroup.Item key={f.id}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div>{decodeHtml(f.title)}</div>
                            <div><Button onClick={() => callback(stackoverflow, f)} href={f.link} target="_blank">Go to source</Button></div>
                        </div>
                    </ListGroup.Item>)
                )}
                </ListGroup>
                {showMoreFeedback && stackoverflow.feedback.slice(5).map((f) => (
                    <ListGroup.Item key={f.id}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div>{decodeHtml(f.title)}</div>
                            <div><Button onClick={() => callback(stackoverflow, f)} href={f.link} target="_blank">Go to source</Button></div>
                        </div>
                    </ListGroup.Item>)
                )}
                <Button variant="link" style={{outline: 0, boxShadow: "none", padding: 0}} onClick={() => setShowMoreFeedback(prev => !prev)}
                >{showMoreFeedback ? "Show less aid" : "Show more aid"}</Button>
            </Modal.Body>
        </Modal>
    )
}


export default function Feedback({stackoverflow, callback}) {

    return (
        <Card style={{width: "40vw"}}>
            <Card.Body>
                <Accordion>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <h3 style={{fontSize: "1.25rem"}}>Aid details</h3>
                        <VitaExplanation/>
                    </div>
                    <p><strong>Struggle detected</strong> at <Badge variant="primary" pill>{formatTime(stackoverflow.meta.timestamp)}</Badge></p>
                    <p><strong>Relevant keywords:</strong> {stackoverflow.meta.keywords.map(k => <Badge key={k} pill variant="info">{k}</Badge>)}</p>
                    <p><strong>Lecture tags:</strong> {stackoverflow.meta.tags.map(t => <Badge key={t} pill variant="info">{t}</Badge>)}</p>
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
                { stackoverflow.feedback.map((f) => (
                <ListGroup.Item key={f.id}>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div>{decodeHtml(f.title)}</div>
                        <div><Button onClick={() => callback(stackoverflow, f)} href={f.link} target="_blank">Go to source</Button></div>
                    </div>
                </ListGroup.Item>)
                )}
            </ListGroup>
        </Card>
    )
}