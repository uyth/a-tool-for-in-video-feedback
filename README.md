# A Tool For In-Video Feedback

The focus of this system is to develop a proper interface and
visualization technology to support struggling students in the
video lectures.

## Server

Requirements:
*   MongoDB
*   Node
*   npm


### Setup

#### MongoDB setup

Open the MongoDB shell with the command:

```
mongo
```

Make a new database called `videos`:

```
> use videos
```


#### Server setup

Install required packages with npm:

```
npm install
```


### Start the server

Start the server:

```
npx nodemon index.js
```