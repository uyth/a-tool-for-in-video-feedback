import React, { useEffect, useRef, useState } from 'react';
import './videoPlayer.css';

import { ButtonGroup, Dropdown, DropdownButton, Button, OverlayTrigger, Popover, Tooltip, Overlay } from 'react-bootstrap';
import ClosedCaptionIcon from '@material-ui/icons/ClosedCaption';
import ClosedCaptionOutlinedIcon from '@material-ui/icons/ClosedCaptionOutlined';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Replay10Icon from '@material-ui/icons/Replay10';
import CloseIcon from '@material-ui/icons/Close';
import Feedback from './Feedback';
import Alert from 'react-bootstrap/Alert';
import PanToolIcon from '@material-ui/icons/PanTool';
import { formatTime } from '../utils';

import { config } from '../config';
import { useParams } from 'react-router-dom';

const wsURL = config.url.WEBSOCKET_URL;
const FILE_URL = config.url.FILE_URL;

const EVENTS = {
    PLAY: "PLAY",
    PAUSE: "PAUSE",
    SKIP_INIT: "SKIP_INIT",
    SKIP_BACK: "SKIP_BACK",
    SKIP_FORWARD: "SKIP_FORWARD",
    RATECHANGE: "RATECHANGE",
    SEEK_INIT: "SEEK_INIT",
    SEEK_FORWARD: "SEEK_FORWARD",
    SEEK_BACK: "SEEK_BACK",
    OPEN_FEEDBACK: "OPEN_FEEDBACK",
    CLOSE_FEEDBACK: "CLOSE_FEEDBACK",
    MANUAL_FEEDBACK_REQUEST: "MANUAL_FEEDBACK_REQUEST",
    OPEN_LINK: "OPEN_LINK",    
    ENDED: "ENDED"
}

const BUTTON_KEYS = {
    SPACEBAR: 32,
    LEFT_KEY: 37,
    RIGHT_KEY: 39
}

const UpdatingPopover = React.forwardRef(
    ({ popper, children, show: _, ...props }, ref) => {
      useEffect(() => {
        popper.scheduleUpdate();
      }, [children, popper]);
  
      return (
        <Popover ref={ref} content {...props} id="feedback-popover">
            {children}
        </Popover>
      );
    },
);

const UpdatingTooltip = React.forwardRef(
    ({ popper, children, show: _, ...props }, ref) => {
      useEffect(() => {
        popper.scheduleUpdate();
      }, [children, popper]);
  
      return (
        <Tooltip ref={ref} content {...props}>
          {children}
        </Tooltip>
      );
    },
);

function NotPlayingOverlay({show}) {
    return show ? (
        <div id="video-not-playing-overlay">
            <span className={"circle-icon-wrapper"}><PlayArrowIcon/></span>
        </div>
    ) : null;
}

export default function VideoPlayer({videoData, title}) {   

    const ws = useRef(null);
    const [session, setSession] = useState(null);
    const { lectureId, code } = useParams();

    const [feedback, setFeedback] = useState([]);

    let [alertText, setAlertText] = useState(null);
    let [showAlert, setShowAlert] = useState(false);

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
                console.log(message.session);
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

    function logEvent(event) {
        console.log(session);
        ws.current.send(JSON.stringify(
          {
              "type": "EVENT",
              "session": session,
              "event": event        
          }
        ))
    }

    const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

    const videoContainer = useRef();
    const videoControls = useRef();
    const video = useRef();
    const fullscreenButton = useRef();
    const captionsButton = useRef();
    const timelineThumb = useRef();
    const scrubThumbnailContainer = useRef();

    // playback controllers
    const seekSlider = useRef();

    let [isSeeking, setIsSeeking] = useState(false);
    let [isPaused, setIsPaused] = useState(true);
    let [currentTime, setCurrentTime] = useState(0);
    let [duration, setDuration] = useState(0);
    let [activeCaptions, setActiveCaptions] = useState(true);
    let [playbackRate, setPlaybackRate] = useState(1);
    let [isMute, setIsMute] = useState(false);
    let [volume, setVolume] = useState(1);
    let [isFullscreen, setFullscreen] = useState(false);
    
    let [openFeedback, setOpenFeedback] = useState(false);
    
    let [showSpeedTooltip, setShowSpeedTooltip] = useState(true);
    let [showThumb, setShowThumb] = useState(false);
    let [scrubTime, setScrubTime] = useState(0);

    // init general video settings
    useEffect(() => {
        // Hide the default controls
        video.current.controls = false;

        // Display the user defined video controls
        // videoControls.current.style.display = 'block';
        
        video.current.addEventListener("loadedmetadata", () => {
            seekSlider.current.value = 0;
            setDuration(video.current.duration);
            if (!seekSlider.current.getAttribute('max')) seekSlider.current.setAttribute('max', video.current.duration);
        });

    }, [video, videoControls, seekSlider]);

    const handlePlayButtonClick = () => {
        togglePlay();
    }

    const handleRewindClick = () => {
        generateEventlog(EVENTS.SKIP_INIT);
        rewind(10);
        generateEventlog(EVENTS.SKIP_BACK);        
    }

    // init playback controller event listeners
    useEffect(() => {
        if (video && videoControls && seekSlider && session) {
            video.current.addEventListener('timeupdate', () => timeUpdate());
            video.current.addEventListener("ratechange", () => generateEventlog(EVENTS.RATECHANGE));

            document.onkeydown = (e) => {
                if (e.keyCode == BUTTON_KEYS.LEFT_KEY) {
                    e.preventDefault();
                    generateEventlog(EVENTS.SKIP_INIT);
                    rewind(10);
                    generateEventlog(EVENTS.SKIP_BACK);
                } else if (e.keyCode == BUTTON_KEYS.RIGHT_KEY) {
                    e.preventDefault();
                    generateEventlog(EVENTS.SKIP_INIT);
                    forward(10);
                    generateEventlog(EVENTS.SKIP_FORWARD);
                }
            }

            // toggle play events
            video.current.addEventListener("click", () => togglePlay());
            document.body.onkeypress = (e) => {
                if(e.keyCode == BUTTON_KEYS.SPACEBAR) {
                    e.preventDefault();
                    togglePlay();
                }
            }
            video.current.addEventListener("play", () => generateEventlog(EVENTS.PLAY));
            video.current.addEventListener("pause", () => generateEventlog(EVENTS.PAUSE));
            video.current.addEventListener("ended", () => {stopVideo(); generateEventlog(EVENTS.ENDED)});
            
            // seek events
            seekSlider.current.addEventListener('mousedown', () => {
                generateEventlog(EVENTS.SEEK_INIT);
                setIsSeeking(true);
            });
            seekSlider.current.addEventListener("change", e => {
                let timeDiff = e.target.value - video.current.currentTime;
                video.current.currentTime = e.target.value;
                setCurrentTime(e.target.value);
                generateEventlog(timeDiff > 0 ? EVENTS.SEEK_FORWARD : EVENTS.SEEK_BACK);
                if (isPaused) play();
                setIsSeeking(false);
            });
        }
    }, [video, videoControls, seekSlider, session]);

    // basic video playback

    function togglePlay() {
        if (video.current.paused || video.current.ended) play();
        else pause();
    }

    function play() {
        video.current.play();
        setIsPaused(false);
    }
    
    function pause() {
        video.current.pause();
        setIsPaused(true);
    }

    function stopVideo() {
        pause();
        video.current.currentTime = 0;
        seekSlider.current.value = 0;
    }

    function forward(seconds) {
        video.current.currentTime += seconds;
        if (video.current.paused) togglePlay();
    }

    function rewind(seconds) {
        video.current.currentTime -= seconds;
        if (video.current.paused) togglePlay();
    }

    // vido playback rate

    function handlePlaybackSelect(speed) {
        setPlaybackRate(speed);
    }

    useEffect(() => {
        video.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // video time update handling

    var timeUpdate = () => setCurrentTime(video.current.currentTime);

    useEffect(() => {
        var updateSeeker = () => {
            if (!isSeeking) seekSlider.current.value = currentTime;
        }
        updateSeeker();
    }, [currentTime, isSeeking]);

    var generateEventlog = (type, openedFeedback=null) => {
        let timeranges = [];
        for (let i = 0; i < video.current.played.length; i++) {
            timeranges.push([video.current.played.start(i), video.current.played.end(i)])
        }
        logEvent({
            eventType: type,
            timestamp: Date.now(),
            videoSnapshot: {
                currentTime: video.current.currentTime,
                duration: video.current.duration,
                paused: video.current.paused,
                playbackRate: video.current.playbackRate,
                played: timeranges,
            },
            openedFeedback: openedFeedback
        });
    }

    // // setup fullscreen support
    useEffect(() => {
        var toggleFullscreen = function(state) {
            videoContainer.current.setAttribute('data-fullscreen', state);
            setFullscreen(state);
        };
    
        var isFullScreen = function() {
            return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        };
    
        var handleFullscreen = function() {
            if (isFullScreen()) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
                toggleFullscreen(false);
            } else {
                if (videoContainer.current.requestFullscreen) videoContainer.current.requestFullscreen();
                else if (videoContainer.current.mozRequestFullScreen) videoContainer.current.mozRequestFullScreen();
                else if (videoContainer.current.webkitRequestFullScreen) videoContainer.current.webkitRequestFullScreen();
                else if (videoContainer.current.msRequestFullscreen) videoContainer.current.msRequestFullscreen();
                toggleFullscreen(true);
            }
        };

        if (fullscreenButton) {
            if (!fullScreenEnabled) {
                fullscreenButton.current.style.display = 'none';
            }
            fullscreenButton.current.addEventListener('click', () => handleFullscreen());
            document.addEventListener('fullscreenchange', () => toggleFullscreen(!!(document.fullscreen || document.fullscreenElement)));
            document.addEventListener('webkitfullscreenchange', () => toggleFullscreen(!!document.webkitIsFullScreen));
            document.addEventListener('mozfullscreenchange', () => toggleFullscreen(!!document.mozFullScreen));
            document.addEventListener('msfullscreenchange', () => toggleFullscreen(!!document.msFullscreenElement));
        }

    }, [fullScreenEnabled, fullscreenButton, videoContainer]);

    // captions
    useEffect(() => {
        if (video && captionsButton) {
            // turn off autodisplay of captions
            for (var i = 0; i < video.current.textTracks.length; i++) {
                video.current.textTracks[i].mode = 'showing';
            }
            captionsButton.current.addEventListener('click', () => {
                if (video.current.textTracks[0].mode === 'showing') {
                    video.current.textTracks[0].mode = 'hidden';
                    setActiveCaptions(false);
                } else {
                    video.current.textTracks[0].mode = 'showing'
                    setActiveCaptions(true);
                }
            })
        }
    }, [video, captionsButton]);


    // volume handlers
    function handleMuteClick() {
        setIsMute(!video.current.muted);
    }

    function handleVolumeChange(event) {
        setVolume(event.target.value);
    }

    useEffect(() => { video.current.muted = isMute }, [isMute]);
    useEffect(() => { video.current.volume = volume }, [volume]);

    function handleFeedbackRequest() {
        generateEventlog(EVENTS.MANUAL_FEEDBACK_REQUEST);
    }

    function openLink(feedback, feedbackObject) {
        video.current.pause();
        if (!isPaused) {
            setIsPaused(prev => !prev);
        }

        let openedFeedback = {
            feedback: feedback.id,
            feedbackEntry: {
                id: feedbackObject.id,
                title: feedbackObject.title,
                link: feedbackObject.link
            }
        }
        generateEventlog(EVENTS.OPEN_LINK, openedFeedback=openedFeedback);
    }

    return (
        <figure id="video-container" ref={videoContainer} data-video-paused={video ? video.paused : true} data-fullscreen="false">
            <video id="video" ref={video} crossOrigin="anonymous">
                <source src={FILE_URL + videoData.sources[0].src} type={videoData.sources[0].srctype}/>
                <track
                    src={FILE_URL + videoData.tracks[0].src} default
                    kind={videoData.tracks[0].kind}
                    srcLang={videoData.tracks[0].srclang}
                    label={videoData.tracks[0].label}
                />
            </video>
            {showAlert && 
                <div style={{
                position: "absolute",
                right: "1em",
                top: "1em",
                zIndex: 1000
                }}>
                    <Alert variant="info" dismissible onClose={() => setShowAlert(false)}>{alertText}</Alert>
                </div>
            }
            <NotPlayingOverlay show={isPaused}/>
            <div id="title-box"><h1>{title}</h1></div>
            <div id="video-controls" ref={videoControls} className="controls">
                <div id="timeline-container">
                    <Overlay target={timelineThumb} show={showThumb}>
                        <UpdatingTooltip id="thumbnail-tool-tip">
                            <div ref={scrubThumbnailContainer} style={{width: "200px", height: "113px"}}/>
                            {formatTime(scrubTime)}
                        </UpdatingTooltip>
                    </Overlay>
                    <input id="seeker" ref={seekSlider} type="range" min="0" step="1" outline="none"
                        onMouseEnter={() => setShowThumb(true)}
                        onMouseLeave={() => setShowThumb(false)}
                        onMouseMove={(e) => {
                            let rect = e.target.getBoundingClientRect();
                            let leftValue = e.clientX - rect.left;
                            timelineThumb.current.style.left = leftValue + "px";

                            let duration = video.current.duration;
                            let scrub = (e.clientX - rect.left)/(rect.right-rect.left)*duration;
                            
                            let thumbIndex = Math.floor(scrub/4);
                            try {
                                scrubThumbnailContainer.current.style.background = `url("${videoData.thumbnail}") -${(thumbIndex+1)*200}px 0px`;
                            } catch (error) {
                                console.error(error);
                            }
                            setScrubTime(scrub);
                        }}
                    />
                    <div style={{width: "100%", height: "0.25rem", position: "absolute", padding: "0 0.5rem", marginLeft: "-0.5rem", pointerEvents: "none"}}>
                        <div style={{width: "100%", height: "100%", position: "relative"}}>
                        {feedback.map((f) => (
                            <div key={f.id}
                                style={{
                                    position: "absolute",
                                    height:"inherit",
                                    left: `${f.meta.timestamp/duration*100}%`,
                                }}
                            >
                                {
                                <OverlayTrigger trigger={["hover","focus"]} rootClose={true} overlay={<Tooltip>Do you struggle with {f.meta.keywords.join(", ")}?</Tooltip>}>
                                    <div style={{display: "block", height: "inherit"}}>
                                        <OverlayTrigger trigger="click"
                                            overlay={
                                                <Popover style={{maxWidth: "none", zIndex: 2147483647, padding: 0}}>
                                                    <Popover.Title as="div" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><strong>Aid from from ViTA</strong><Button variant="light" style={{}} onClick={() => document.body.click()}><CloseIcon/></Button></Popover.Title>
                                                    <Popover.Content style={{padding: 0}}>
                                                        <div style={{maxHeight: "50vh", overflow: "auto"}}>
                                                            {<Feedback stackoverflow={f} callback={openLink}/>}
                                                        </div>
                                                    </Popover.Content>
                                                </Popover>
                                            }
                                            rootClose={true}
                                            onEnter={() => generateEventlog(EVENTS.OPEN_FEEDBACK)}
                                            onExit={() => generateEventlog(EVENTS.CLOSE_FEEDBACK)}
                                        >
                                            <span style={{
                                                // margin: "auto",
                                                marginTop: "-0.375rem",
                                                background: "#bee5eb",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                borderRadius: "0.5rem",
                                                width: "1rem",
                                                height: "1rem",
                                                pointerEvents: "auto",
                                                cursor: "pointer",
                                            }}>
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                </OverlayTrigger>
                                }
                            </div>
                        ))}
                        </div>
                    </div>
                    <span id="timeline-thumb" ref={timelineThumb} style={{position: "absolute"}}></span>
                </div>
                <div className="button-bar">
                    <ButtonGroup className="button-bar-left">
                        <OverlayTrigger overlay={<Tooltip>{isPaused ? "play" : "pause"}</Tooltip>}>
                            <button id="playpause" onClick={handlePlayButtonClick}>{isPaused ? <PlayArrowIcon/> : <PauseIcon/>}</button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>rewind 10 seconds</Tooltip>}>
                            <button id="rewind10" onClick={handleRewindClick} type="button"><Replay10Icon/></button>
                        </OverlayTrigger>
                        <div id="volume-controls">
                            <OverlayTrigger overlay={<Tooltip>{isMute?"unmute":"mute"}</Tooltip>}>
                                <button id="mute" onClick={handleMuteClick} type="button">{isMute ? <VolumeOffIcon/> : volume < 0.1 ? <VolumeMuteIcon/> :  volume < 0.5 ? <VolumeDownIcon/>: <VolumeUpIcon/>}</button>
                            </OverlayTrigger>
                            <input id="volume-slider" onChange={handleVolumeChange} type="range" min="0" max="1" step="0.1"/>
                        </div>
                        <span id="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </ButtonGroup>
                    <ButtonGroup className="button-bar-right">
                        <OverlayTrigger overlay={<Tooltip>Ask for help</Tooltip>}>
                            <button variant="outline-light" onClick={() => handleFeedbackRequest()}><PanToolIcon/> <span style={{textAlign: "middle"}}>Ask ViTA</span></button>
                        </OverlayTrigger>
                        <OverlayTrigger trigger={["hover", "focus"]} overlay={showSpeedTooltip ? <Tooltip>Change speed</Tooltip> : <div style={{display: "none"}}></div>}>
                            <DropdownButton id="playback-button"
                                drop="up"
                                title={`${playbackRate}x`}
                                variant="light"
                                onToggle={() => {showSpeedTooltip ? setShowSpeedTooltip(false) : setShowSpeedTooltip(true)}}
                                onSelect={handlePlaybackSelect}
                            >
                                <Dropdown.Item eventKey="2">2x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.75">1.75x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.5">1.5x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.25">1.25x</Dropdown.Item>
                                <Dropdown.Item eventKey="1">1x</Dropdown.Item>
                                <Dropdown.Item eventKey="0.75">0.75x</Dropdown.Item>
                                <Dropdown.Item eventKey="0.5">0.5x</Dropdown.Item>
                            </DropdownButton>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>{activeCaptions? "turn off captions":"turn on captions"}</Tooltip>}>
                            <button id="captions" ref={captionsButton} type="button">
                                {activeCaptions ? <ClosedCaptionIcon data-state="active"/> : <ClosedCaptionOutlinedIcon/>}
                            </button>
                        </OverlayTrigger>
                        <div style={{display: "none"}}>
                            <OverlayTrigger overlay={<Tooltip>{isFullscreen? "exit fullscreen": "enter fullscreen"}</Tooltip>}>
                                <button id="fs" ref={fullscreenButton} type="button" data-state="go-fullscreen">
                                    {isFullscreen ? <FullscreenExitIcon/> : <FullscreenIcon/>}
                                </button>
                            </OverlayTrigger>
                        </div>
                    </ButtonGroup>
                </div>
            </div>
        </figure>
    )
}