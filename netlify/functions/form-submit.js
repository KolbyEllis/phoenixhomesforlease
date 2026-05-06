"use strict";

const BLOCKED_PHRASE = "I currently own several rental units across Arizona and am looking for a dependable property manager who can oversee these properties effectively. As I work toward expanding my real estate portfolio, managing everything on my own has become increasingly demanding, and I'm reaching the point where I need dedicated support to ensure everything continues to run smoothly.";

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function parseFormBody(rawBody) {
    const parsed = new URLSearchParams(rawBody || "");
    const fields = {};

    for (const [key, value] of parsed.entries()) {
        fields[key] = value;
    }

    return fields;
}

function buildRedirectUrl(event) {
    const referer = event.headers.referer || event.headers.referrer;
    if (!referer) {
        return "/";
    }

    const url = new URL(referer);
    url.searchParams.set("submitted", "1");
    return url.toString();
}

function getSiteUrl(event) {
    if (process.env.URL) {
        return process.env.URL;
    }

    const host = event.headers["x-forwarded-host"] || event.headers.host;
    const protocol = event.headers["x-forwarded-proto"] || "https";
    return `${protocol}://${host}`;
}

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body || "", "base64").toString("utf8")
        : (event.body || "");

    const fields = parseFormBody(rawBody);
    const combinedValues = normalizeText(Object.values(fields).join(" "));

    if (combinedValues.includes(normalizeText(BLOCKED_PHRASE))) {
        return {
            statusCode: 403,
            body: "Blocked submission."
        };
    }

    const formName = fields["form-name"] || fields["formName"];
    if (!formName) {
        return {
            statusCode: 400,
            body: "Missing form-name."
        };
    }

    const encoded = new URLSearchParams(fields).toString();
    const captureResponse = await fetch(`${getSiteUrl(event)}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: encoded
    });

    if (!captureResponse.ok) {
        return {
            statusCode: 502,
            body: "Could not process submission."
        };
    }

    return {
        statusCode: 303,
        headers: {
            Location: buildRedirectUrl(event)
        },
        body: ""
    };
};
