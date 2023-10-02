require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");
const { END_POINT, API_KEY_KIBANA } = process.env;

const client = new Client({
  node: END_POINT,

  auth: {
    apiKey: API_KEY_KIBANA,
  },
});

module.exports = { client };
