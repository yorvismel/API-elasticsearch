const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const routes = require("./src/routes/elasticRoutes");


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/", routes);
app.use('/api-docs-v1', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
});
