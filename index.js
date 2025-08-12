import express from "express";
import fetch from "node-fetch";

// Base URL for the HAPI FHIR server
const baseUrl = process.env.FHIR_BASE_URL || "http://localhost:8080/fhir";

// Default example resource
const defaultPatient = {
  resourceType: "Patient",
  name: [{ family: "Doe", given: ["Jane"] }],
  gender: "female",
  birthDate: "1990-01-01"
};

async function validateResource(resource) {
  const url = `${baseUrl}/Patient/$validate`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/fhir+json" },
      body: JSON.stringify(resource)
    });
    const outcome = await response
      .json()
      .catch(() => ({ message: "Invalid JSON from server" }));
    return { status: response.status, outcome };
  } catch (error) {
    return {
      status: 503,
      outcome: {
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "exception",
            details: {
              text: `HAPI server not reachable at ${baseUrl}. ${error?.message || "Connection error"}`
            }
          }
        ]
      }
    };
  }
}

const app = express();

// Parse JSON and FHIR+JSON with a 5MB limit
app.use(
  express.json({
    limit: "5mb",
    type: ["application/json", "application/fhir+json"],
  })
);

// Handle invalid JSON bodies consistently
app.use((err, _req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  // Some environments throw SyntaxError
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  return next(err);
});

// Health check
app.get("/health", (_req, res) => {
  res.set("Content-Type", "text/plain");
  res.status(200).send("ok");
});

// Validate default patient on GET
app.get("/validate", async (_req, res) => {
  const { status, outcome } = await validateResource(defaultPatient);
  res.status(status).json({ status, outcome });
});

// Validate posted resource on POST
app.post("/validate", async (req, res) => {
  const resource = req.body && Object.keys(req.body).length > 0 ? req.body : defaultPatient;
  const { status, outcome } = await validateResource(resource);
  res.status(status).json({ status, outcome });
});

// 404 for other routes
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Validate default patient: GET http://localhost:${port}/validate`);
  // eslint-disable-next-line no-console
  console.log(`Validate posted resource: POST http://localhost:${port}/validate`);
});
