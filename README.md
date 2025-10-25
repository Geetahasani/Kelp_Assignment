## CSV to JSON Converter

A lightweight Node.js service that parses a CSV file (from disk), converts it to JSON records, writes users into a PostgreSQL database (via Sequelize), and exposes simple HTTP endpoints to preview or trigger processing.

This repository provides:
- a streaming CSV parser tolerant of quoted fields and embedded commas
- endpoints to preview parsed CSV data and to trigger upload/processing
- a sample environment file and DB wiring using Sequelize and pg

## Quick start

Prerequisites
- Node.js (14+ recommended; project uses CommonJS)
- PostgreSQL (if you plan to use the DB features)

Install

1. From the project root:

   npm install

2. Configure environment variables (see `env/sample.env`). You can copy the sample into an env file used by the dev script, for example:

   cp env/sample.env env/.env.dev

Run
- Development (the `dev` script loads dotenv with `env/.env.dev`):

   npm run dev

- Or run the server directly (it will use whatever env vars are available in your shell or loaded via dotenv in `server.js`):

   node server.js

By default the sample env sets `PORT=3000`. The app mounts CSV routes at `/api/csv`.

## API

Two simple endpoints are exposed by the service (mounted under `/api/csv`):

- GET /api/csv/preview — Parse the CSV (from the path in `CSV_FILE_PATH`) and return parsed records as JSON without writing to the DB.
- POST /api/csv/upload — Parse the CSV and bulk-insert user records into the DB, then return a simple age-distribution report.

See `docs/API.md` for full examples and sample responses.

## Environment

The project reads configuration from environment variables. A sample is provided at `env/sample.env`. Important variables:

- CSV_FILE_PATH — path to the CSV file to parse (used by both preview and upload)
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME — PostgreSQL connection values used by Sequelize
- PORT — HTTP server port

See `docs/ENV.md` for a detailed description and helpful hints.

## Project structure

```
csv-to-json-converter/
  server.js                # entry point that starts the HTTP server
  src/
    app.js                 # express app wiring and route mounting
    routes/csvRoutes.js    # /api/csv routes (preview, upload)
    controllers/csvController.js # controllers that call parseCSV and interact with DB
    services/csvParser.js  # streaming CSV parser and helpers
    config/db.js           # Sequelize / Postgres connection
    models/userModel.js    # Sequelize User model
  data/data.csv            # sample CSV used by `CSV_FILE_PATH`
  env/sample.env           # sample environment variables
```

## Notes & assumptions

- The current implementation reads the CSV from disk using the `CSV_FILE_PATH` env var. The `upload` endpoint triggers parsing and inserts into the DB — it does not accept a file upload payload from the HTTP request.
- The CSV parser supports nested keys using dot-notation headers (e.g. `name.firstName`, `name.lastName`) and converts an `age` header to a number.

If you'd like to change the behavior to accept file uploads directly from clients (multipart/form-data), I can add that in a follow-up.

## Contributing

Small, focused PRs are best. If you add features that change public behavior (API responses, env vars), please add or update the docs in `docs/`.

## License

Choose a license for your project (no license is currently specified in the repo). Add a `LICENSE` file if you want to make the project public with a specific license.
