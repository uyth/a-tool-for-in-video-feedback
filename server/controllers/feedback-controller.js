const fs = require('fs');
const axios = require('axios');

const rakejs = require('@shopping24/rake-js');

const natural = require('natural');
const { TfIdf } = natural;

const vfile = require('vfile');
const retext = require('retext');
const pos = require('retext-pos');
const retextKeywords = require('retext-keywords');
const toString = require('nlcst-to-string');
const sw = require('stopword');

const { stopwords, instrucationalWords } = require('../utils/stopwords');

const domainStopwords = [...stopwords, ...instrucationalWords];

const sentenceTokenizer = new natural.SentenceTokenizer();
const wordTokenizer = new natural.AggressiveTokenizer();

const MIN_KEYWORD_SCORE = 0.1;

getFeedback = async (req, res) => {

    const { title, transcript, timeRanges } = req.body;

    const vttObject = generateVttObject(transcript);
    const filteredVttObject = filterVtt(vttObject, timeRanges);
    const wholeText = extractVttContent(vttObject);
    const targetText = extractVttContent(filteredVttObject);

    const rakeKeywordsLocal = extractKeywordsWithRake(vttObject, timeRanges).slice(0, 20);
    const rakeKeywordsGlobal = extractKeywordsWithRake(vttObject, null).slice(0, 20);

    let keywords = rakeKeywordsLocal.slice(0, 1).map(k => k.keyword);

    const stackoverflow = await searchStackOverflow(keywords)

    console.log(stackoverflow)

    return res.status(200).json({
        success: true,
        message: "Feedback was successful",
        data: {
            title: title,
            wholeText: wholeText,
            targetText: targetText,
            stackOverflow: stackoverflow,
            keywords: keywords,
            rakeKeywordsLocal: rakeKeywordsLocal,
            rakeKeywordsGlobal: rakeKeywordsGlobal,
        },
    })
}

const generateVttObject = function (path) {
    let data = readVtt(path);
    return formatVttToObject(data);
}

const readVtt = function (path) {
    return fs.readFileSync(`public${path}`, "utf-8", function (err, data) {
    // return fs.readFileSync(`${path}`, "utf-8", function (err, data) {
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
            object.content = item.slice(2).join(" ");
            return object;
        });
}

const convertVttTimeToSeconds = (vttTime) => {
    return Number(vttTime.substr(0, 2)) * 3600 + Number(vttTime.substr(3, 2)) * 60 + Number(vttTime.substr(6, 2));
}


const extractKeywordsWithRake = function (vttObject, timeRanges) {
    if (timeRanges) vttObject = filterVtt(vttObject, timeRanges);

    let text = extractVttContent(vttObject);

    let keywords = rakejs.extract(text.toLowerCase())
        .setOptions({ stopWords: domainStopwords, maxKeyWordsPerPhrase: 2 })
        .pipe(rakejs.extractKeyPhrases)
        .pipe(rakejs.keywordLengthFilter)
        .pipe(rakejs.distinct)
        .pipe(rakejs.scoreWordFrequency)
        .pipe(rakejs.sortByScore)
        .result;

    let maxScore = keywords[0].score;

    keywords = keywords
        .map(k => { return { keyword: k.phrase, score: k.score / maxScore } })
        .filter(k => k.score > MIN_KEYWORD_SCORE);

    return keywords;
}

const extractVttContent = (vttObject) => {
    return vttObject.reduce((acc, item) => acc.concat(` ${item.content}`), "");
}

const extractKeywordsWithTfIdf = function (vttObject, timeRanges) {
    let tfidf = new TfIdf();

    let filteredVttObject = filterVtt(vttObject, timeRanges);
    let content = extractVttContent(filteredVttObject);
    tfidf.addDocument(preProcessText(content));

    let text = extractVttContent(vttObject);
    let sentences = sentenceTokenizer.tokenize(text);

    sentences.forEach((sentence) => {
        sentence = preProcessText(sentence);
        if (sentence) tfidf.addDocument(sentence);
    })

    let maxTfidf = tfidf.listTerms(0)[0].tfidf;

    let keywords = tfidf.listTerms(0)
        .map(k => { return { keyword: k.term, score: k.tfidf / maxTfidf } })
        .filter(k => k.score > MIN_KEYWORD_SCORE);

    return keywords;
}

const preProcessText = (text) => {
    return sw.removeStopwords(wordTokenizer.tokenize(text.toLowerCase()), domainStopwords);
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

const searchStackOverflow = async function (keywords, tagged) {
    const response = await axios.get("https://api.stackexchange.com/2.2/search/advanced", {
        params: {
            site: "stackoverflow",
            sort: "relevance",
            order: "desc",
            pagesize: 10,
            accepted: true,
            q: keywords.join(" "),
            tagged: tagged,
        }
    });

    let questions = response.data["items"];

    questions = questions.map(q => {
        return {
            id: q.question_id,
            title: q.title,
            link: q.link,
        }
    });

    return questions;
}

testRetext = async (req, res) => {

    const { path } = req.body;
    const keywords = extractKeywordsWithRetext(path);

    return res.status(400).json({
        success: true,
        message: "Feedback was successful",
        data: {
            keywords: keywords,
        },
    });
}

const extractKeywordsWithRetext = async (vttObject, timeRanges) => {
    if (timeRanges) vttObject = filterVtt(vttObject, timeRanges);
    let file = vfile();
    let text = extractVttContent(vttObject);

    file.contents = text.toLowerCase();

    file = await retext()
        .use(pos)
        .use(retextKeywords, options = { maximum: 10 })
        .process(file);

    let keywords = file.data.keywords
        .map(k => { return { keyword: toString(k.matches[0].node), score: k.score } })
        .filter(k => !stopwords.includes(k.keyword));

    let maxScore = keywords[0].score;

    let keyphrases = file.data.keyphrases
        .map(p => { return { phrase: p.matches[0].nodes.map(toString), score: p.score } })
        .filter(p => p.phrase.length > 1)
        .map(p => { return { keyword: p.phrase.join(""), score: p.score } })
        // .map(p => { return { keyword: p.phrase.join(""), score: maxScore } })


    keywords = keywords
        .map(k => { return { keyword: k.keyword, score: k.score / maxScore } })
        .filter(k => k.score > MIN_KEYWORD_SCORE);

    keywords = keywords.concat(keyphrases);
    
    return keywords;
}


module.exports = {
    getFeedback
}