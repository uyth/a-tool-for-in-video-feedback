var formatTime = function(seconds) {
    if (seconds) return new Date(seconds * 1000).toISOString().substr(14, 5);
    else return "00:00";
}

export { formatTime };