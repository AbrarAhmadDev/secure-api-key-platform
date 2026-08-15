# Secure API Key Platform

A production style API platform that provides authenticated access to protected data through secure API keys. The platform allows users to create accounts, generate and manage API keys, make authenticated API requests, enforce rate limits, and test API endpoints through a web dashboard.

The project demonstrates the core infrastructure behind modern API products, including API key authentication, secure key storage, authorization, rate limiting, database security, API gateway logic, and developer tooling.

## Overview

The platform consists of two primary components:

1. A web dashboard where users authenticate and manage their API keys.
2. A protected API endpoint that validates API keys, applies rate limits, queries the database, and returns JSON responses.

The example implementation exposes a fictional property dataset, but the architecture can be adapted to almost any structured dataset or backend service.

## Features

* User registration and authentication
* Secure API key generation
* SHA 256 hashing of API keys
* One time display of newly generated API keys
* API key revocation
* Per user API rate limiting
* PostgreSQL Row Level Security
* Supabase Edge Function API gateway
* Query filtering
* Sorting
* Pagination
* Built in API tester
* JSON response viewer
* HTTP status monitoring
* Protected database access
* Environment based configuration

## Architecture

```text
                         Frontend
                      React + Vite
                           |
                           v
                    Supabase Auth
                    Login / Signup
                           |
                           v
                  API Key Management
                Create / List / Delete
                           |
                           v
                    API Tester
                           |
                           v
                  Supabase Edge Function
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        Validate Key   Rate Limit   Request Parsing
             |             |             |
             +-------------+-------------+
                           |
                           v
                     PostgreSQL
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
         properties    api_keys    api_requests
                           |
                           v
                       JSON API
```

## Technology Stack

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| React                   | Frontend dashboard                     |
| Vite                    | Frontend development and build tooling |
| Supabase Auth           | User authentication                    |
| Supabase PostgreSQL     | Database                               |
| Supabase Edge Functions | API gateway                            |
| PostgreSQL RLS          | Database access control                |
| Deno                    | Edge Function runtime                  |
| JavaScript              | Frontend implementation                |
| TypeScript              | Edge Function implementation           |
| SHA 256                 | API key hashing                        |

## API Key Management

API keys are generated in the following format:

```text
sk_live_test_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The raw API key is never stored in the database.

When a key is created, the system performs the following process:

```text
Generate API Key
       |
       v
Raw API Key
       |
       v
SHA 256 Hash
       |
       v
Store Hash
       |
       v
Return Raw Key Once
```

The user receives the complete API key through a one time display modal.

After the modal is closed, only a safe prefix is displayed in the dashboard.

```text
sk_live_ab12...
```

When a request reaches the API, the supplied API key is hashed and compared against the stored hash.

The database therefore never needs to contain the original secret.

## Rate Limiting

The API currently implements a rolling rate limit of five requests per minute per user.

```text
Request 1    200 OK
Request 2    200 OK
Request 3    200 OK
Request 4    200 OK
Request 5    200 OK
Request 6    429 Too Many Requests
```

The Edge Function identifies the user associated with the API key, checks the number of requests made during the previous sixty seconds, and rejects requests when the configured limit has been reached.

The rate limit can be adjusted depending on the requirements of the deployment.

## Database

The project uses three primary tables.

### properties

The `properties` table contains the data exposed through the API.

Example fields include:

```text
id
name
address
city
price
bedrooms
bathrooms
square_feet
year_built
property_type
has_garden
haunted
haunt_rating
status
listed_at
```

The example dataset uses fictional property and haunted house data.

### api_keys

The `api_keys` table stores API key metadata.

```text
id
user_id
key_name
key_hash
prefix
created_at
```

Only the hash and safe prefix are stored. Row Level Security ensures that authenticated users can only access their own API keys.

### api_requests

The `api_requests` table stores request records used by the rate limiting system.

```text
id
user_id
created_at
```

The table is intentionally restricted so that normal users cannot manipulate their own request counts.

## Security Model

The application uses multiple layers of security.

### API Key Hashing

API keys are hashed using SHA 256 before being stored.

```text
Client API Key
      |
      v
SHA 256
      |
      v
Stored Hash
```

### Row Level Security

PostgreSQL Row Level Security prevents users from accessing API keys belonging to other users.

The access policy is based on the authenticated user's ID.

```text
auth.uid() = user_id
```

### Protected Data

The `properties` table is not publicly accessible through the Supabase client.

Instead, requests pass through the Edge Function:

```text
Client
  |
  v
Edge Function
  |
  v
Authenticated Request
  |
  v
Database
```

This ensures that the API gateway controls access to the underlying data.

### API Key Revocation

Deleting an API key immediately prevents that key from being used for subsequent API requests.

## Dashboard

The frontend provides a web interface for managing API access.

### Authentication

Users can create accounts, sign in, and sign out through Supabase Authentication.

![Login](screenshots/login.png)

### API Key Creation

Users can specify a name for their API key and generate a new credential.

![API Key Creation](screenshots/create-key.png)

The complete key is displayed once and should be copied before closing the dialog.

### API Key Management

Existing API keys are displayed using their safe prefixes.

Users can also delete keys to revoke access.

![Dashboard](screenshots/dashboard.png)

## API Tester

The dashboard contains an integrated API tester that allows users to make authenticated requests without requiring an external API client.

Available filters include:

| Filter         | Query                     |
| -------------- | ------------------------- |
| All            | `/properties-api`         |
| Haunted Only   | `?haunted=true`           |
| Castles        | `?property_type=castle`   |
| Cheapest First | `?sort=price_asc`         |
| Most Haunted   | `?sort=haunt_rating_desc` |
| First 5        | `?limit=5&page=1`         |

![API Tester](screenshots/api-tester.png)

The tester displays the HTTP status code and formatted JSON response.

Incase the rate limit has reached, it denies the request

![API Tester](screenshots/rate-limit.png)

## API Usage

Once an API key has been generated, it can be used from any application capable of making HTTP requests.

### Example Request

```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/properties-api" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "x-api-key: sk_live_YOUR_API_KEY"
```

The API requires two headers.

`Authorization` allows the request to pass through the Supabase gateway.

`x-api-key` contains the user's API credential and is validated by the Edge Function.

## Query Parameters

### Filter Haunted Properties

```text
?haunted=true
```

### Filter by Property Type

```text
?property_type=castle
```

### Filter by Minimum Price

```text
?minPrice=500000
```

### Sort by Price

```text
?sort=price_asc
```

### Sort by Haunt Rating

```text
?sort=haunt_rating_desc
```

### Pagination

```text
?limit=10&page=2
```

Multiple parameters can be combined.

```text
?haunted=true&sort=haunt_rating_desc&limit=5
```

## API Response

A successful request returns JSON.

```json
[
  {
    "id": "uuid",
    "name": "The Wobbling Manor",
    "address": "1 Teetering Lane",
    "city": "Bath",
    "price": 2400000,
    "bedrooms": 6,
    "bathrooms": 4,
    "property_type": "castle",
    "haunted": true,
    "haunt_rating": 5
  }
]
```

## Error Responses

### Missing API Key

```json
{
  "error": "Missing API key"
}
```

HTTP status:

```text
401 Unauthorized
```

### Invalid API Key

```json
{
  "error": "Invalid API key"
}
```

HTTP status:

```text
401 Unauthorized
```

### Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded"
}
```

HTTP status:

```text
429 Too Many Requests
```

### Internal Server Error

```json
{
  "error": "Something went wrong"
}
```

HTTP status:

```text
500 Internal Server Error
```

## Project Structure

```text
secure-api-key-platform/
|
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── main.jsx
│   └── subabaseClient.js
|
├── src/
│   ├── login.png
│   ├── dashboard.png
│   ├── create-key.png
│   ├── api-tester.png
│   └── limit-api.png
│
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
|
└── README.md
```

## Getting Started

### Prerequisites

The project requires:

* Node.js 18 or later
* A Supabase account
* Supabase CLI
* A code editor

The implementation can be deployed using the free Supabase tier.

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/secure-api-key-platform.git

cd secure-api-key-platform
```

### Create a Supabase Project

Create a new Supabase project and obtain the project URL and publishable or anonymous key.

The service role key must remain server side and must never be exposed through frontend environment variables.

### Configure the Database

Run the database schema through the Supabase SQL Editor.

This creates the required tables, RLS policies, API key generation function, and rate limiting infrastructure.

### Configure the Edge Function

Install the Supabase CLI:

```bash
npm install -g supabase
```

Authenticate:

```bash
supabase login
```

Link the project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy the Edge Function:

```bash
supabase functions deploy properties-api --no-verify-jwt
```

The API becomes available at:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/properties-api
```

The deployment process and endpoint structure follow the project implementation.

## Frontend Setup

Create the React application:

```bash
npm create vite@latest api-dashboard -- --template react
```

Install dependencies:

```bash
cd api-dashboard
npm install
npm install @supabase/supabase-js
```

## Environment Variables

Create a `.env` file in the frontend project:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_FUNCTION_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/properties-api
```

Only the public publishable or anonymous key should be used in the frontend. Never place the Supabase service role key in a `VITE_` environment variable.

## Run Locally

```bash
npm run dev
```

The application will be available at the local URL provided by Vite, typically:

```text
http://localhost:5173
```

## End to End Flow

```text
User Registration
       |
       v
User Login
       |
       v
Create API Key
       |
       v
Copy Key
       |
       v
API Tester
       |
       v
Edge Function
       |
       +---- Validate API Key
       |
       +---- Check Rate Limit
       |
       +---- Parse Query Parameters
       |
       +---- Query Database
       |
       v
JSON Response
```

## Security Testing

### Invalid Key

Send a request with an invalid API key.

Expected result:

```text
401 Invalid API key
```

### Rate Limit

Send more than five requests within the configured rolling minute.

Expected result:

```text
429 Rate limit exceeded
```

### Revoked Key

Delete an API key from the dashboard and attempt to use it again.

Expected result:

```text
401 Invalid API key
```

These tests verify API authentication, rate limiting, and key revocation.

## License

This project is licensed under the MIT License.

## Author

Developed as a demonstration of secure API infrastructure using Supabase, PostgreSQL, React, and Edge Functions.
