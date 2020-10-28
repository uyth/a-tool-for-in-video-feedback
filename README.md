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

<<<<<<< HEAD
Start MongoDB on the system:
```
sudo systemctl start mongod
```


=======
>>>>>>> 21d4a36b5d52566ca79bac1e29c33c1fb9f7f6fa
Open the MongoDB shell with the command:

```
mongo
```

<<<<<<< HEAD
Make a new database called `lectures`:

```
> use lectures
=======
Make a new database called `videos`:

```
> use videos
>>>>>>> 21d4a36b5d52566ca79bac1e29c33c1fb9f7f6fa
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