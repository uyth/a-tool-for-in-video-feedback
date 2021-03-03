const fs = require('fs');

const rakejs = require('@shopping24/rake-js');
const { stopwords, instrucationalWords } = require('./stopwords');
const domainStopwords = [...stopwords, ...instrucationalWords];

const MIN_SCORE_THRESHOLD = 0.1;
const MAX_AMOUNT_KEYWORDS = 1;
const MAX_WORDS_PER_KEYWORD = 2;

const extractKeywordsFromVtt = function (vttPath, timeRanges) {

    let vttObject = generateVttObject(vttPath)
    if (timeRanges) vttObject = filterVtt(vttObject, timeRanges);

    let text = extractVttCaptions(vttObject).toLowerCase();

    let keywords = rakejs.extract(text)
        .setOptions({ stopWords: domainStopwords, maxKeyWordsPerPhrase: MAX_WORDS_PER_KEYWORD })
        .pipe(rakejs.extractKeyPhrases)
        .pipe(rakejs.keywordLengthFilter)
        .pipe(rakejs.distinct)
        .pipe(rakejs.scoreWordFrequency)
        .pipe(rakejs.sortByScore)
        .result;

    let highestKeywordScore = keywords[0].score;

    keywords = keywords
        .map(k => { return { keyword: k.phrase, score: k.score / highestKeywordScore } })
        .filter(k => k.score > MIN_SCORE_THRESHOLD)
        .slice(0, MAX_AMOUNT_KEYWORDS).map(k => k.keyword)

    return keywords;
}

const generateVttObject = function (vttPath) {
    let data = readVtt(vttPath);
    return formatVttToObject(data);
}

const readVtt = function (path) {
    return fs.readFileSync(`public${path}`, "utf-8", function (err, data) {
        if (err) {
            return console.log(err);
        }
    });
}

const formatVttToObject = (vtt) => {
    return vtt.split("\n\n")
        .map(item => item.split("\n"))
        .filter(item => item.length > 1)
        .map(item => {
            let object = {};
            object.index = Number(item[0]);
            object.start = convertVttTimeToSeconds(item[1].substr(0, 12));
            object.end = convertVttTimeToSeconds(item[1].substr(17, 12));
            object.caption = item.slice(2).join(" ");
            return object;
        });
}

const convertVttTimeToSeconds = (vttTime) => {
    return Number(vttTime.substr(0, 2)) * 3600 + Number(vttTime.substr(3, 2)) * 60 + Number(vttTime.substr(6, 2));
}

const filterVtt = function (vttObject, timeRanges) {
    if (timeRanges) {
        vttObject = vttObject.filter(
            segment => timeRanges.some(timeRange => isOverlappingRanges(segment.start, segment.end, timeRange[0], timeRange[1]))
        );
    }
    return vttObject;
}

const isOverlappingRanges = function (start1, end1, start2, end2) {
    return start1 <= end2 && start2 <= end1;
}

const extractVttCaptions = (vttObject) => {
    return vttObject.reduce((acc, item) => acc.concat(` ${item.caption}`), "");
}

exports.extractKeywordsFromVtt = extractKeywordsFromVtt