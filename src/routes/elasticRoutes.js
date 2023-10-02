const express = require("express");
const router = express();
const {
  addDocuments,
  getDocumentById,
  getAllDocumentsInIndex,
  searchDocumentsFilters,
  updateDocuments,
} = require("../controllers/elasticControllers");

router.post("/:indexName/documents", addDocuments);
router.put("/:indexName/documents/:id", updateDocuments);
router.get("/:indexName/documents/:id", getDocumentById);
router.get("/:indexName/search", searchDocumentsFilters);
router.get("/:indexName/all_documents", getAllDocumentsInIndex);

module.exports = router;
