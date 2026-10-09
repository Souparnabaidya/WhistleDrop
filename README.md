# WhistleDrop — Anonymous Reporting API

WhistleDrop is a backend API for submitting anonymous reports and checking their progress using a unique case code. It also provides protected moderator endpoints for reviewing reports and updating their status.

## Features

* Anonymous report submission without a reporter account.
* Report categories: Security, Harassment, Corruption, Technical, and Other.
* Unique case codes for checking report status.
* Optional evidence or reference URL.
* Protected moderator authentication using JWT.
* Moderator report listing and filtering.
* Controlled report-status transitions.
* Request validation and structured error responses.
* Rate limiting and HTTP security headers.
* Interactive API documentation with Swagger UI.
* Automated API tests.

## Technology Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JSON Web Tokens (JWT)
* bcryptjs
* Helmet
* express-rate-limit
* Swagger / OpenAPI
* Node.js test runner

## Prerequisites

Install the following before running the project:

* Node.js and npm
* Git
* A MongoDB database, such as MongoDB Atlas
* Postman or a similar API client (optional)

## Installation

Clone the repository:

```bash
git clone https://github.com/Souparnabaidya/WhistleDrop.git
cd WhistleDrop
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a local `.env` file in the project root. You can use `.env.example` as a template.

Configure these variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=replace_with_a_long_random_secret
MODERATOR_USERNAME=your_moderator_username
MODERATOR_PASSWORD=replace_with_a_strong_password
CORS_ORIGIN=http://localhost:3000
```

Replace all placeholder values with your own configuration. Never commit `.env` or expose database credentials, moderator passwords, or JWT secrets.

Use a long, randomly generated JWT secret and a strong, unique moderator password.

## Create or Update the Moderator

After configuring `.env`, run:

```bash
node scripts/createModerator.js
```

This script creates or updates the moderator account using the configured environment variables.

## Run the API

Start the server:

```bash
node server.js
```

The default local API address is:

http://localhost:3000

The root endpoint should return a welcome response when the server is running.

## API Documentation

Swagger UI:

http://localhost:3000/api-docs

OpenAPI JSON:

http://localhost:3000/api-docs.json

These local URLs work while the server is running on your computer.

## API Endpoints

### Public endpoints

| Method | Endpoint                 | Purpose                            |
| ------ | ------------------------ | ---------------------------------- |
| GET    | `/`                      | API welcome response               |
| POST   | `/api/reports`           | Submit an anonymous report         |
| GET    | `/api/reports/:caseCode` | Check a report using its case code |
| POST   | `/api/auth/login`        | Authenticate a moderator           |

### Protected moderator endpoints

Moderator endpoints require a valid JWT access token in the HTTP `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

| Method | Endpoint                                  | Purpose                                  |
| ------ | ----------------------------------------- | ---------------------------------------- |
| GET    | `/api/moderator/reports`                  | List reports and apply supported filters |
| PATCH  | `/api/moderator/reports/:caseCode/status` | Update a report's status                 |

Consult Swagger UI and the route definitions for the exact request-body formats and supported query parameters.

## Report Workflow

The intended status workflow is:

```text
SUBMITTED
    |
    v
UNDER_REVIEW
    |
    +----> RESOLVED
    |
    +----> DISMISSED
```

`RESOLVED` and `DISMISSED` are terminal statuses.

## Example: Submit a Report

Send a `POST` request to:

```text
http://localhost:3000/api/reports
```

Example JSON body:

```json
{
  "category": "Technical",
  "description": "A technical issue needs to be reviewed.",
  "evidenceUrl": "https://example.com/evidence"
}
```

The evidence URL is optional. Use only evidence URLs you are authorized to share.

A successful submission returns a unique case code. Save it securely because it is used to check the report's progress.

## Example: Check Report Status

Replace `YOUR_CASE_CODE` with the code returned when submitting a report:

```text
GET http://localhost:3000/api/reports/YOUR_CASE_CODE
```

The public status response is designed to avoid exposing the report description, evidence URL, or internal MongoDB identifier.

## Testing

Run the automated tests:

```bash
npm test
```

The test suite requires the dependencies and environment configuration expected by the project. If tests depend on MongoDB or a running API server, make sure those prerequisites are available.

## Security and Privacy

* Public reporting does not require a reporter account.
* Case codes are used to retrieve report status.
* Moderator routes are protected by JWT authentication.
* Moderator passwords are hashed using bcryptjs.
* Inputs are validated before report creation and status changes.
* Rate limiting and security headers help reduce common API risks.
* Environment secrets must remain outside version control.

**Privacy note:** Anonymous application-level reporting does not by itself guarantee complete anonymity. Hosting providers, network infrastructure, logs, or operational configuration may still expose metadata. Avoid including personally identifying information in report descriptions or evidence URLs.

## Project Structure

```text
WhistleDrop/
├── controllers/
├── middleware/
├── models/
├── routes/
├── scripts/
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── swagger.js
```

## Current Scope and Limitations

WhistleDrop provides the backend for anonymous reporting and moderator workflows. It does not require a frontend for API demonstrations. A user interface, production deployment, and additional security review may be added as future improvements.

## License

No license has been specified yet. All rights are reserved by default unless a license is added to this repository.
