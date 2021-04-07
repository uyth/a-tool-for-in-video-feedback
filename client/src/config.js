// Constants.js
const prod = {
  url: {
    API_URL: "http://stud210302.idi.ntnu.no:3000/api",
    FILE_URL: "http://stud210302.idi.ntnu.no:3000",
    WEBSOCKET_URL: "ws://stud210302.idi.ntnu.no:3000",
  },
};
const dev = {
  url: {
    API_URL: "http://localhost:3000/api",
    FILE_URL: "http://localhost:3000",
    WEBSOCKET_URL: "ws://localhost:3000",
  },
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;