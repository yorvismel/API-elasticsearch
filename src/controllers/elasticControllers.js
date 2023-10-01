require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const {   END_POINT,  API_KEY_KIBANA } = process.env;

const client = new Client({
  node: END_POINT,
  auth: {
    apiKey: API_KEY_KIBANA
  },
});


const addDocuments = async (req, res, next) => {
  try {
    const { indexName } = req.params;
    const { documents } = req.body;

    const body = documents.flatMap((doc) => [
      { index: { _index: indexName } },
      doc,
    ]);

    const { body: bulkResponse } = await client.bulk({ refresh: true, body });
    console.log("Bulk Response:", body);
    if (bulkResponse && bulkResponse.errors) {
      const erroredDocuments = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            index: i,
            error: action[operation].error,
          });
        }
      });

      console.log("Errored Documents:", erroredDocuments);
      res.status(400).json({
        message: "Some documents failed to be indexed.",
        errors: erroredDocuments,
      });
    } else {
      res.status(201).json({ message: "Documents added successfully", body });
    }
  } catch (error) {
    console.error("Error in addDocuments:", error);
    next(error);
  }
};
const updateResource = async (req, res, next) => {
  try {
    const { indexName, id } = req.params;
    const document = req.body;

    const body = await client.index({
      index: indexName,
      id,
      body: document,

      refresh: true,
    });

    console.log("Document Index Response:", body);

    res.status(201).json({ message: "Document updated successfully", body });
  } catch (error) {
    console.error("Error in addDocument:", error);
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const { indexName, id } = req.params;

    const response = await client.get({
      index: indexName,
      id: id,
    });

    if (!response) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.status(200).json({ document: response });
  } catch (error) {
    console.error("Error in getDocument:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const searchDocuments = async (req, res, next) => {
  const { indexName } = req.params;
  const { q, filters } = req.query;
  console.log("indexName", indexName);
  console.log("q", q);
  console.log("filters", filters);
  try {
    const filtersArray = filters.split(",").map((filter) => {
      const [field, value] = filter.split(":");
      console.log("field, value:", field, value);
      return {
        match: {
          [field]: value,
        },
      };
    });
    console.log("filtersArray:", filtersArray);
    const query = {
      bool: {
        must: [
          {
            query_string: {
              query: q,
              default_operator: "AND",
            },
          },
          ...filtersArray,
        ],
      },
    };
    console.log("const query:", query);
    console.log("ultimo filtersArray:", filtersArray);
    const response = await client.search({
      index: indexName,
      body: { query },
    });
    console.log("response", response);
    if (response.body && response.body.hits) {
      const hits = response.body.hits;

      if (hits.total.value > 0) {
        // If there are results, send a successful response with the results.
        res.json({
          success: true,
          message: "Success search",
          results: hits.hits,
        });
      } else {
        // If there are no results, send a success message with no results.
        res.json({ success: true, message: "Productos encontrados 1", response });
      }
    } else {
      // If there is no 'hits' property in the response, send a success message with no results.
      res.json({ success: true, message: "Productos encontrados 2", response });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error search" });
  }
};
module.exports = { getDocument, addDocuments, updateResource, searchDocuments };
