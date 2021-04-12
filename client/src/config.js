// Constants.js
const prod = {
  url: {
    API_URL: "https://stud210302.idi.ntnu.no:3000/api",
    FILE_URL: "https://stud210302.idi.ntnu.no:3000",
    WEBSOCKET_URL: "wss://stud210302.idi.ntnu.no:3000",
  },
};
const dev = {
  url: {
    API_URL: "https://localhost:3000/api",
    FILE_URL: "https://localhost:3000",
    WEBSOCKET_URL: "wss://localhost:3000",
  },
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;