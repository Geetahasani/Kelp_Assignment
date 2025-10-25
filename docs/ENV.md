# Environment configuration

The app reads configuration from environment variables. A sample file is located at `env/sample.env` and contains these keys:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
CSV_FILE_PATH=data/data.csv
```

Descriptions
- PORT — Port where Express listens (default in sample: 3000).
- DB_HOST — PostgreSQL host (e.g. localhost or a DB host string).
- DB_PORT — PostgreSQL port (default 5432).
- DB_USER / DB_PASSWORD / DB_NAME — Credentials and database name used by Sequelize.
- CSV_FILE_PATH — Path to the CSV file to parse. Can be relative to the project root (e.g. `data/data.csv`) or an absolute path.

Using the sample file
1. Copy the sample to the path used by the project's dev script:

   cp env/sample.env env/.env.dev

2. Edit `env/.env.dev` to set your DB credentials and the path to your CSV file.

Notes
- The current CSV parsing workflow expects `CSV_FILE_PATH` to point at a readable CSV file on disk. The `preview` and `upload` endpoints both use the parser which reads from this path.
- If you want to provide CSVs per-request (file uploads), the application will need a small change to accept multipart form-data and pass the uploaded stream to the parser.
