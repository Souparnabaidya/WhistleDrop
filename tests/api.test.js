require("dotenv").config();
const { test } = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
    return fetch(`${BASE_URL}${path}`, options);
}

function jsonOptions(method, body, token) {
    return {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    };
}

test("WhistleDrop API integration tests", async (t) => {
    let token;
    let createdReportId;

    await t.test("Home endpoint returns 200", async () => {
        const response = await request("/");
        assert.equal(response.status, 200);

        const data = await response.json();
        assert.equal(data.message, "Welcome to WhistleDrop API");
    });

    await t.test("Swagger documents all five endpoints", async () => {
        const response = await request("/api-docs.json");
        assert.equal(response.status, 200);

        const spec = await response.json();
        assert.ok(spec.paths["/api/reports"]);
        assert.ok(spec.paths["/api/reports/{caseCode}"]);
        assert.ok(spec.paths["/api/auth/login"]);
        assert.ok(spec.paths["/api/moderator/reports"]);
        assert.ok(spec.paths["/api/moderator/reports/{id}"]);
    });

    await t.test("Rejects a non-string description", async () => {
        const response = await request(
            "/api/reports",
            jsonOptions("POST", {
                category: "Technical",
                description: 123
            })
        );

        assert.equal(response.status, 400);
    });

    await t.test("Rejects javascript evidence URLs", async () => {
        const response = await request(
            "/api/reports",
            jsonOptions("POST", {
                category: "Technical",
                description: "Testing invalid evidence URL handling.",
                evidenceUrl: "javascript:alert(1)"
            })
        );

        assert.equal(response.status, 400);
    });

    await t.test("Rejects unauthenticated moderator access", async () => {
        const response = await request("/api/moderator/reports");
        assert.equal(response.status, 401);
    });

    await t.test("Moderator login succeeds", async () => {
        const response = await request(
            "/api/auth/login",
            jsonOptions("POST", {
                username: process.env.TEST_MODERATOR_USERNAME || "moderator",
                password: process.env.TEST_MODERATOR_PASSWORD || "Whiteriki@16always@mine"
            })
        );

        assert.equal(response.status, 200);

        const data = await response.json();
        assert.equal(data.success, true);
        assert.equal(typeof data.token, "string");
        assert.ok(data.token.length > 20);

        token = data.token;
    });

    await t.test("Moderator can list and filter reports", async () => {
        assert.ok(token, "Login test must succeed first");

        const response = await request("/api/moderator/reports?category=Technical", {
            headers: { Authorization: `Bearer ${token}` }
        });

        assert.equal(response.status, 200);

        const data = await response.json();
        assert.equal(data.success, true);
        assert.ok(Array.isArray(data.reports));
        assert.ok(data.reports.every(report => report.category === "Technical"));
    });

    await t.test("Submits a report and checks its status", async () => {
        const response = await request(
            "/api/reports",
            jsonOptions("POST", {
                category: "Technical",
                description: "Automated integration test report."
            })
        );

        assert.equal(response.status, 201);

        const data = await response.json();
        assert.match(data.caseCode, /^WD-[A-F0-9]{12}$/);
        assert.equal(data.status, "SUBMITTED");

        const lookup = await request(`/api/reports/${data.caseCode}`);
        assert.equal(lookup.status, 200);

        const lookupData = await lookup.json();
        assert.equal(lookupData.report.caseCode, data.caseCode);
        assert.equal(lookupData.report.status, "SUBMITTED");
        assert.equal("_id" in lookupData.report, false);

        // Save the MongoDB ID from the protected moderator listing.
        const listResponse = await request("/api/moderator/reports?category=Technical", {
            headers: { Authorization: `Bearer ${token}` }
        });

        assert.equal(listResponse.status, 200);
        const listData = await listResponse.json();

        const found = listData.reports.find(
            report => report.caseCode === data.caseCode
        );

        assert.ok(found, "New report should appear in moderator listing");
        createdReportId = found._id;
    });

    await t.test("Moderator moves report to UNDER_REVIEW", async () => {
        assert.ok(token);
        assert.ok(createdReportId);

        const response = await request(
            `/api/moderator/reports/${createdReportId}`,
            jsonOptions("PATCH", {
                status: "UNDER_REVIEW",
                statusUpdate: "Automated test: report is under review."
            }, token)
        );

        assert.equal(response.status, 200);

        const data = await response.json();
        assert.equal(data.report.status, "UNDER_REVIEW");
    });

    await t.test("Moderator resolves report", async () => {
        const response = await request(
            `/api/moderator/reports/${createdReportId}`,
            jsonOptions("PATCH", {
                status: "RESOLVED",
                statusUpdate: "Automated test: report resolved."
            }, token)
        );

        assert.equal(response.status, 200);

        const data = await response.json();
        assert.equal(data.report.status, "RESOLVED");
    });

    await t.test("Rejects an invalid status transition", async () => {
        const response = await request(
            `/api/moderator/reports/${createdReportId}`,
            jsonOptions("PATCH", {
                status: "UNDER_REVIEW"
            }, token)
        );

        assert.equal(response.status, 400);
    });
});