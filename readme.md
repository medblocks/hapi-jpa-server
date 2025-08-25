## HAPI FHIR JPA Server (Docker)

This repo is a minimal setup to test the HAPI FHIR JPA Server (Java) using the `$validate` operation exposed by a HAPI FHIR server. It spins up:

- A HAPI FHIR server container
- A tiny Node.js service that calls the server's `$validate` endpoint

Reference: [hapifhir/org.hl7.fhir.core](https://github.com/hapifhir/org.hl7.fhir.core)

### Prerequisites

- Docker (and Docker Compose v2: `docker compose`)

### Quick start

1) Start the stack (builds the Node image and starts both services):

```bash
docker compose up --build
```

2) When up, you can access:

- HAPI FHIR UI: `http://localhost:8080/`
- HAPI FHIR REST base: `http://localhost:8080/fhir`
- Validator API (Node): `http://localhost:3001`

### Usage

- Health check:

```bash
curl http://localhost:3001/health
```

- Validate a default sample Patient (server performs `$validate`):

```bash
curl http://localhost:3001/validate | jq
```

- Validate your own resource by POSTing FHIR JSON:

```bash
curl -X POST http://localhost:3001/validate \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [{ "family": "Doe", "given": ["Jane"] }],
    "gender": "female",
    "birthDate": "1990-01-01"
  }' | jq
```

### Configuration

The Node service supports the following environment variables (already set in `docker-compose.yml`):

- `FHIR_BASE_URL`: Base URL of the HAPI FHIR server (defaults to `http://hapi:8080/fhir` inside Compose)
- `PORT`: Port for the Node service (defaults to `3001`)

### Stop the stack

```bash
docker compose down
```

### Notes

- This project is only for quick validation testing against a local HAPI FHIR server.
- For details about the HAPI FHIR core and validator, see the official repository: [hapifhir/org.hl7.fhir.core](https://github.com/hapifhir/org.hl7.fhir.core).


