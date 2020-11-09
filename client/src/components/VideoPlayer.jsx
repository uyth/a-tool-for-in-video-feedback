import React, { useEffect, useState } from 'react';
import './videoPlayer.css';

import { ButtonGroup } from 'react-bootstrap'
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

    const [supportsVideo, setSupportsVideo] = useState(false);
    const [fullScreenEnabled, setFullscreenEnabled] = useState(false);

    const [videoContainer, setVideoContainer] = useState(null);
    const [video, setVideo] = useState(null);
    const [videoControls, setVideoControls] = useState(null);
    const [fullscreen, setFullscreen] = useState(null);
    const [captions, setCaptions] = useState(null);
    
    // playback controllers
    const [playpause, setPlayPause] = useState(null);
    const [stop, setStop] = useState(null);
    const [rewind10, setRewind10] = useState(null);
    const [progress, setProgress] = useState(null);
    const [progressBar, setProgressBar] = useState(null);
    const [playbackFaster, setPlaybackFaster] = useState(null)
    const [playbackSlower, setPlaybackSlower] = useState(null)

    // volume controllers
    const [mute, setMute] = useState(null);
    const [volinc, setVolinc] = useState(null);
    const [voldec, setVoldec] = useState(null);

    // check if it supports html5
    useEffect(() => {
        setSupportsVideo(!!document.createElement('video').canPlayType);
        setFullscreenEnabled(!!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen));
    }, []);

    // set controllers
    useEffect(() => {
        setVideoContainer(document.getElementById('videoContainer'))
        setVideo(document.getElementById('video'))
        setVideoControls(document.getElementById('video-controls'))
        setFullscreen(document.getElementById('fs'))
        setCaptions(document.getElementById('captions'))

        // playback controls
        setPlayPause(document.getElementById('playpause'))
        setStop(document.getElementById('stop'))
        setRewind10(document.getElementById('rewind10'))
        setProgress(document.getElementById('progress'))
        setProgressBar(document.getElementById('progress-bar'))
        setPlaybackFaster(document.getElementById('playback-faster'))
        setPlaybackSlower(document.getElementById('playback-slower'))
        
        // volume controls
        setMute(document.getElementById('mute'))
        setVolinc(document.getElementById('volinc'))
        setVoldec(document.getElementById('voldec'))
    }, [supportsVideo])

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
        if (video && videoControls && captions) {
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
    }, [video, videoControls, captions])

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
        if (video && progress) {
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
            progress.addEventListener("click", function(e) {
                actions.logEvent(generateEventlog(EVENTS.PROGRESS_CLICK))
            }) 
            progress.addEventListener("mouseenter", function(e) {
                actions.logEvent(generateEventlog("MOUSE_ENTER"))
            })
            progress.addEventListener("mouseleave", function(e) {
                actions.logEvent(generateEventlog("MOUSE_LEAVE"))
            })
            progress.addEventListener("mousedown", function(e) {
                actions.logEvent(generateEventlog("MOUSE_DOWN"))
            })
        }
    }, [video, progress])

    // init video controllers event listeners
    useEffect(() => {
        if (video && videoControls && playpause && stop && rewind10 
            && progress && progressBar && playbackFaster && playbackSlower) {
            // Hide the default controls
            video.controls = false;

            // Display the user defined video controls
            videoControls.style.display = 'block';

            playpause.addEventListener('click', function(e) {
                if (video.paused || video.ended) video.play();
                else video.pause();
            });
            stop.addEventListener('click', function(e) {
                video.pause();
                video.currentTime = 0;
                progress.value = 0;
            });
            rewind10.addEventListener('click', function(e) {
                video.currentTime -= 10;
            })
            video.addEventListener('loadedmetadata', function() {
                progress.setAttribute('max', video.duration);
            });
            video.addEventListener('timeupdate', function() {
                progress.value = video.currentTime;
                progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
            });
            video.addEventListener('timeupdate', function() {
                if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
                progress.value = video.currentTime;
                progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
            });
            progress.addEventListener('click', function(e) {
                var pos = (e.pageX  - this.offsetLeft) / this.offsetWidth;
                video.currentTime = pos * video.duration;
            });
            playbackFaster.addEventListener('click', function(e) {
                alterPlayback('+')
            })
            playbackSlower.addEventListener('click', function(e) {
                alterPlayback('-')
            })
            var alterPlayback = function(dir) {
                if (dir === "+") {
                    if (video.playbackRate < 2) video.playbackRate += 0.25;
                } else if (dir === "-") {
                    if (video.playbackRate > 0.5) video.playbackRate -= 0.25;
                }
            }
        }
    }, [video, videoControls, playpause, stop, rewind10, progress, progressBar, playbackFaster, playbackSlower])

    // init volume event listeners
    useEffect(() => {
        if (video && videoControls && volinc && voldec && mute) {
            mute.addEventListener('click', function(e) {
                video.muted = !video.muted;
            });
            volinc.addEventListener('click', function(e) {
                alterVolume('+');
            });
            voldec.addEventListener('click', function(e) {
                alterVolume('-');
            });
            var alterVolume = function(dir) {
                var currentVolume = Math.floor(video.volume * 10) / 10;
                if (dir === '+') {
                    if (currentVolume < 1) video.volume += 0.1;
                } else if (dir === '-') {
                    if (currentVolume > 0) video.volume -= 0.1;
                }
            }
        }
    }, [voldec, volinc, video, videoControls, mute])

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
                <div className="progress">
                    <progress id="progress" value="0" min="0"><span id="progress-bar"/></progress>
                </div>
                <div className="button-bar">
                    <ButtonGroup className="button-bar-left">
                        <button id="playpause" data-state="play" onClick={() => actions.pauseVideo()}>{video && video.paused ? <PlayArrowIcon/> : <PauseIcon/>}</button>
                        <button id="stop" type="button" data-state="stop"><StopIcon/></button>
                        <button id="rewind10" type="button" data-state="replay" onClick={() => actions.rewind10()}><Replay10Icon/></button>
                        <span id="time-display">{video && formatTime(video.currentTime)} : {video && formatTime(video.duration)}</span>
                    </ButtonGroup>
                    <ButtonGroup className="button-bar-left">
                        <div id="playback-display">
                            <button id="playback-slower" type="button" data-state="playback-slower"><RemoveIcon/></button>
                            <span id="playback-label">{video && video.playbackRate}x</span>
                            <button id="playback-faster" type="button" data-state="playback-faster"><AddIcon/></button>
                        </div>
                        <div>
                            <button id="voldec" type="button" data-state="voldown"><RemoveIcon/></button>
                            <button id="mute" type="button" data-state="mute">{video && video.muted ? <VolumeOffIcon/> : video && video.volume < 0.1 ? <VolumeMuteIcon/> :  video && video.volume < 0.5 ? <VolumeDownIcon/>: <VolumeUpIcon/>}</button>
                            <button id="volinc" type="button" data-state="volup"><AddIcon/></button>
                        </div>
                        <button id="captions" type="button" data-state="captions"><ClosedCaptionIcon/></button>
                        <button id="fs" type="button" data-state="go-fullscreen"><FullscreenIcon/></button>
                    </ButtonGroup>
                </div>
            </div>
        </figure>

    )
}