# Algolia Uploader

The uploader supports the following operations:

- Record create
- Record update

It does this by leveraging Algolia's API, specifically the methods `saveObjects` and `partialUpdateObjects`; For performance reasons records are chunked and uploaded in batches.

## Ingest

### Full import

This runs a full import against a data source and will ingest all fields within the data. If a record does not exist then it will create a new record. Existing records will be fully overwritten with data from the data source.

To run the full import configure the `INDEX_NAME` and `DATA_SOURCE` in the file `ingestData.ts`. The ingest process can then be run using the npm command `npm run import`;

### Partial import

This runs a partial update and is designed to ingest smaller groups of records and optionally only specific fields within those records. The `fieldsToUpdate` parameter allows for an array of strings to be passed containing the fields to update, only fields in this array will be ingest into the index all other fields will be ignored.

To run the partial import configure the `INDEX_NAME` and `DATA_SOURCE` in the file `updateData.ts`. The ingest process can then be run using the npm command `npm run update`;

## Data sources

The uploader supports the following data sources:

- XML files
- JSON files
- XML string
- JSON objects

Passing any of these types as the `DATA_SOURCE` will ingest the data into Algolia.

## Configuration

- `maxChunkSize` - Defaults to 10MB. Used to set the data size of each chunk to upload. It's recommended to keep this around 10MB for performance reasons.
