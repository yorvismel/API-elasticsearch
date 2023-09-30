require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const { ELASTICSEARCH_HOST, ELASTICSEARCH_PORT, END_POINT } = process.env;

const client = new Client({
  node: `http://localhost:9200`,
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
        // Si hay resultados, enviar una respuesta exitosa con los resultados
        res.json({
          success: true,
          message: "Búsqueda exitosa",
          results: hits.hits,
        });
      } else {
        // Si no hay resultados, enviar un mensaje de éxito sin resultados
        res.json({ success: true, message: "Productos encontrados", response });
      }
    } else {
      // Si no hay propiedad "hits" en la respuesta, enviar un mensaje de éxito sin resultados
      res.json({ success: true, message: "Productos encontrados", response });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
};
module.exports = { getDocument, addDocuments, updateResource, searchDocuments };
