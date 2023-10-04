const express = require("express");
const { client } = require("../elasticsearchConfig");
const router = express.Router();

const addDocuments = async (req, res, next) => {
  try {
    const { indexName } = req.params;
    const { documents } = req.body;

    // Ensure 'indexName' and 'documents' are provided
    if (!indexName || !documents) {
      return res
        .status(400)
        .json({ message: "Both 'indexName' and 'documents' are required." });
    }

    // Prepare the request body for bulk indexing
    const body = documents.flatMap((doc) => [
      { index: { _index: indexName } },
      doc,
    ]);

    // Execute the bulk indexing operation
    const { body: bulkResponse } = await client.bulk({ refresh: true, body });

    // Check for errors in the bulk response
    if (bulkResponse && bulkResponse.errors) {
      const erroredDocuments = [];

      // Extract information about errored documents
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];

        if (action[operation].error) {
          erroredDocuments.push({
            index: i,
            error: action[operation].error,
          });
        }
      });

      // Return an error response with details of failed documents
      return res.status(400).json({
        message: "Some documents failed to be indexed.",
        errors: erroredDocuments,
      });
    }

    // Return a success response when all documents are indexed
    res.status(201).json({ message: "Documents added successfully", body });
  } catch (error) {
    console.error("Error in addDocuments:", error);
    next(error);
  }
};

const updateDocuments = async (req, res, next) => {
  try {
    const { indexName, id } = req.params;
    const document = req.body;

    const body = await client.index({
      index: indexName,
      id,
      body: document,
      refresh: true,
    });

    res.status(201).json({ message: "Document updated successfully", body });
  } catch (error) {
    console.error("Error in addDocument:", error);
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
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

const searchDocumentsFilters = async (req, res, next) => {
  const { indexName } = req.params;
  const { q, filters } = req.query;
  try {
    const filtersArray = filters.split(",").map(parseFilter);

    if (!isValidFilters(filtersArray)) {
      return res.status(400).json({ error: "Invalid filters" });
    }
    const query = buildQuery(q, filtersArray);
    const response = await client.search({ index: indexName, body: { query } });

    if (!response.body || !response.body.hits) {
      return res.json({ success: true, message: "Success search", response });
    }

    const hits = response.body.hits;
    const results = hits.total.value > 0 ? hits.hits : [];

    return res.json({ success: true, message: "Success search", results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error search" });
  }
};

const parseFilter = (filter) => {
  const [field, value] = filter.split(":");
  return { match: { [field]: value } };
};

const isValidFilters = (filtersArray) => {
  if (!Array.isArray(filtersArray)) {
    return false;
  }

  for (const filter of filtersArray) {
    if (!filter.match || typeof filter.match !== "object") {
      return false;
    }
    const matchKeys = Object.keys(filter.match);

    if (matchKeys.length !== 1) {
      return false;
    }

    const field = matchKeys[0];
    const value = filter.match[field];

    if (typeof field !== "string" || typeof value !== "string") {
      return false;
    }
  }

  return true;
};

const buildQuery = (q, filtersArray) => {
  return {
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
};

const getAllDocumentsInIndex = async (req, res) => {
  const { indexName } = req.params;

  try {
    let response = await client.search({
      index: indexName,
      size: 100, // Adjust the maximum size of results according to your needs.
      scroll: "1m", // Set a 'scroll' time to paginate the results.
      body: {
        query: {
          match_all: {}, // Retrieve all documents.
        },
      },
    });

    if (
      !response.body ||
      !response.body.hits ||
      response.body.hits.hits.length === 0
    ) {
      return res
        .status(202)
        .json({ message: "All documents index :", indexName, response });
    }
  } catch (error) {
    console.error("Error when retrieving documents from Elasticsearch:", error);
    res
      .status(500)
      .json({ error: "Error when retrieving documents from Elasticsearch" });
  }
};

module.exports = {
  getDocumentById,
  addDocuments,
  updateDocuments,
  searchDocumentsFilters,
  getAllDocumentsInIndex,
};
