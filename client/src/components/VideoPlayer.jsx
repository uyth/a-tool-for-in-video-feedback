import React, { useEffect } from 'react';
import './videoPlayer.css';

import { ButtonGroup, DropdownButton, Dropdown, SplitButton } from 'react-bootstrap'
import ClosedCaptionIcon from '@material-ui/icons/ClosedCaption';
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Replay10Icon from '@material-ui/icons/Replay10';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const EVENTS = {
    PLAY: "PLAY",
    PAUSE: "PAUSE",
    REWIND10: "REWIND10",
    FORWARD10: "FORWARD10",
    SEEKING: "SEEKING",
    SEEKED: "SEEKED",
    RATECHANGE: "RATECHANGE",
    PROGRESS_CLICK: "PROGRESS_CLICK"
}

var formatTime = function(seconds) {
    if (seconds) return new Date(seconds * 1000).toISOString().substr(14, 5);
    else return "00:00"
}

export default function VideoPlayer({videoData, actions}) {   

    const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

    const videoContainer = document.getElementById('videoContainer');
    const videoControls = document.getElementById('video-controls')
    const video = document.getElementById('video')
    const fullscreen = document.getElementById('fs')
    const captions = document.getElementById('captions')

    // playback controllers
    const playpause = document.getElementById('playpause');
    const stop = document.getElementById('stop');
    const rewind10 = document.getElementById('rewind10');
    const seeker = document.getElementById('seeker');
    let seekerMouseDown = false;
    
    // volume controllers
    const mute = document.getElementById('mute');
    const volumeSlider = document.getElementById('volume-slider');

    // setup fullscreen support
    useEffect(() => {
        var setFullscreenData = function(state) {
            videoContainer.setAttribute('data-fullscreen', !!state);
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
                setFullscreenData(false);
            }
            else {
                if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
                else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
                else if (videoContainer.webkitRequestFullScreen) videoContainer.webkitRequestFullScreen();
                else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
                setFullscreenData(true);
            }
        };

        if (fullscreen) {
            if (!fullScreenEnabled) {
                fullscreen.style.display = 'none';
            }
            fullscreen.addEventListener('click', function(e) {
                handleFullscreen();
            });
            document.addEventListener('fullscreenchange', function(e) {
                setFullscreenData(!!(document.fullscreen || document.fullscreenElement));
            });
            document.addEventListener('webkitfullscreenchange', function() {
                setFullscreenData(!!document.webkitIsFullScreen);
            });
            document.addEventListener('mozfullscreenchange', function() {
                setFullscreenData(!!document.mozFullScreen);
            });
            document.addEventListener('msfullscreenchange', function() {
                setFullscreenData(!!document.msFullscreenElement);
            });
        }

    }, [fullScreenEnabled, fullscreen, videoContainer])

    useEffect(() => {
        if (video && captions) {
            // turn off autodisplay of captions
            for (var i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = 'showing';
            }
            
            captions.setAttribute("data-state", "active");
            captions.addEventListener('click', function(e) {
                if (video.textTracks[0].mode === 'showing') {
                    video.textTracks[0].mode = 'hidden'
                    captions.setAttribute("data-state", "disabled");
                } else {
                    captions.setAttribute("data-state", "active");
                    video.textTracks[0].mode = 'showing'
                }
            })
        }
    }, [video, captions])

    // log events
    useEffect(() => {
        var generateEventlog = (type) => {
            return {
                eventType: type,
                eventTimestamp: Date.now(),
                videoSnapshot: {
                    currentTime: video.currentTime,
                    duration: video.duration,
                    paused: video.paused,
                    playbackRate: video.playbackRate,
                    played: video.played,
                }
            }
        }
        if (video && seeker) {
            video.addEventListener("play", function(e) {
                actions.logEvent(generateEventlog(EVENTS.PLAY))
            })
            video.addEventListener("pause", function(e) {
                actions.logEvent(generateEventlog(EVENTS.PAUSE))
            })
            video.addEventListener("ratechange", function(e) {
                actions.logEvent(generateEventlog(EVENTS.RATECHANGE))
            })
            video.addEventListener("seeking", function(e) {
                actions.logEvent(generateEventlog(EVENTS.SEEKING))
            })
            video.addEventListener("seeked", function(e) {
                actions.logEvent(generateEventlog(EVENTS.SEEKED))
            })
            seeker.addEventListener("click", function(e) {
                actions.logEvent(generateEventlog(EVENTS.PROGRESS_CLICK))
            }) 
            seeker.addEventListener("mouseenter", function(e) {
                actions.logEvent(generateEventlog("MOUSE_ENTER"))
            })
            seeker.addEventListener("mouseleave", function(e) {
                actions.logEvent(generateEventlog("MOUSE_LEAVE"))
            })
            seeker.addEventListener("mousedown", function(e) {
                actions.logEvent(generateEventlog("MOUSE_DOWN"))
            })
        }
    }, [video, seeker])

    function togglePlay() {
        if (video.paused || video.ended) video.play();
        else video.pause();
    }

    function stopVideo() {
        video.pause();
        video.currentTime = 0;
        seeker.value = 0;
    }

    function rewindVideo(seconds) {
        video.currentTime -= seconds;
    }

    function videoTimeUpdate() {
        if (!seeker.getAttribute('max')) seeker.setAttribute('max', video.duration);
        seeker.value = video.currentTime;
    }

    function handlePlaybackSelect(speed) {
        video.playbackRate = speed;
    }

    function handlePlaybackClick() {
        video.playbackRate = video.playbackRate == 2 ? 0.5 : video.playbackRate + 0.25
    }

    // init video controllers event listeners
    useEffect(() => {
        if (video && videoControls && playpause && stop && rewind10 && seeker) {
            // Hide the default controls
            video.controls = false;
            
            seeker.value = 0;
            video.addEventListener('loadedmetadata', function() {
                seeker.setAttribute('max', video.duration);
            });

            // Display the user defined video controls
            videoControls.style.display = 'block';

            playpause.addEventListener('click', function(e) {
                togglePlay();
            });
            video.addEventListener("click", function(e) {
                togglePlay();
            })
            
            stop.addEventListener('click', function(e) {
                stopVideo();
            });
            rewind10.addEventListener('click', function(e) {
                rewindVideo(10);
            })
            video.addEventListener('timeupdate', function() {
                videoTimeUpdate();
            });
            function scrub(e) {
                var pos = (e.pageX - seeker.offsetLeft) / seeker.offsetWidth;
                video.currentTime = pos * video.duration;
            }
            seeker.addEventListener('mousedown', () => { seekerMouseDown = true });
            seeker.addEventListener('mouseup', () => { seekerMouseDown = false });
            seeker.addEventListener('mousemove', (e) => {seekerMouseDown && scrub(e)});
            seeker.addEventListener('click', (e) => scrub(e));
        }
    }, [video, videoControls, playpause, stop, rewind10, seeker, seekerMouseDown])

    // init volume event listeners
    useEffect(() => {
        if (video && videoControls && mute && volumeSlider) {
            mute.addEventListener('click', function(e) {
                video.muted = !video.muted;
            });
            volumeSlider.addEventListener("change", function (e) {
                video.volume = volumeSlider.value;
            })
        }
    }, [video, videoControls, mute, volumeSlider])

    return (
        <figure id="videoContainer" data-fullscreen="false">
            <video id="video" preload="auto">
                <source src={videoData.sources[0].src} type={videoData.sources[0].srctype}/>
                <track
                    src={videoData.tracks[0].src} default
                    kind={videoData.tracks[0].kind}
                    srcLang={videoData.tracks[0].srclang}
                    label={videoData.tracks[0].label}
                />
            </video>
            <div id="video-controls" className="controls" data-state="hidden">
                <div className="timeline">
                    <input id="seeker" type="range" min="0"/>
                </div>
                <div className="button-bar">
                    <ButtonGroup className="button-bar-left">
                        <button id="playpause" data-state="play" onClick={() => actions.pauseVideo()}>{video && video.paused ? <PlayArrowIcon/> : <PauseIcon/>}</button>
                        <button id="stop" type="button" data-state="stop"><StopIcon/></button>
                        <button id="rewind10" type="button" data-state="replay" onClick={() => actions.rewind10()}><Replay10Icon/></button>
                        <span id="time-display">{video && formatTime(video.currentTime)} / {video && formatTime(video.duration)}</span>
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
                                title={`${video && video.playbackRate}x`}
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
                            <button id="mute" type="button" data-state="mute">{video && video.muted ? <VolumeOffIcon/> : video && video.volume < 0.1 ? <VolumeMuteIcon/> :  video && video.volume < 0.5 ? <VolumeDownIcon/>: <VolumeUpIcon/>}</button>
                            <input id="volume-slider" type="range" min="0" max="1" step="0.1"/>
                        </div>
                        <button id="captions" type="button" data-state="captions"><ClosedCaptionIcon/></button>
                        <button id="fs" type="button" data-state="go-fullscreen"><FullscreenIcon/></button>
                    </ButtonGroup>
                </div>
            </div>
        </figure>

    )
}