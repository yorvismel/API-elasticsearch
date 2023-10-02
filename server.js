const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./src/routes/elasticRoutes");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
