# Elasticsearch API

## Description

🚀 This API provides access to data indexed in Elasticsearch, allowing for advanced searches and queries on data sets. It also supports indexing or adding new information. 💡

## Swagger Documentation

You can access the Swagger documentation for the API to get detailed descriptions of all endpoints and usage examples. [Swagger Documentation](https://elastic-api-p0us.onrender.com/api-docs-v1)

## Endpoints

### Create Documents in a Specific Index

- **URL**: `/{indexName}/documents`
- **HTTP Method**: POST
- **Description**: Endpoint for creating documents in the specified Elasticsearch index.
- **Path Parameters**:
  - `indexName` (string, required): The name of the index where the documents will be added.
- **Request Body**:
  ```json
  {
    "documents": "any"
  }
- **Responses**:
  - Code 201: Documents created successfully.
  - Code 400: Bad request.

### Update Document in a Specific Index by ID

- **URL**: `/{indexName}/documents/{id}`
- **HTTP Method**: PUT
- **Description**: Endpoint for updating a document in the specified Elasticsearch index by ID.
- **Path Parameters**:
  - `indexName` (string, required): The index name.
  - `id` (string, required): ID of the document to be updated.
- **Request Body**: The updated document.
- **Responses**:
  - Code 201: Document updated successfully.

### Get Document by ID

- **URL**: `/{indexName}/documents/{id}`
- **HTTP Method**: GET
- **Description**: Endpoint to get a document by ID from the specified Elasticsearch index.
- **Path Parameters**:
  - `indexName` (string, required): The index name.
  - `id` (string, required): ID of the requested document.
- **Responses**:
  - Code 200: Successful request.
  - Code 404: Document not found.
  - Code 500: Internal server error.

### Search and Query Documents

- **URL**: `/{indexName}/search`
- **HTTP Method**: GET
- **Description**: Endpoint for searching and querying data in the specified Elasticsearch index.
- **Path Parameters**:
  - `indexName` (string, required): The index name.
- **Query Parameters**:
  - `q` (string): The search query string.
  - `filters` (string): Optional filters to narrow down search results.
- **Responses**:
  - Code 200: Successful search.
  - Code 400: Bad request.
  - Code 500: Internal server error.

### Get All Documents in an Index

- **URL**: `/{indexName}/all_documents`
- **HTTP Method**: GET
- **Description**: Retrieve all documents within the specified Elasticsearch index.
- **Path Parameters**:
  - `indexName` (string, required): The index name.
- **Responses**:
  - Code 202: Request accepted for processing.
  - Code 500: Internal server error.

## Usage

To use this API, you can send requests to the corresponding endpoints using the provided descriptions.

## Author

Created by Yorvis Meléndez - yorvis.melendez@gmail.com


