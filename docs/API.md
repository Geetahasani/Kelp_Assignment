# API Reference

Base path: http://localhost:<PORT>/api/csv (replace `<PORT>` with the `PORT` env var, e.g. 3000)

1) Preview parsed CSV

- Method: GET
- Path: /api/csv/preview
- Description: Parse the CSV located at `CSV_FILE_PATH` and return the parsed records as JSON. This endpoint does not modify the database.

Example request

```
curl -s http://localhost:3000/api/csv/preview
```

Successful response (200)

```
{
  "success": true,
  "message": "CSV parsed successfully",
  "totalRecords": 123,
  "records": [
    {
      "name": { "firstName": "John", "lastName": "Doe" },
      "age": 32,
      "address": "123 Main St",
      "additional_field": "..."
    },
    ...
  ]
}
```

Errors
- 404 — "No records found in CSV file." when file exists but has no usable rows.
- 500 — parsing/IO error (see response `error` message).

2) Upload & process CSV

- Method: POST
- Path: /api/csv/upload
- Description: Parse the CSV and bulk-insert the parsed records into the database. After inserting, the server will compute an age distribution report and return it. Note: the current implementation reads the CSV from disk according to `CSV_FILE_PATH`; this endpoint does not accept a file upload payload.

Example request

```
curl -X POST -s http://localhost:3000/api/csv/upload
```

Successful response (200)

```
{
  "message": "Data uploaded & processed",
  "distribution": {
    "<20": "5.00",
    "20-40": "60.00",
    "40-60": "30.00",
    ">60": "5.00"
  }
}
```

Errors
- 400 — when parsing completed but no records were found in CSV (response contains a `message`).
- 500 — server error during parse/DB insert (response contains `error`).

Notes
- The CSV parser will log warnings for rows missing mandatory fields (for example `name.firstName`, `name.lastName`, or `age`) but will continue processing other rows.
- If you want per-request CSV uploads from clients, the route should be updated to accept multipart form-data and the parser adapted to parse a stream from the uploaded file instead of reading `CSV_FILE_PATH`.
