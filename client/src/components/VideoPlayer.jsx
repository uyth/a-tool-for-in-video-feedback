import React, { useEffect, useRef, useState } from 'react';
import './videoPlayer.css';

import { ButtonGroup, Dropdown, SplitButton } from 'react-bootstrap'
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

const EVENTS = {
    PLAY: "PLAY",
    PAUSE: "PAUSE",
    SKIP_INIT: "SKIP_INIT",
    SKIP_BACK: "SKIP_BACK",
    SKIP_FORWARD: "SKIP_FORWARD",
    RATECHANGE: "RATECHANGE",
    SEEK_START: "SEEK_START",
    SEEK_END: "SEEK_END"
}

const BUTTON_KEYS = {
    SPACEBAR: 32,
    LEFT_KEY: 37,
    RIGHT_KEY: 39
}

var formatTime = function(seconds) {
    if (seconds) return new Date(seconds * 1000).toISOString().substr(14, 5);
    else return "00:00";
}

export default function VideoPlayer({videoData, actions}) {   

    const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

    const videoContainer = useRef();
    const videoControls = useRef();
    const video = useRef();
    const fullscreenButton = useRef();
    const captionsButton = useRef();

    // playback controllers
    const playpauseButton = useRef();
    const stopButton = useRef();
    const rewind10Button = useRef();
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
    let [seekValue, setSeekValue] = useState(0);

    // volume controllers
    const muteButton = useRef();
    const volumeSlider = useRef();

    // init general video settings
    useEffect(() => {
        // Hide the default controls
        video.current.controls = false;

        // Display the user defined video controls
        videoControls.current.style.display = 'block';

        seekSlider.current.value = 0;
        if (!seekSlider.current.getAttribute('max')) seekSlider.current.setAttribute('max', video.current.duration);

        video.current.addEventListener("loadeddata", () => setDuration(video.current.duration));

    }, [video, videoControls, seekSlider]);

    // init playback controller event listeners
    useEffect(() => {
        if (video && videoControls && playpauseButton && stopButton && rewind10Button && seekSlider) {
            video.current.addEventListener('timeupdate', () => timeUpdate());
            video.current.addEventListener("ratechange", () => generateEventlog(EVENTS.RATECHANGE));

            // skip events
            rewind10Button.current.addEventListener('click', () => {
                generateEventlog(EVENTS.SKIP_INIT);
                rewind(10);
                generateEventlog(EVENTS.SKIP_BACK);
            });
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
            playpauseButton.current.addEventListener('click', () => togglePlay());
            video.current.addEventListener("click", () => togglePlay());
            document.body.onkeypress = (e) => {
                if(e.keyCode == BUTTON_KEYS.SPACEBAR) {
                    e.preventDefault();
                    togglePlay();
                }
            }
            stopButton.current.addEventListener('click', () => stopVideo());
            video.current.addEventListener("play", () => generateEventlog(EVENTS.PLAY));
            video.current.addEventListener("pause", () => generateEventlog(EVENTS.PAUSE));
            
            // seek events
            seekSlider.current.addEventListener('mousedown', () => {
                generateEventlog(EVENTS.SEEK_START);
                setIsSeeking(true);
            });
            seekSlider.current.addEventListener("change", e => setSeekValue(e.target.value));
            seekSlider.current.addEventListener('mouseup', () => setIsSeeking(false));
            seekSlider.current.addEventListener("click", () => generateEventlog(EVENTS.SEEK_END));
        }
    }, [video, videoControls, playpauseButton, stopButton, rewind10Button, seekSlider]);


    var generateEventlog = (type) => {
        let timeranges = [];
        for (let i = 0; i < video.current.played.length; i++) {
            timeranges.push([video.current.played.start(i), video.current.played.end(i)])
        }
        actions.logEvent({
            eventType: type,
            timestamp: Date.now(),
            videoSnapshot: {
                currentTime: video.current.currentTime,
                duration: video.current.duration,
                paused: video.current.paused,
                playbackRate: video.current.playbackRate,
                played: timeranges,
            }
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

    function handlePlaybackClick() {
        setPlaybackRate(video.current.playbackRate == 2 ? 0.5 : video.current.playbackRate + 0.25);
    }

    useEffect(() => {
        video.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // video time update handling

    var timeUpdate = () => setCurrentTime(video.current.currentTime);

    useEffect(() => {
        var handleTimeUpdate = () => {
            if (!isSeeking) seekSlider.current.value = currentTime;
        }
        handleTimeUpdate();
    }, [currentTime, isSeeking]);

    // handle seek

    useEffect(() => {
        var handleSeek = () => {
            if (!isSeeking) {
                seekSlider.current.value = seekValue;
                if (isPaused) play();
            }
        }
        handleSeek();
    }, [isSeeking, seekValue]);

    useEffect(() => {
        var handleSeek = () => {
            video.current.currentTime = seekValue;
        }
        handleSeek();
    }, [seekValue]);

    // init volume event listeners
    useEffect(() => {
        if (video && videoControls && muteButton && volumeSlider) {
            muteButton.current.addEventListener('click', () => setIsMute(!video.current.muted));
            volumeSlider.current.addEventListener("change", () => setVolume(volumeSlider.current.value));
        }
    }, [video, videoControls, muteButton, volumeSlider]);

    useEffect(() => { video.current.muted = isMute }, [isMute]);
    useEffect(() => { video.current.volume = volume }, [volume]);

    return (
        <figure id="video-container" ref={videoContainer} data-video-paused={video ? video.paused : true} data-fullscreen="false">
            <video id="video" ref={video}>
                <source src={videoData.sources[0].src} type={videoData.sources[0].srctype}/>
                <track
                    src={videoData.tracks[0].src} default
                    kind={videoData.tracks[0].kind}
                    srcLang={videoData.tracks[0].srclang}
                    label={videoData.tracks[0].label}
                />
            </video>
            <div id="video-controls" ref={videoControls} className="controls">
                <div id="timeline-container">
                    <input id="seeker" ref={seekSlider} type="range" min="0" step="1" outline="none"/>
                </div>
                <div className="button-bar">
                    <ButtonGroup className="button-bar-left">
                        <button id="playpause" ref={playpauseButton}>{isPaused ? <PlayArrowIcon/> : <PauseIcon/>}</button>
                        <button id="stop" ref={stopButton} type="button"><StopIcon/></button>
                        <button id="rewind10" ref={rewind10Button} type="button"><Replay10Icon/></button>
                        <span id="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </ButtonGroup>
                    <ButtonGroup className="button-bar-right">
                        <div id="playback-container">
                            <SplitButton
                                id={"playback-speed"}
                                as={ButtonGroup}
                                drop={"up"}
                                variant="light"
                                onClick={handlePlaybackClick}
                                onSelect={handlePlaybackSelect}
                                title={`${playbackRate}x`}
                            >
                                <Dropdown.Item eventKey="2">2x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.75">1.75x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.5">1.5x</Dropdown.Item>
                                <Dropdown.Item eventKey="1.25">1.25x</Dropdown.Item>
                                <Dropdown.Item eventKey="1">1x</Dropdown.Item>
                                <Dropdown.Item eventKey="0.75">0.75x</Dropdown.Item>
                            </SplitButton>
                        </div>
                        <div id="volume-controls">
                            <button id="mute" ref={muteButton} type="button">{isMute ? <VolumeOffIcon/> : volume < 0.1 ? <VolumeMuteIcon/> :  volume < 0.5 ? <VolumeDownIcon/>: <VolumeUpIcon/>}</button>
                            <input id="volume-slider" ref={volumeSlider} type="range" min="0" max="1" step="0.1"/>
                        </div>
                        <button id="captions" ref={captionsButton} type="button">
                            {activeCaptions ? <ClosedCaptionIcon data-state="active"/> : <ClosedCaptionOutlinedIcon/>}
                        </button>
                        <button id="fs" ref={fullscreenButton} type="button" data-state="go-fullscreen">
                            {isFullscreen ? <FullscreenExitIcon/> : <FullscreenIcon/>}
                        </button>
                    </ButtonGroup>
                </div>
            </div>
        </figure>
    )
}