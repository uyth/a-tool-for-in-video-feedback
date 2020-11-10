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

Start MongoDB on the system:
```
sudo systemctl start mongod
```


**ALternative 1: Empty database**

Open the MongoDB shell with the command:

```
mongo
```

Make a new database called `lectures`:

```
> use lectures
```

**Alternative 2: Prepopulated database**

In the root of the project, run the command
```
mongorestore dump/
```

MongoDB should now be populated with some example material.


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

## Client

### Setup

In the client folder, install packages:

```
npm install
```

### Start up client

In the client folder, install packages:
```
npm start
```

