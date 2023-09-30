const express = require("express");
const router = express.Router();
const {
  addDocuments,
  updateResource,
  getDocument,
  searchDocuments,
} = require("../controllers/elasticControllers");

router.post("/:indexName/documents", addDocuments);
router.put("/:indexName/documents/:id", updateResource);
router.get("/:indexName/documents/:id", getDocument);
router.get("/:indexName/search", searchDocuments);

module.exports = router;
